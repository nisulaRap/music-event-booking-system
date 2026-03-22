package com.musicbooking.booking_service.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.List;

/**
 * Inbound payload for creating a new booking.
 */
@Data
public class BookingRequest {

    @NotBlank(message = "userId is required")
    private String userId;

    @NotBlank(message = "eventId is required")
    private String eventId;

    @NotNull(message = "selectedSeats must not be null")
    @NotEmpty(message = "At least one seat must be selected")
    private List<String> selectedSeats;

    @DecimalMin(value = "0.0", inclusive = false, message = "totalAmount must be greater than zero")
    private double totalAmount;
}
