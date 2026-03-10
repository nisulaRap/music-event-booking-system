package com.musicbooking.payment_service.service;

import com.musicbooking.payment_service.dto.PaymentRequest;
import com.musicbooking.payment_service.dto.PaymentResponse;
import com.musicbooking.payment_service.model.Payment;
import com.musicbooking.payment_service.repository.PaymentRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class PaymentService {

    private final PaymentRepository paymentRepository;

    public PaymentResponse processPayment(PaymentRequest request) {
        log.info("Processing payment for booking {}", request.getBookingId());
        
        // Simulating external payment gateway processing
        boolean isSuccess = Math.random() > 0.1; // 90% success rate
        String status = isSuccess ? "COMPLETED" : "FAILED";
        String transactionId = UUID.randomUUID().toString();

        Payment payment = Payment.builder()
                .bookingId(request.getBookingId())
                .amount(request.getAmount())
                .paymentMethod(request.getPaymentMethod())
                .status(status)
                .transactionId(transactionId)
                .paymentDate(LocalDateTime.now())
                .build();

        Payment savedPayment = paymentRepository.save(payment);
        log.info("Payment saved for booking {} with status {}", request.getBookingId(), status);
        
        return mapToResponse(savedPayment);
    }

    public PaymentResponse getPaymentById(String id) {
        Payment payment = paymentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Payment not found with id: " + id));
        return mapToResponse(payment);
    }

    public PaymentResponse getPaymentByBookingId(String bookingId) {
        Payment payment = paymentRepository.findByBookingId(bookingId)
                .orElseThrow(() -> new RuntimeException("Payment not found for booking id: " + bookingId));
        return mapToResponse(payment);
    }

    public List<PaymentResponse> getAllPayments() {
        return paymentRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    private PaymentResponse mapToResponse(Payment payment) {
        return PaymentResponse.builder()
                .id(payment.getId())
                .bookingId(payment.getBookingId())
                .amount(payment.getAmount())
                .status(payment.getStatus())
                .transactionId(payment.getTransactionId())
                .paymentDate(payment.getPaymentDate())
                .build();
    }
}
