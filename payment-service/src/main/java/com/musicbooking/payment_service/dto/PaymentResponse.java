package com.musicbooking.payment_service.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class PaymentResponse {
    private String id;
    private String bookingId;
    private double amount;
    private String status;
    private String transactionId;
    private LocalDateTime paymentDate;
}
