package com.musicbooking.payment_service.service;

import com.musicbooking.payment_service.dto.PaymentRequest;
import com.musicbooking.payment_service.model.Payment;
import com.musicbooking.payment_service.repository.PaymentRepository;
import com.stripe.Stripe;
import com.stripe.exception.StripeException;
import com.stripe.model.PaymentIntent;
import com.stripe.model.Event;
import com.stripe.model.EventDataObjectDeserializer;
import com.stripe.net.Webhook;
import com.stripe.param.PaymentIntentCreateParams;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
 
import java.util.List;
import java.util.Map;
 
@Slf4j
@Service
@RequiredArgsConstructor
public class StripeService {
 
    private final PaymentRepository paymentRepository;
    private final RestTemplate restTemplate;
 
    @Value("${stripe.secret.key}")
    private String stripeSecretKey;
 
    @Value("${stripe.webhook.secret}")
    private String webhookSecret;
 
    @Value("${booking.service.url}")
    private String bookingServiceUrl;
 
    @PostConstruct
    public void init() {
        Stripe.apiKey = stripeSecretKey;
    }
 
    public Payment createPaymentIntent(String userId, PaymentRequest request) {
        try {
            long stripeAmount = Math.round(request.getAmount() * 100);
            String currency = request.getCurrency() != null ? request.getCurrency().toLowerCase() : "usd";
 
            PaymentIntentCreateParams params = PaymentIntentCreateParams.builder()
                    .setAmount(stripeAmount)
                    .setCurrency(currency)
                    .putMetadata("bookingId", request.getBookingId())
                    .putMetadata("userId", userId)
                    .build();
 
            PaymentIntent intent = PaymentIntent.create(params);
 
            Payment payment = Payment.builder()
                    .userId(userId)
                    .bookingId(request.getBookingId())
                    .amount(request.getAmount())
                    .currency(currency)
                    .status("PENDING")
                    .stripePaymentIntentId(intent.getId())
                    .stripeClientSecret(intent.getClientSecret())
                    .build();
 
            return paymentRepository.save(payment);
 
        } catch (StripeException e) {
            log.error("Stripe error: {}", e.getMessage());
            throw new RuntimeException("Failed to create payment: " + e.getMessage());
        }
    }
 
    public void handleWebhook(String payload, String sigHeader) {
        Event event;
        try {
            event = Webhook.constructEvent(payload, sigHeader, webhookSecret);
        } catch (Exception e) {
            throw new RuntimeException("Webhook verification failed: " + e.getMessage());
        }
 
        if ("payment_intent.succeeded".equals(event.getType())) {
            EventDataObjectDeserializer deserializer = event.getDataObjectDeserializer();
            deserializer.getObject().ifPresent(obj -> {
                PaymentIntent intent = (PaymentIntent) obj;
                handlePaymentSucceeded(intent);
            });
        } else if ("payment_intent.payment_failed".equals(event.getType())) {
            EventDataObjectDeserializer deserializer = event.getDataObjectDeserializer();
            deserializer.getObject().ifPresent(obj -> {
                PaymentIntent intent = (PaymentIntent) obj;
                handlePaymentFailed(intent);
            });
        }
    }
 
    private void handlePaymentSucceeded(PaymentIntent intent) {
        paymentRepository.findByStripePaymentIntentId(intent.getId()).ifPresent(payment -> {
            payment.setStatus("SUCCEEDED");
            paymentRepository.save(payment);
            confirmBooking(payment.getBookingId(), payment.getId());
        });
    }
 
    private void handlePaymentFailed(PaymentIntent intent) {
        paymentRepository.findByStripePaymentIntentId(intent.getId()).ifPresent(payment -> {
            payment.setStatus("FAILED");
            paymentRepository.save(payment);
        });
    }
 
    private void confirmBooking(String bookingId, String paymentId) {
        try {
            restTemplate.exchange(
                bookingServiceUrl + "/api/bookings/" + bookingId + "/confirm?paymentId=" + paymentId,
                HttpMethod.PUT, HttpEntity.EMPTY, String.class);
        } catch (Exception e) {
            log.warn("Could not confirm booking {}: {}", bookingId, e.getMessage());
        }
    }
 
    public List<Payment> getMyPayments(String userId) {
        return paymentRepository.findByUserId(userId);
    }
 
    public Payment getByBookingId(String bookingId) {
        return paymentRepository.findByBookingId(bookingId)
                .orElseThrow(() -> new RuntimeException("Payment not found for booking: " + bookingId));
    }
}
