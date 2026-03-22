package com.musicbooking.notification_service.model;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.LocalDateTime;
 
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "notifications")
public class Notification {
 
    @Id
    private String id;
 
    private String userId;
    private String type; 
    private String subject;
    private String message;
    private String email;
    private boolean emailSent;
 
    @CreatedDate
    private LocalDateTime createdAt;
}
 
