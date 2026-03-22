package com.musicbooking.booking_service;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

/**
 * Smoke test – verifies the entire Spring application context loads correctly.
 *
 * <p>Uses the {@code test} profile so we can supply test-specific properties
 * without relying on real external services (MongoDB, Notification Service, etc.).</p>
 */
@SpringBootTest
@ActiveProfiles("test")
class BookingServiceApplicationTests {

    @Test
    void contextLoads() {
        // If the application context fails to start, this test will fail,
        // surfacing any misconfigured beans or missing properties early.
    }
}
