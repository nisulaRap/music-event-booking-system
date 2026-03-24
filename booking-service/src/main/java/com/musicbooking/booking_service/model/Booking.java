package com.musicbooking.booking_service.model;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.LocalDateTime;
 
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "bookings")
public class Booking {
 
    @Id
    private String id;
 
    private String userId;
    private String userEmail;
    private String eventId;
    private String eventName;
    private String eventLocation;
    private String eventDate;
 
    private int seats;
    private double totalPrice;
    private double pricePerSeat;
 
    private String status;
 
    private String paymentId;
 
    @CreatedDate
    private LocalDateTime createdAt;
}