package com.musicbooking.booking_service.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.Data;
 
@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class EventDto {
    private String id;
    private String name;
    private String location;
    private Object eventDate;
    private int totalSeats;
    private int availableSeats;
    private double price;
}
 