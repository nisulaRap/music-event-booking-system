package com.musicbooking.notification_service.service;

import com.musicbooking.notification_service.dto.BookingNotificationRequest;
import com.musicbooking.notification_service.model.Notification;
import com.musicbooking.notification_service.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
 
import java.util.List;
 
@Slf4j
@Service
@RequiredArgsConstructor
public class NotificationService {
 
    private final NotificationRepository notificationRepository;
    private final EmailService emailService;
 
    public Notification bookingConfirmed(BookingNotificationRequest req) {
        String subject = "🎵 Booking Confirmed — " + req.getEventName();
        String message = String.format(
            "Hi!\n\nYour booking is confirmed.\n\n" +
            "Event: %s\nSeats: %d\nTotal Paid: Rs. %.2f\nBooking ID: %s\n\n" +
            "Enjoy the show!\n— TuneTix Team",
            req.getEventName(), req.getSeats(), req.getTotalPrice(), req.getBookingId()
        );
 
        boolean sent = false;
        if (req.getUserEmail() != null && !req.getUserEmail().isBlank()) {
            sent = emailService.send(req.getUserEmail(), subject, message);
        }
 
        Notification notification = Notification.builder()
                .userId(req.getUserId())
                .type("BOOKING_CONFIRMED")
                .subject(subject)
                .message(message)
                .email(req.getUserEmail())
                .emailSent(sent)
                .build();
 
        return notificationRepository.save(notification);
    }
 
    public Notification bookingCancelled(String userId, String eventName, String bookingId, String userEmail) {
        String subject = "Booking Cancelled — " + eventName;
        String message = String.format(
            "Hi!\n\nYour booking for %s (ID: %s) has been cancelled.\n\n— Encore Team",
            eventName, bookingId
        );
 
        boolean sent = false;
        if (userEmail != null && !userEmail.isBlank()) {
            sent = emailService.send(userEmail, subject, message);
        }
 
        Notification notification = Notification.builder()
                .userId(userId)
                .type("BOOKING_CANCELLED")
                .subject(subject)
                .message(message)
                .email(userEmail)
                .emailSent(sent)
                .build();
 
        return notificationRepository.save(notification);
    }
 
    public Notification welcomeUser(String userId, String name, String email) {
        String subject = "Welcome to Encore 🎶";
        String message = String.format(
            "Hi %s,\n\nWelcome to Encore — your music event booking platform!\n\n" +
            "Start exploring events and book your seats today.\n\n— Encore Team", name
        );
 
        boolean sent = false;
        if (email != null && !email.isBlank()) {
            sent = emailService.send(email, subject, message);
        }
 
        Notification notification = Notification.builder()
                .userId(userId)
                .type("WELCOME")
                .subject(subject)
                .message(message)
                .email(email)
                .emailSent(sent)
                .build();
 
        return notificationRepository.save(notification);
    }
 
    public List<Notification> getMyNotifications(String userId) {
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }
}