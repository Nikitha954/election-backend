package com.example.demo.dto;

import java.util.UUID;

public class ChatResponse {
    private UUID sessionId;
    private String response;

    public ChatResponse(UUID sessionId, String response) {
        this.sessionId = sessionId;
        this.response = response;
    }

    // Getters and Setters
    public UUID getSessionId() { return sessionId; }
    public void setSessionId(UUID sessionId) { this.sessionId = sessionId; }
    public String getResponse() { return response; }
    public void setResponse(String response) { this.response = response; }
}