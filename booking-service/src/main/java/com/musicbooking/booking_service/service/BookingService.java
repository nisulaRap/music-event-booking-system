package com.musicbooking.booking_service.service;

import com.musicbooking.booking_service.dto.BookingRequest;
import com.musicbooking.booking_service.dto.EventDto;
import com.musicbooking.booking_service.model.Booking;
import com.musicbooking.booking_service.repository.BookingRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
 
import java.util.List;
import java.util.Map;
 
@Slf4j
@Service
@RequiredArgsConstructor
public class BookingService {
 
    private final BookingRepository bookingRepository;
    private final RestTemplate restTemplate;
 
    @Value("${event.service.url}")
    private String eventServiceUrl;
 
    @Value("${notification.service.url}")
    private String notificationServiceUrl;
 
    @Value("${user.service.url}")
    private String userServiceUrl;
 
    public Booking createBooking(String userId, BookingRequest request) {
        EventDto event = fetchEvent(request.getEventId());
 
        if (event.getAvailableSeats() < request.getSeats()) {
            throw new RuntimeException("Not enough available seats. Available: " + event.getAvailableSeats());
        }
 
        double total = event.getPrice() * request.getSeats();
        String userEmail = fetchUserEmail(userId);
 
        Booking booking = Booking.builder()
                .userId(userId)
                .userEmail(userEmail)
                .eventId(event.getId())
                .eventName(event.getName())
                .eventLocation(event.getLocation())
                .eventDate(event.getEventDate() != null ? event.getEventDate().toString() : "")
                .seats(request.getSeats())
                .pricePerSeat(event.getPrice())
                .totalPrice(total)
                .status("PENDING")
                .build();
 
        Booking saved = bookingRepository.save(booking);
 
        // Reserve seats in event-service
        try {
            reduceSeats(request.getEventId(), request.getSeats());
            log.info("Seats reserved: {} for eventId={}", request.getSeats(), request.getEventId());
        } catch (Exception e) {
            log.error("SEAT REDUCTION FAILED eventId={} seats={} error={}",
                    request.getEventId(), request.getSeats(), e.getMessage());
        }
 
        return saved;
    }
 
    public Booking confirmBooking(String bookingId, String paymentId) {
        Booking booking = getById(bookingId);
        booking.setStatus("CONFIRMED");
        booking.setPaymentId(paymentId);
        Booking confirmed = bookingRepository.save(booking);
 
        try {
            notifyBookingConfirmed(confirmed);
        } catch (Exception e) {
            log.warn("Notification failed: {}", e.getMessage());
        }
 
        return confirmed;
    }
 
    public Booking cancelBooking(String bookingId, String userId) {
        Booking booking = getById(bookingId);
        if (!booking.getUserId().equals(userId)) {
            throw new RuntimeException("Unauthorized");
        }
        if ("CANCELLED".equals(booking.getStatus())) {
            throw new RuntimeException("Booking already cancelled");
        }
 
        String previousStatus = booking.getStatus();
        booking.setStatus("CANCELLED");
        Booking cancelled = bookingRepository.save(booking);
 
        if (!"PENDING".equals(previousStatus) || true) {
            try {
                restoreSeats(booking.getEventId(), booking.getSeats());
                log.info("Seats restored: {} for eventId={}", booking.getSeats(), booking.getEventId());
            } catch (Exception e) {
                log.warn("Could not restore seats: {}", e.getMessage());
            }
        }
 
        // Send cancellation notification
        try {
            notifyBookingCancelled(cancelled);
        } catch (Exception e) {
            log.warn("Cancellation notification failed: {}", e.getMessage());
        }
 
        return cancelled;
    }
 
    public List<Booking> getMyBookings(String userId) {
        return bookingRepository.findByUserId(userId);
    }
 
    public Booking getById(String id) {
        return bookingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Booking not found: " + id));
    }
 
    public List<Booking> getAllBookings() {
        return bookingRepository.findAll();
    }

 
    private EventDto fetchEvent(String eventId) {
        try {
            ResponseEntity<EventDto> res = restTemplate.getForEntity(
                    eventServiceUrl + "/api/events/" + eventId, EventDto.class);
            if (res.getStatusCode().is2xxSuccessful() && res.getBody() != null) return res.getBody();
        } catch (Exception e) {
            log.error("Failed to fetch event {}: {}", eventId, e.getMessage());
        }
        throw new RuntimeException("Event not found or event-service unavailable");
    }
 
    private String fetchUserEmail(String userId) {
        try {
            ResponseEntity<Map> res = restTemplate.getForEntity(
                    userServiceUrl + "/api/users/" + userId + "/email", Map.class);
            if (res.getStatusCode().is2xxSuccessful() && res.getBody() != null) {
                Object email = res.getBody().get("email");
                return email != null ? email.toString() : null;
            }
        } catch (Exception e) {
            log.warn("Could not fetch user email for {}: {}", userId, e.getMessage());
        }
        return null;
    }
 
    private void reduceSeats(String eventId, int seats) {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        HttpEntity<Integer> entity = new HttpEntity<>(seats, headers);
        restTemplate.exchange(
                eventServiceUrl + "/api/events/" + eventId + "/reduce-seats",
                HttpMethod.PUT, entity, String.class);
    }
 
    private void restoreSeats(String eventId, int seats) {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        HttpEntity<Integer> entity = new HttpEntity<>(seats, headers);
        restTemplate.exchange(
                eventServiceUrl + "/api/events/" + eventId + "/restore-seats",
                HttpMethod.PUT, entity, String.class);
    }
 
    private void notifyBookingConfirmed(Booking booking) {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        Map<String, Object> payload = Map.of(
                "userId",     booking.getUserId(),
                "bookingId",  booking.getId(),
                "eventName",  booking.getEventName(),
                "seats",      booking.getSeats(),
                "totalPrice", booking.getTotalPrice(),
                "userEmail",  booking.getUserEmail() != null ? booking.getUserEmail() : ""
        );
        restTemplate.postForEntity(
                notificationServiceUrl + "/api/notifications/booking-confirmed",
                new HttpEntity<>(payload, new HttpHeaders() {{ setContentType(MediaType.APPLICATION_JSON); }}),
                String.class);
        log.info("Confirmation notification sent bookingId={} email={}", booking.getId(), booking.getUserEmail());
    }
 
    private void notifyBookingCancelled(Booking booking) {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        Map<String, Object> payload = Map.of(
                "userId",    booking.getUserId(),
                "eventName", booking.getEventName(),
                "bookingId", booking.getId(),
                "userEmail", booking.getUserEmail() != null ? booking.getUserEmail() : ""
        );
        restTemplate.postForEntity(
                notificationServiceUrl + "/api/notifications/booking-cancelled",
                new HttpEntity<>(payload, headers), String.class);
    }
}
