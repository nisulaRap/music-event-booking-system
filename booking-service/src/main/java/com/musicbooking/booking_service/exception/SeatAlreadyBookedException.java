package com.musicbooking.booking_service.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

/**
 * Thrown when one or more requested seats are already booked or locked
 * by another booking, preventing the current request from proceeding.
 */
@ResponseStatus(HttpStatus.CONFLICT)
public class SeatAlreadyBookedException extends RuntimeException {

    public SeatAlreadyBookedException(String seats) {
        super("The following seats are already booked or locked: " + seats);
    }
}
