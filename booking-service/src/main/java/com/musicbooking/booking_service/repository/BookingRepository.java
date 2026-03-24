package com.musicbooking.booking_service.repository;

import com.musicbooking.booking_service.model.Booking;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;
 
public interface BookingRepository extends MongoRepository<Booking, String> {
    List<Booking> findByUserId(String userId);
    List<Booking> findByEventId(String eventId);
    List<Booking> findByUserIdAndStatus(String userId, String status);
}
