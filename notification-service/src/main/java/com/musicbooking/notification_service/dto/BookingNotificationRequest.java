package com.musicbooking.notification_service.dto;

import lombok.Data;
 
@Data
public class BookingNotificationRequest {
    private String userId;
    private String bookingId;
    private String eventName;
    private int seats;
    private double totalPrice;
    private String userEmail;
}
