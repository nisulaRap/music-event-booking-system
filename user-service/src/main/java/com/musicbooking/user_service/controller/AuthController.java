package com.musicbooking.user_service.controller;

import com.musicbooking.user_service.model.User;
import com.musicbooking.user_service.service.JwtService;
import com.musicbooking.user_service.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
 
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
 
@RestController
@RequestMapping("/api/auth")
public class AuthController {
 
    @Autowired private UserService userService;
    @Autowired private JwtService jwtService;
 
    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody User user) {
        try {
            User saved = userService.register(user);
            Map<String, String> res = new HashMap<>();
            res.put("id",    saved.getId());
            res.put("email", saved.getEmail());
            res.put("name",  saved.getName());
            res.put("role",  saved.getRole());
            return ResponseEntity.ok(res);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
 
    @PostMapping("/login")
    public ResponseEntity<Map<String, String>> login(@RequestBody User request) {
        Optional<User> user = userService.login(request.getEmail(), request.getPassword());
        Map<String, String> response = new HashMap<>();
 
        if (user.isPresent()) {
            String token = jwtService.generateToken(
                user.get().getId(),
                user.get().getRole()
            );
            response.put("token",  token);
            response.put("role",   user.get().getRole());  
            response.put("userId", user.get().getId());
            response.put("email",  user.get().getEmail());
            response.put("name",   user.get().getName() != null ? user.get().getName() : "");
            return ResponseEntity.ok(response);
        }
 
        response.put("error", "Invalid email or password");
        return ResponseEntity.status(401).body(response);
    }
 
    @PostMapping("/forgot-password")
    public ResponseEntity<String> forgotPassword(@RequestParam String email) {
        Optional<User> user = userService.getUserByEmail(email);
        if (user.isEmpty()) return ResponseEntity.ok("If that email exists, a reset link was sent");
        String token = UUID.randomUUID().toString();
        userService.saveResetToken(email, token);
        return ResponseEntity.ok("Reset token generated: " + token);
    }
 
    @PostMapping("/reset-password")
    public ResponseEntity<String> resetPassword(@RequestParam String token,
                                                @RequestParam String newPassword) {
        boolean updated = userService.resetPassword(token, newPassword);
        return updated
            ? ResponseEntity.ok("Password updated successfully")
            : ResponseEntity.badRequest().body("Invalid or expired token");
    }
}
