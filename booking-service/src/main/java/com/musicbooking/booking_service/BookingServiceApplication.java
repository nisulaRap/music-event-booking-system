package com.musicbooking.booking_service;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

/**
 * Entry point for the Booking microservice.
 * <p>
 * {@code @EnableScheduling} activates the seat-expiry scheduled task
 * that cancels PENDING bookings whose lock window has elapsed.
 * </p>
 */
@SpringBootApplication
@EnableScheduling
public class BookingServiceApplication {

    public static void main(String[] args) {
        SpringApplication.run(BookingServiceApplication.class, args);
    }
}
