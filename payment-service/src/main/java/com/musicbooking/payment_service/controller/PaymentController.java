package com.musicbooking.payment_service.controller;

import com.musicbooking.payment_service.dto.PaymentRequest;
import com.musicbooking.payment_service.model.Payment;
import com.musicbooking.payment_service.service.StripeService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
 
import java.util.List;
 
@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
public class PaymentController {
 
    private final StripeService stripeService;
 
    @PostMapping("/create-intent")
    public ResponseEntity<Payment> createIntent(@Valid @RequestBody PaymentRequest request,
                                                Authentication auth) {
        return ResponseEntity.ok(stripeService.createPaymentIntent(auth.getName(), request));
    }
 
    @PostMapping("/webhook")
    public ResponseEntity<String> webhook(
            @RequestBody String payload,
            @RequestHeader("Stripe-Signature") String sigHeader) {
        stripeService.handleWebhook(payload, sigHeader);
        return ResponseEntity.ok("received");
    }
 
    @GetMapping("/my")
    public ResponseEntity<List<Payment>> myPayments(Authentication auth) {
        return ResponseEntity.ok(stripeService.getMyPayments(auth.getName()));
    }
 
    @GetMapping("/booking/{bookingId}")
    public ResponseEntity<Payment> byBooking(@PathVariable String bookingId) {
        return ResponseEntity.ok(stripeService.getByBookingId(bookingId));
    }
}
