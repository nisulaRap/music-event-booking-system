package com.musicbooking.payment_service.repository;

import com.musicbooking.payment_service.model.Payment;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;
import java.util.Optional;
 
public interface PaymentRepository extends MongoRepository<Payment, String> {
    List<Payment> findByUserId(String userId);
    Optional<Payment> findByBookingId(String bookingId);
    Optional<Payment> findByStripePaymentIntentId(String intentId);
}