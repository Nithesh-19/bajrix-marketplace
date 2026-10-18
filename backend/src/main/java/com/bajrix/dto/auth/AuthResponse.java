package com.bajrix.dto.auth;

public record AuthResponse(
    String id,
    String email,
    String name,
    String role,
    Long sellerId,
    String status,
    String organization,
    String token
) {}
