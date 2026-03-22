package com.musicbooking.booking_service.service;

import com.musicbooking.booking_service.dto.BookingRequest;
import com.musicbooking.booking_service.dto.BookingResponse;
import com.musicbooking.booking_service.dto.NotificationRequest;
import com.musicbooking.booking_service.exception.BookingNotFoundException;
import com.musicbooking.booking_service.exception.SeatAlreadyBookedException;
import com.musicbooking.booking_service.model.Booking;
import com.musicbooking.booking_service.model.BookingStatus;
import com.musicbooking.booking_service.repository.BookingRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * Core business logic for the Booking Service.
 *
 * <p>Responsibilities include:</p>
 * <ul>
 *   <li>Creating bookings with seat-lock enforcement</li>
 *   <li>Confirming and cancelling bookings</li>
 *   <li>Notifying the Notification Service on status changes</li>
 *   <li>Checking seat availability for an event</li>
 * </ul>
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class BookingService {

    /** Duration (in minutes) for which seats are locked in PENDING state. */
    private static final int SEAT_LOCK_MINUTES = 5;

    private final BookingRepository bookingRepository;
    private final RestTemplate restTemplate;

    @Value("${services.notification.url}")
    private String notificationServiceUrl;

    // -----------------------------------------------------------------------
    // Create
    // -----------------------------------------------------------------------

    /**
     * Creates a new PENDING booking, locking the requested seats for 5 minutes.
     *
     * <p>Uses a synchronized/atomic check to prevent concurrent double-booking:
     * the query for already-booked seats and the save operation are wrapped
     * inside a single synchronized block keyed on the eventId so that
     * concurrent requests for the same event cannot race past the availability
     * check simultaneously.</p>
     *
     * @param request validated booking request payload
     * @return the persisted booking as a {@link BookingResponse}
     * @throws SeatAlreadyBookedException when any requested seat is already booked or locked
     */
    public BookingResponse createBooking(BookingRequest request) {
        log.info("Creating booking for userId={} eventId={} seats={}",
                request.getUserId(), request.getEventId(), request.getSelectedSeats());

        // Intern the eventId string so we can synchronise on it cheaply.
        // This gives per-event locking without a global lock.
        synchronized (request.getEventId().intern()) {
            checkSeatsNotAlreadyBooked(request.getEventId(), request.getSelectedSeats());

            Booking booking = Booking.builder()
                    .bookingId(UUID.randomUUID().toString())
                    .userId(request.getUserId())
                    .eventId(request.getEventId())
                    .seats(request.getSelectedSeats())
                    .totalAmount(request.getTotalAmount())
                    .status(BookingStatus.PENDING)
                    .createdAt(LocalDateTime.now())
                    .expiresAt(LocalDateTime.now().plusMinutes(SEAT_LOCK_MINUTES))
                    .build();

            Booking saved = bookingRepository.save(booking);
            log.info("Booking created: id={} status={}", saved.getBookingId(), saved.getStatus());
            return toResponse(saved);
        }
    }

    // -----------------------------------------------------------------------
    // Read
    // -----------------------------------------------------------------------

    /**
     * Returns a single booking by its unique ID.
     *
     * @throws BookingNotFoundException if no booking exists for the given ID
     */
    public BookingResponse getBookingById(String bookingId) {
        log.info("Fetching booking: id={}", bookingId);
        Booking booking = findOrThrow(bookingId);
        return toResponse(booking);
    }

    /**
     * Returns all bookings belonging to a specific user.
     */
    public List<BookingResponse> getBookingsByUser(String userId) {
        log.info("Fetching all bookings for userId={}", userId);
        return bookingRepository.findByUserId(userId)
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    // -----------------------------------------------------------------------
    // Confirm
    // -----------------------------------------------------------------------

    /**
     * Confirms a PENDING booking.
     *
     * <p>The status is changed to CONFIRMED and a confirmation notification
     * is dispatched asynchronously (failures are logged but do not roll back
     * the booking operation).</p>
     *
     * @throws BookingNotFoundException  if no booking exists with the given ID
     * @throws IllegalArgumentException  if the booking is not in PENDING state
     */
    public BookingResponse confirmBooking(String bookingId) {
        log.info("Confirming booking: id={}", bookingId);
        Booking booking = findOrThrow(bookingId);

        if (booking.getStatus() != BookingStatus.PENDING) {
            throw new IllegalArgumentException(
                    "Only PENDING bookings can be confirmed. Current status: " + booking.getStatus());
        }

        booking.setStatus(BookingStatus.CONFIRMED);
        Booking saved = bookingRepository.save(booking);
        log.info("Booking confirmed: id={}", saved.getBookingId());

        sendNotification(saved, "CONFIRMED",
                "Your booking " + bookingId + " has been confirmed. Enjoy the event!");

        return toResponse(saved);
    }

    // -----------------------------------------------------------------------
    // Cancel
    // -----------------------------------------------------------------------

    /**
     * Cancels a booking that is in PENDING or CONFIRMED state.
     *
     * <p>The seats are implicitly released (removed from the active bookings),
     * and a cancellation notification is sent to the Notification Service.</p>
     *
     * @throws BookingNotFoundException if no booking exists with the given ID
     * @throws IllegalArgumentException if the booking is already CANCELLED
     */
    public BookingResponse cancelBooking(String bookingId) {
        log.info("Cancelling booking: id={}", bookingId);
        Booking booking = findOrThrow(bookingId);

        if (booking.getStatus() == BookingStatus.CANCELLED) {
            throw new IllegalArgumentException("Booking is already CANCELLED.");
        }

        booking.setStatus(BookingStatus.CANCELLED);
        Booking saved = bookingRepository.save(booking);
        log.info("Booking cancelled: id={}", saved.getBookingId());

        sendNotification(saved, "CANCELLED",
                "Your booking " + bookingId + " has been cancelled.");

        return toResponse(saved);
    }

    // -----------------------------------------------------------------------
    // Availability
    // -----------------------------------------------------------------------

    /**
     * Returns all seat IDs for an event that are currently PENDING or CONFIRMED.
     * These seats are considered unavailable and cannot be re-booked.
     */
    public List<String> getBookedOrLockedSeats(String eventId) {
        log.info("Checking seat availability for eventId={}", eventId);
        List<BookingStatus> activeStatuses = List.of(BookingStatus.PENDING, BookingStatus.CONFIRMED);
        return bookingRepository.findByEventIdAndStatusIn(eventId, activeStatuses)
                .stream()
                .flatMap(b -> b.getSeats().stream())
                .distinct()
                .collect(Collectors.toList());
    }

    // -----------------------------------------------------------------------
    // Internal helpers
    // -----------------------------------------------------------------------

    /**
     * Verifies that none of the requested seats overlaps with currently
     * PENDING or CONFIRMED bookings for the same event.
     */
    private void checkSeatsNotAlreadyBooked(String eventId, List<String> requestedSeats) {
        List<BookingStatus> activeStatuses = List.of(BookingStatus.PENDING, BookingStatus.CONFIRMED);
        Set<String> occupiedSeats = bookingRepository
                .findByEventIdAndStatusIn(eventId, activeStatuses)
                .stream()
                .flatMap(b -> b.getSeats().stream())
                .collect(Collectors.toSet());

        List<String> conflicts = requestedSeats.stream()
                .filter(occupiedSeats::contains)
                .collect(Collectors.toList());

        if (!conflicts.isEmpty()) {
            throw new SeatAlreadyBookedException(String.join(", ", conflicts));
        }
    }

    /** Fetches a booking or throws {@link BookingNotFoundException}. */
    private Booking findOrThrow(String bookingId) {
        return bookingRepository.findById(bookingId)
                .orElseThrow(() -> new BookingNotFoundException(bookingId));
    }

    /**
     * Sends a notification request to the Notification Service.
     * Failures are caught and logged — they do not propagate to the caller.
     */
    private void sendNotification(Booking booking, String type, String message) {
        try {
            NotificationRequest payload = new NotificationRequest(
                    booking.getUserId(),
                    booking.getBookingId(),
                    type,
                    message
            );
            String url = notificationServiceUrl + "/api/notifications/send";
            restTemplate.postForEntity(url, payload, Void.class);
            log.info("Notification sent: type={} bookingId={}", type, booking.getBookingId());
        } catch (RestClientException ex) {
            log.error("Notification Service unavailable; notification not sent for bookingId={}: {}",
                    booking.getBookingId(), ex.getMessage());
        }
    }

    /** Maps a {@link Booking} document to its outbound {@link BookingResponse} DTO. */
    private BookingResponse toResponse(Booking booking) {
        return BookingResponse.builder()
                .bookingId(booking.getBookingId())
                .userId(booking.getUserId())
                .eventId(booking.getEventId())
                .seats(booking.getSeats())
                .totalAmount(booking.getTotalAmount())
                .status(booking.getStatus())
                .createdAt(booking.getCreatedAt())
                .expiresAt(booking.getExpiresAt())
                .build();
    }
}
