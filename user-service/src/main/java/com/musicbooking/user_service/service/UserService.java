package com.musicbooking.user_service.service;

import com.musicbooking.user_service.model.User;
import com.musicbooking.user_service.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
 
import java.util.List;
import java.util.Optional;
 
@Service
public class UserService {
 
    @Autowired
    private UserRepository userRepository;
 
    @Autowired
    private PasswordEncoder passwordEncoder;
 
    public User register(User user) {
        if (userRepository.findByEmail(user.getEmail()).isPresent()) {
            throw new RuntimeException("Email already registered");
        }
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        if (user.getRole() == null || user.getRole().isBlank()) {
            user.setRole("USER");
        }
        return userRepository.save(user);
    }
 
    public Optional<User> login(String email, String password) {
        Optional<User> userOpt = userRepository.findByEmail(email);
        if (userOpt.isEmpty()) return Optional.empty();
 
        User user = userOpt.get();
        String storedPassword = user.getPassword();
 
        boolean matches = false;
        if (storedPassword.startsWith("$2a$") || storedPassword.startsWith("$2b$")) {
            matches = passwordEncoder.matches(password, storedPassword);
        } else {
            matches = storedPassword.equals(password);
            if (matches) {
                user.setPassword(passwordEncoder.encode(password));
                userRepository.save(user);
            }
        }
 
        return matches ? Optional.of(user) : Optional.empty();
    }
 
    public Optional<User> getUserByEmail(String email) {
        return userRepository.findByEmail(email);
    }
 
    public User getUserById(String id) {
        return userRepository.findById(id).orElse(null);
    }
 
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }
 
    public User updateProfileById(String id, User updated) {
        User existing = getUserById(id);
        if (existing == null) return null;
        if (updated.getName()  != null) existing.setName(updated.getName());
        if (updated.getPhone() != null) existing.setPhone(updated.getPhone());
        return userRepository.save(existing);
    }
 
    public void deleteUserById(String id) {
        userRepository.deleteById(id);
    }
 
    public void saveResetToken(String email, String token) {
        userRepository.findByEmail(email).ifPresent(u -> {
            u.setResetToken(token);
            userRepository.save(u);
        });
    }
 
    public boolean resetPassword(String token, String newPassword) {
        Optional<User> userOpt = userRepository.findByResetToken(token);
        if (userOpt.isEmpty()) return false;
        User user = userOpt.get();
        user.setPassword(passwordEncoder.encode(newPassword));
        user.setResetToken(null);
        userRepository.save(user);
        return true;
    }
}
