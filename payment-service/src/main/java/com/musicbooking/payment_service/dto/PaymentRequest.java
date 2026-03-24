package com.musicbooking.payment_service.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;
 
@Data
public class PaymentRequest {
    @NotBlank
    private String bookingId;
    private double amount;       
    private String currency;     
}
