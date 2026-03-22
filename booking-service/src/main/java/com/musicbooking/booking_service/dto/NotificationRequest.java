package com.musicbooking.booking_service.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Payload sent to the Notification Service when a booking is confirmed or cancelled.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class NotificationRequest {

    /** Target user's ID (the notification service resolves the email from this). */
    private String userId;

    /** The booking that triggered the notification. */
    private String bookingId;

    /**
     * Notification type – mirrors the BookingStatus transition.
     * Expected values: "CONFIRMED" | "CANCELLED"
     */
    private String type;

    /** Human-readable message body for the email. */
    private String message;
}
