package com.example.demo.dto;

import java.util.UUID;

public class ChatRequest {
    private UUID sessionId; // Can be null if it's a brand new chat
    private String message;

    // Getters and Setters
    public UUID getSessionId() { return sessionId; }
    public void setSessionId(UUID sessionId) { this.sessionId = sessionId; }
    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }
}