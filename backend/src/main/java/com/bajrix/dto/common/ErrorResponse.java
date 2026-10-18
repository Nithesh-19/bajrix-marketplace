package com.bajrix.dto.common;

import java.time.Instant;
import java.util.List;

public record ErrorResponse(
    Instant timestamp,
    int status,
    String error,
    String message,
    String path,
    List<FieldErrorDetail> validationErrors
) {
    public static ErrorResponse of(int status, String error, String message, String path) {
        return new ErrorResponse(Instant.now(), status, error, message, path, List.of());
    }

    public static ErrorResponse of(int status, String error, String message, String path, List<FieldErrorDetail> validationErrors) {
        return new ErrorResponse(Instant.now(), status, error, message, path, validationErrors != null ? validationErrors : List.of());
    }
}
