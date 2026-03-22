package com.musicbooking.notification_service.controller;

import com.musicbooking.notification_service.dto.BookingNotificationRequest;
import com.musicbooking.notification_service.model.Notification;
import com.musicbooking.notification_service.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
 
import java.util.List;
import java.util.Map;
 
@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class NotificationController {
 
    private final NotificationService notificationService;
 
    @PostMapping("/booking-confirmed")
    public ResponseEntity<Notification> bookingConfirmed(
            @RequestBody BookingNotificationRequest req) {
        return ResponseEntity.ok(notificationService.bookingConfirmed(req));
    }
 
    @PostMapping("/booking-cancelled")
    public ResponseEntity<Notification> bookingCancelled(@RequestBody Map<String, String> body) {
        return ResponseEntity.ok(notificationService.bookingCancelled(
                body.get("userId"), body.get("eventName"),
                body.get("bookingId"), body.get("userEmail")));
    }
 
    @PostMapping("/welcome")
    public ResponseEntity<Notification> welcome(@RequestBody Map<String, String> body) {
        return ResponseEntity.ok(notificationService.welcomeUser(
                body.get("userId"), body.get("name"), body.get("email")));
    }
 
    @GetMapping("/my")
    public ResponseEntity<List<Notification>> myNotifications(Authentication auth) {
        return ResponseEntity.ok(notificationService.getMyNotifications(auth.getName()));
    }
}
