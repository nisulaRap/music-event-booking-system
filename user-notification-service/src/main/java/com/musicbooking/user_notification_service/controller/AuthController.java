package com.musicbooking.user_notification_service.controller;

import com.musicbooking.user_notification_service.model.User;
import com.musicbooking.user_notification_service.service.EmailService;
import com.musicbooking.user_notification_service.service.JwtService;
import com.musicbooking.user_notification_service.service.UserService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private UserService userService;

    @Autowired
    private JwtService jwtService;

    @Autowired
    private EmailService emailService;

    @PostMapping("/register")
    public User register(@RequestBody User user) {
        return userService.register(user);
    }

    @PostMapping("/login")
    public Map<String, String> login(@RequestBody User request) {

        Optional<User> user = userService.login(request.getEmail(), request.getPassword());

        Map<String, String> response = new HashMap<>();

        if (user.isPresent()) {
            String token = jwtService.generateToken(user.get().getId());

            response.put("token", token);
            response.put("role", user.get().getRole());
            response.put("userId", user.get().getId());
            response.put("email", user.get().getEmail());

            return response;
        }

        response.put("error", "Invalid credentials");
        return response;
    }

    @PostMapping("/forgot-password")
    public String forgotPassword(@RequestParam String email) {

        Optional<User> user = userService.getUserByEmail(email);

        if (user.isEmpty()) {
            return "User not found";
        }

        String token = UUID.randomUUID().toString();

        userService.saveResetToken(email, token);

        String resetLink = "http://localhost:8081/api/auth/reset-password?token=" + token + "&newPassword=NEW_PASSWORD";

        emailService.sendResetEmail(email, resetLink);

        return "Password reset link sent to email";
    }

    @PostMapping("/reset-password")
    public String resetPassword(@RequestParam String token,
                                @RequestParam String newPassword) {

        boolean updated = userService.resetPassword(token, newPassword);

        if (updated) {
            return "Password updated successfully";
        }

        return "Invalid token";
    }
}