package com.musicbooking.user_notification_service.service;

import com.musicbooking.user_notification_service.model.User;
import com.musicbooking.user_notification_service.repository.UserRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    // REGISTER USER
    public User register(User user) {

        user.setPassword(passwordEncoder.encode(user.getPassword()));

        if (user.getRole() == null) {
            user.setRole("USER");
        }

        return userRepository.save(user);
    }

    // LOGIN USER
    public Optional<User> login(String email, String password) {

        Optional<User> user = userRepository.findByEmail(email);

        if (user.isPresent()) {
            if (passwordEncoder.matches(password, user.get().getPassword())) {
                return user;
            }
        }

        return Optional.empty();
    }

    // GET USER BY EMAIL
    public Optional<User> getUserByEmail(String email) {
        return userRepository.findByEmail(email);
    }

    // GET USER BY ID
    public User getUserById(String id) {
        return userRepository.findById(id).orElse(null);
    }

    // ADMIN GET ALL USERS
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    // USER UPDATE PROFILE BY ID
    public User updateProfileById(String id, User updated) {

        return userRepository.findById(id)
                .map(user -> {

                    if (updated.getName() != null) {
                        user.setName(updated.getName());
                    }

                    if (updated.getPhone() != null) {
                        user.setPhone(updated.getPhone());
                    }

                    if (updated.getEmail() != null) {
                        user.setEmail(updated.getEmail());
                    }

                    if (updated.getPassword() != null && !updated.getPassword().isBlank()) {
                        user.setPassword(passwordEncoder.encode(updated.getPassword()));
                    }

                    return userRepository.save(user);
                })
                .orElse(null);
    }

    // DELETE USER BY ID
    public void deleteUserById(String id) {
        userRepository.deleteById(id);
    }

    // SAVE RESET TOKEN (FORGOT PASSWORD)
    public void saveResetToken(String email, String token) {

        Optional<User> user = userRepository.findByEmail(email);

        if (user.isPresent()) {
            User existingUser = user.get();
            existingUser.setResetToken(token);
            userRepository.save(existingUser);
        }
    }

    // RESET PASSWORD
    public boolean resetPassword(String token, String newPassword) {

        Optional<User> user = userRepository.findByResetToken(token);

        if (user.isPresent()) {
            User existingUser = user.get();
            existingUser.setPassword(passwordEncoder.encode(newPassword));
            existingUser.setResetToken(null);
            userRepository.save(existingUser);
            return true;
        }

        return false;
    }
}