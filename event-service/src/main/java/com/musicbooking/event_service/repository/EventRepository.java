package com.musicbooking.event_service.repository;

import org.springframework.data.mongodb.repository.MongoRepository;

import com.musicbooking.event_service.model.Event;

public interface EventRepository extends MongoRepository<Event, String> {    
}
