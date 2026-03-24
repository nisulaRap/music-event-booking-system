package com.musicbooking.booking_service.controller;

import com.musicbooking.booking_service.dto.BookingRequest;
import com.musicbooking.booking_service.model.Booking;
import com.musicbooking.booking_service.service.BookingService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
 
import java.util.List;
 
@RestController
@RequestMapping("/api/bookings")
@RequiredArgsConstructor
public class BookingController {
 
    private final BookingService bookingService;
 
    /** Create a new booking (PENDING until paid) */
    @PostMapping
    public ResponseEntity<Booking> create(@Valid @RequestBody BookingRequest request,
                                          Authentication auth) {
        return ResponseEntity.ok(bookingService.createBooking(auth.getName(), request));
    }
 
    /** Get current user's bookings */
    @GetMapping("/my")
    public ResponseEntity<List<Booking>> getMyBookings(Authentication auth) {
        return ResponseEntity.ok(bookingService.getMyBookings(auth.getName()));
    }
 
    /** Get single booking by ID */
    @GetMapping("/{id}")
    public ResponseEntity<Booking> getById(@PathVariable String id) {
        return ResponseEntity.ok(bookingService.getById(id));
    }
 
    /** Cancel a booking */
    @PutMapping("/{id}/cancel")
    public ResponseEntity<Booking> cancel(@PathVariable String id, Authentication auth) {
        return ResponseEntity.ok(bookingService.cancelBooking(id, auth.getName()));
    }
 
    /** Called internally by payment-service after successful payment */
    @PutMapping("/{id}/confirm")
    public ResponseEntity<Booking> confirm(@PathVariable String id,
                                           @RequestParam String paymentId) {
        return ResponseEntity.ok(bookingService.confirmBooking(id, paymentId));
    }
 
    /** ADMIN: get all bookings */
    @GetMapping
    public ResponseEntity<List<Booking>> getAll() {
        return ResponseEntity.ok(bookingService.getAllBookings());
    }
}