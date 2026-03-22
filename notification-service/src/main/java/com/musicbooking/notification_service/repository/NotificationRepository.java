package com.musicbooking.notification_service.repository;

import com.musicbooking.notification_service.model.Notification;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;
 
public interface NotificationRepository extends MongoRepository<Notification, String> {
    List<Notification> findByUserIdOrderByCreatedAtDesc(String userId);
}
