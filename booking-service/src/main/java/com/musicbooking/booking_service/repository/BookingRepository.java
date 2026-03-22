package com.musicbooking.booking_service.repository;

import com.musicbooking.booking_service.model.Booking;
import com.musicbooking.booking_service.model.BookingStatus;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Spring Data MongoDB repository for {@link Booking} documents.
 */
@Repository
public interface BookingRepository extends MongoRepository<Booking, String> {

    /**
     * Returns all bookings belonging to a given user.
     */
    List<Booking> findByUserId(String userId);

    /**
     * Returns all bookings for a specific event that have a given status.
     * Used by the availability check to find PENDING/CONFIRMED seats.
     */
    List<Booking> findByEventIdAndStatusIn(String eventId, List<BookingStatus> statuses);

    /**
     * Finds all PENDING bookings whose seat lock has already expired.
     * Used by the scheduled expiry task.
     */
    List<Booking> findByStatusAndExpiresAtBefore(BookingStatus status, LocalDateTime threshold);
}
