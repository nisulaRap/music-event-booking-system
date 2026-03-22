package com.musicbooking.booking_service.controller;

import com.musicbooking.booking_service.dto.ApiResponse;
import com.musicbooking.booking_service.dto.BookingRequest;
import com.musicbooking.booking_service.dto.BookingResponse;
import com.musicbooking.booking_service.service.BookingService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST controller exposing the Booking Service API.
 *
 * <p>All responses are wrapped in {@link ApiResponse} for a consistent
 * envelope format across the platform.</p>
 */
@Slf4j
@RestController
@RequestMapping("/api/bookings")
@RequiredArgsConstructor
@Tag(name = "Bookings", description = "Endpoints for creating, managing, and querying event ticket bookings")
public class BookingController {

    private final BookingService bookingService;

    // -----------------------------------------------------------------------
    // Create
    // -----------------------------------------------------------------------

    @PostMapping
    @Operation(
            summary = "Create a new booking",
            description = "Validates input, checks seat availability, creates a PENDING booking and locks seats for 5 minutes"
    )
    public ResponseEntity<ApiResponse<BookingResponse>> createBooking(
            @Valid @RequestBody BookingRequest request) {
        log.info("POST /api/bookings – userId={} eventId={}", request.getUserId(), request.getEventId());
        BookingResponse response = bookingService.createBooking(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Booking created successfully", response));
    }

    // -----------------------------------------------------------------------
    // Read
    // -----------------------------------------------------------------------

    @GetMapping("/{bookingId}")
    @Operation(summary = "Get booking by ID")
    public ResponseEntity<ApiResponse<BookingResponse>> getBookingById(
            @Parameter(description = "UUID of the booking") @PathVariable String bookingId) {
        log.info("GET /api/bookings/{}", bookingId);
        BookingResponse response = bookingService.getBookingById(bookingId);
        return ResponseEntity.ok(ApiResponse.success("Booking retrieved", response));
    }

    @GetMapping("/user/{userId}")
    @Operation(summary = "Get all bookings for a user")
    public ResponseEntity<ApiResponse<List<BookingResponse>>> getBookingsByUser(
            @Parameter(description = "User ID") @PathVariable String userId) {
        log.info("GET /api/bookings/user/{}", userId);
        List<BookingResponse> responses = bookingService.getBookingsByUser(userId);
        return ResponseEntity.ok(ApiResponse.success("Bookings retrieved", responses));
    }

    @GetMapping("/check-availability")
    @Operation(
            summary = "Check seat availability for an event",
            description = "Returns a list of seat IDs that are currently PENDING or CONFIRMED — i.e. unavailable"
    )
    public ResponseEntity<ApiResponse<List<String>>> checkAvailability(
            @Parameter(description = "Event ID to check") @RequestParam String eventId) {
        log.info("GET /api/bookings/check-availability?eventId={}", eventId);
        List<String> bookedSeats = bookingService.getBookedOrLockedSeats(eventId);
        return ResponseEntity.ok(ApiResponse.success("Booked/locked seats retrieved", bookedSeats));
    }

    // -----------------------------------------------------------------------
    // Update
    // -----------------------------------------------------------------------

    @PutMapping("/{bookingId}/confirm")
    @Operation(
            summary = "Confirm a booking",
            description = "Moves a PENDING booking to CONFIRMED status and triggers a confirmation email notification"
    )
    public ResponseEntity<ApiResponse<BookingResponse>> confirmBooking(
            @Parameter(description = "UUID of the booking to confirm") @PathVariable String bookingId) {
        log.info("PUT /api/bookings/{}/confirm", bookingId);
        BookingResponse response = bookingService.confirmBooking(bookingId);
        return ResponseEntity.ok(ApiResponse.success("Booking confirmed", response));
    }

    @PutMapping("/{bookingId}/cancel")
    @Operation(
            summary = "Cancel a booking",
            description = "Cancels a PENDING or CONFIRMED booking, releases locked seats, and triggers a cancellation email"
    )
    public ResponseEntity<ApiResponse<BookingResponse>> cancelBooking(
            @Parameter(description = "UUID of the booking to cancel") @PathVariable String bookingId) {
        log.info("PUT /api/bookings/{}/cancel", bookingId);
        BookingResponse response = bookingService.cancelBooking(bookingId);
        return ResponseEntity.ok(ApiResponse.success("Booking cancelled", response));
    }
}
