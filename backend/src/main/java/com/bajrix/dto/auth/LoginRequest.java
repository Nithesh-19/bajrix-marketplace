package com.bajrix.dto.auth;

import jakarta.validation.constraints.NotBlank;

public record LoginRequest(
    @NotBlank(message = "Email is required")
    String email,
    String password,
    String role
) {}
