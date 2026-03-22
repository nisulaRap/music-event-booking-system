package com.musicbooking.booking_service.dto;

import com.musicbooking.booking_service.model.BookingStatus;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Outbound representation of a booking sent back to callers.
 */
@Data
@Builder
public class BookingResponse {

    private String bookingId;
    private String userId;
    private String eventId;
    private List<String> seats;
    private double totalAmount;
    private BookingStatus status;
    private LocalDateTime createdAt;
    private LocalDateTime expiresAt;
}
