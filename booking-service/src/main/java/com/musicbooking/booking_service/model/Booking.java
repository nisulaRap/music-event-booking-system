package com.musicbooking.booking_service.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.List;

/**
 * MongoDB document that represents a single booking in the system.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "bookings")
public class Booking {

    /** UUID-based primary key. */
    @Id
    private String bookingId;

    /** ID of the user who created the booking. */
    @Indexed
    private String userId;

    /** ID of the event being booked. */
    @Indexed
    private String eventId;

    /** List of seat identifiers (e.g. "A1", "B3") reserved in this booking. */
    private List<String> seats;

    /** Total amount charged for this booking. */
    private double totalAmount;

    /** Current lifecycle status. */
    private BookingStatus status;

    /** Timestamp when the booking was created. */
    private LocalDateTime createdAt;

    /**
     * Timestamp when the seat lock expires.
     * PENDING bookings past this time are automatically cancelled
     * by the {@link com.musicbooking.booking_service.scheduler.SeatExpiryScheduler}.
     */
    private LocalDateTime expiresAt;
}
