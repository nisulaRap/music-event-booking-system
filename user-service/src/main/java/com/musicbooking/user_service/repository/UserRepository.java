package com.musicbooking.user_service.repository;

import com.musicbooking.user_service.model.User;
import org.springframework.data.mongodb.repository.MongoRepository;
 
import java.util.Optional;
 
public interface UserRepository extends MongoRepository<User, String> {
    Optional<User> findByEmail(String email);
    Optional<User> findByResetToken(String resetToken);
}