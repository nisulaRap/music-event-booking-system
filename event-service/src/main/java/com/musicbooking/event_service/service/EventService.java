package com.musicbooking.event_service.service;

import com.musicbooking.event_service.dto.EventRequest;
import com.musicbooking.event_service.model.Event;
import com.musicbooking.event_service.repository.EventRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
 
import java.util.List;
 
@Slf4j
@Service
@RequiredArgsConstructor
public class EventService {
 
    private final EventRepository repository;
 
    public Event createEvent(EventRequest request) {
        Event event = Event.builder()
                .name(request.getName())
                .location(request.getLocation())
                .eventDate(request.getEventDate())
                .totalSeats(request.getTotalSeats())
                .availableSeats(request.getTotalSeats())
                .price(request.getPrice())
                .build();
        return repository.save(event);
    }
 
    public List<Event> getAllEvents() {
        return repository.findAll();
    }
 
    public Event getEventById(String id) {
        return repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Event not found: " + id));
    }
 
    public Event updateEvent(String id, EventRequest request) {
        Event event = getEventById(id);
        int seatDelta = request.getTotalSeats() - event.getTotalSeats();
        event.setName(request.getName());
        event.setLocation(request.getLocation());
        event.setEventDate(request.getEventDate());
        event.setTotalSeats(request.getTotalSeats());
        event.setAvailableSeats(Math.max(0, event.getAvailableSeats() + seatDelta));
        event.setPrice(request.getPrice());
        
        return repository.save(event);
    }
 
    public void deleteEvent(String id) {
        Event event = getEventById(id);
        repository.delete(event);
    }
 
    public Event reduceSeats(String id, int seats) {
        Event event = getEventById(id);
 
        int available = event.getAvailableSeats();
        if (available == 0 && event.getTotalSeats() > 0) {
            log.warn("Event {} has availableSeats=0 but totalSeats={} — auto-fixing",
                    id, event.getTotalSeats());
            available = event.getTotalSeats();
        }
 
        if (available < seats) {
            throw new RuntimeException(
                "Not enough available seats. Requested: " + seats + ", Available: " + available);
        }
 
        event.setAvailableSeats(available - seats);
        Event saved = repository.save(event);
        log.info("Seats reduced for event {}: {} → {} (reduced by {})",
                id, available, saved.getAvailableSeats(), seats);
        return saved;
    }
 
    public Event restoreSeats(String id, int seats) {
        Event event = getEventById(id);
        int newAvailable = Math.min(event.getAvailableSeats() + seats, event.getTotalSeats());
        event.setAvailableSeats(newAvailable);
        Event saved = repository.save(event);
        log.info("Seats restored for event {}: +{} → now {} available", id, seats, newAvailable);
        return saved;
    }
}
