package com.musicbooking.user_service.controller;

import com.musicbooking.user_service.model.User;
import com.musicbooking.user_service.service.UserService;
 
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
 
import java.util.Map;
 
@RestController
@RequestMapping("/api/users")
public class UserController {
 
    @Autowired
    private UserService userService;
 
    // ADMIN ONLY - get all users
    @GetMapping
    public ResponseEntity<?> getAllUsers(Authentication authentication) {
        String userId = authentication.getName();
        User currentUser = userService.getUserById(userId);
        if (currentUser == null || !"ADMIN".equals(currentUser.getRole())) {
            return ResponseEntity.status(403).body("Access denied");
        }
        return ResponseEntity.ok(userService.getAllUsers());
    }
 
    // USER/ADMIN - view own profile
    @GetMapping("/me")
    public ResponseEntity<?> getMyProfile(Authentication authentication) {
        String userId = authentication.getName();
        User user = userService.getUserById(userId);
        if (user == null) return ResponseEntity.notFound().build();
        return ResponseEntity.ok(user);
    }
 
    // USER/ADMIN - update own profile
    @PutMapping("/me")
    public ResponseEntity<?> updateMyProfile(@RequestBody User updatedUser,
                                             Authentication authentication) {
        String userId = authentication.getName();
        User updated = userService.updateProfileById(userId, updatedUser);
        if (updated == null) return ResponseEntity.notFound().build();
        return ResponseEntity.ok(updated);
    }
 
    // USER/ADMIN - delete own profile
    @DeleteMapping("/me")
    public ResponseEntity<?> deleteMyProfile(Authentication authentication) {
        String userId = authentication.getName();
        userService.deleteUserById(userId);
        return ResponseEntity.ok(Map.of("message", "Profile deleted successfully"));
    }
 
    @GetMapping("/{id}/email")
    public ResponseEntity<?> getUserEmail(@PathVariable String id) {
        User user = userService.getUserById(id);
        if (user == null) return ResponseEntity.notFound().build();
        return ResponseEntity.ok(Map.of("email", user.getEmail() != null ? user.getEmail() : ""));
    }
}
