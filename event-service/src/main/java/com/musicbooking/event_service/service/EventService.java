package com.musicbooking.event_service.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.musicbooking.event_service.dto.EventRequest;
import com.musicbooking.event_service.model.Event;
import com.musicbooking.event_service.repository.EventRepository;

import lombok.RequiredArgsConstructor;

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
        return repository.findById(id).orElseThrow(() -> new RuntimeException("Event not found"));
    }

    public Event updateEvent(String id, EventRequest request) {
        Event event = getEventById(id);
        event.setName(request.getName());
        event.setLocation(request.getLocation());
        event.setEventDate(request.getEventDate());
        event.setTotalSeats(request.getTotalSeats());
        event.setAvailableSeats(request.getTotalSeats());
        event.setPrice(request.getPrice());
        return repository.save(event);
    }

    public void deleteEvent(String id) {
        repository.deleteById(id);
    }

    public Event reduceSeats(String id, int seats) {
        Event event = getEventById(id);
        if (event.getAvailableSeats() < seats) {
            throw new RuntimeException("Not enough available seats");
        }
        event.setAvailableSeats(event.getAvailableSeats() - seats);
        return repository.save(event);
    }
}
