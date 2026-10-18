package com.bajrix.exception;

public class DuplicateListingException extends RuntimeException {
    public DuplicateListingException(String message) {
        super(message);
    }
}
