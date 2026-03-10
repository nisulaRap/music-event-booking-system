package com.musicbooking.payment_service.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Document(collection = "payments")
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class Payment {

    @Id
    private String id;
    
    private String bookingId;
    
    private double amount;
    
    private String paymentMethod;
    
    private String status; // e.g., PENDING, COMPLETED, FAILED
    
    private String transactionId;
    
    private LocalDateTime paymentDate;
}
