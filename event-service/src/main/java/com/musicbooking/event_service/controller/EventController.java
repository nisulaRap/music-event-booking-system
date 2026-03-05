package com.musicbooking.event_service.controller;

import java.util.List;

import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import com.musicbooking.event_service.dto.EventRequest;
import com.musicbooking.event_service.model.Event;
import com.musicbooking.event_service.service.EventService;

import org.springframework.web.bind.annotation.RequestBody;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/events")
@RequiredArgsConstructor
public class EventController {

    private final EventService service;

    @PostMapping
    public Event create(@Valid @RequestBody EventRequest request) {
        return service.createEvent(request);
    }

    @GetMapping
    public List<Event> getAll() {
        return service.getAllEvents();
    }

    @GetMapping("/{id}")
    public Event getById(@PathVariable String id) {
        return service.getEventById(id);
    }
    
    @PutMapping("/{id}")
    public Event update(@PathVariable String id, @Valid @RequestBody EventRequest request) {
        return service.updateEvent(id, request);
    }

    @DeleteMapping("/{id}")
    public org.springframework.http.ResponseEntity<String> delete(@PathVariable String id) {
        service.deleteEvent(id);
        return org.springframework.http.ResponseEntity.ok("Deleted Event");
    }
    
    // Integration with Booking Service to reduce available seats
    @PutMapping("/{id}/reduce-seats")
    public Event reduceSeats(@PathVariable String id, @RequestBody int seats) {
        return service.reduceSeats(id, seats);
    }
}
