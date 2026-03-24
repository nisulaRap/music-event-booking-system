package com.musicbooking.booking_service.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;
 
@Data
public class BookingRequest {
    @NotBlank(message = "Event ID is required")
    private String eventId;
 
    @Min(value = 1, message = "At least 1 seat required")
    private int seats;
}
