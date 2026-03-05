package com.musicbooking.event_service.model;

import java.time.LocalDate;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
@Document
public class Event {

    @Id
    private String id;
    private String name;
    private String location;
    private LocalDate eventDate;
    private int totalSeats;
    private int availableSeats;
    
}
