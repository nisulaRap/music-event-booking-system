package com.musicbooking.event_service.controller;

import com.musicbooking.event_service.dto.EventRequest;
import com.musicbooking.event_service.model.Event;
import com.musicbooking.event_service.service.EventService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import jakarta.servlet.http.HttpServletRequest;
 
import java.util.List;
import java.util.Map;
 
@RestController
@RequestMapping("/api/events")
@RequiredArgsConstructor
public class EventController {
 
    private final EventService service;
 
    @GetMapping
    public List<Event> getAll() {
        return service.getAllEvents();
    }
 
    @GetMapping("/{id}")
    public Event getById(@PathVariable String id) {
        return service.getEventById(id);
    }
 
    @PostMapping
    public ResponseEntity<?> create(@Valid @RequestBody EventRequest request,
                                    HttpServletRequest httpRequest) {
        if (!isAdmin(httpRequest)) {
            return ResponseEntity.status(403).body(Map.of("message", "Access denied — Admins only"));
        }
        return ResponseEntity.ok(service.createEvent(request));
    }
 
    @PutMapping("/{id}")
    public ResponseEntity<?> update(@PathVariable String id,
                                    @Valid @RequestBody EventRequest request,
                                    HttpServletRequest httpRequest) {
        if (!isAdmin(httpRequest)) {
            return ResponseEntity.status(403).body(Map.of("message", "Access denied — Admins only"));
        }
        return ResponseEntity.ok(service.updateEvent(id, request));
    }
 
    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable String id,
                                    HttpServletRequest httpRequest) {
        if (!isAdmin(httpRequest)) {
            return ResponseEntity.status(403).body(Map.of("message", "Access denied — Admins only"));
        }
        service.deleteEvent(id);
        return ResponseEntity.ok(Map.of("message", "Event deleted"));
    }
 

    @PutMapping("/{id}/reduce-seats")
    public ResponseEntity<?> reduceSeats(@PathVariable String id,
                                         @RequestBody int seats) {
        try {
            return ResponseEntity.ok(service.reduceSeats(id, seats));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }
 

    @PutMapping("/{id}/restore-seats")
    public ResponseEntity<?> restoreSeats(@PathVariable String id,
                                          @RequestBody int seats) {
        try {
            return ResponseEntity.ok(service.restoreSeats(id, seats));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }
 
    
    private boolean isAdmin(HttpServletRequest request) {
        String role = (String) request.getAttribute("userRole");
        return "ADMIN".equals(role);
    }
}
