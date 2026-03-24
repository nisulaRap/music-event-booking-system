package com.musicbooking.payment_service.model;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.LocalDateTime;
 
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "payments")
public class Payment {
 
    @Id
    private String id;
 
    private String userId;
    private String bookingId;
    private double amount;
    private String currency;
    private String status;
    private String stripePaymentIntentId;
    private String stripeClientSecret;
 
    @CreatedDate
    private LocalDateTime createdAt;
}