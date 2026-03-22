package com.musicbooking.booking_service.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

/**
 * Generic API envelope used for all responses.
 *
 * @param <T> the type of the payload
 */
@Getter
@AllArgsConstructor
public class ApiResponse<T> {

    private final boolean success;
    private final String message;
    private final T data;

    /** Convenience factory for successful responses. */
    public static <T> ApiResponse<T> success(String message, T data) {
        return new ApiResponse<>(true, message, data);
    }

    /** Convenience factory for error responses. */
    public static <T> ApiResponse<T> error(String message) {
        return new ApiResponse<>(false, message, null);
    }
}
