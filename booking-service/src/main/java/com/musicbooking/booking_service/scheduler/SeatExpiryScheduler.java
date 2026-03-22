package com.musicbooking.booking_service.scheduler;

import com.musicbooking.booking_service.model.Booking;
import com.musicbooking.booking_service.model.BookingStatus;
import com.musicbooking.booking_service.repository.BookingRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Scheduled task that automatically cancels PENDING bookings
 * whose seat-lock window ({@code expiresAt}) has passed.
 *
 * <p>Runs every minute as configured by {@code scheduling.seat-expiry.cron}
 * in {@code application.yml}.</p>
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class SeatExpiryScheduler {

    private final BookingRepository bookingRepository;

    /**
     * Finds all PENDING bookings that have expired and marks them CANCELLED,
     * effectively releasing the seat lock so they become available again.
     */
    @Scheduled(cron = "${scheduling.seat-expiry.cron}")
    public void expireStaleBookings() {
        LocalDateTime now = LocalDateTime.now();
        log.debug("Running seat expiry check at {}", now);

        List<Booking> expiredBookings =
                bookingRepository.findByStatusAndExpiresAtBefore(BookingStatus.PENDING, now);

        if (expiredBookings.isEmpty()) {
            log.debug("No expired bookings found.");
            return;
        }

        log.info("Found {} expired PENDING booking(s). Cancelling now.", expiredBookings.size());

        for (Booking booking : expiredBookings) {
            booking.setStatus(BookingStatus.CANCELLED);
            log.info("Expiring booking: id={} eventId={} seats={}",
                    booking.getBookingId(), booking.getEventId(), booking.getSeats());
        }

        bookingRepository.saveAll(expiredBookings);
        log.info("Seat expiry task completed. Cancelled {} booking(s).", expiredBookings.size());
    }
}
