package com.musicbooking.event_service.dto;

import java.time.LocalDate;

import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class EventRequest {
    @NotBlank(message = "Event name is required")
    private String name;

    @NotBlank(message = "Location is required")
    private String location;

    @Future(message = "Event date must be in the future")
    private LocalDate eventDate;

    @Min(value = 1, message = "Total seats must be at least 1")
    private int totalSeats;
}
