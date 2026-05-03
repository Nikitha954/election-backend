package com.example.demo.service;

import com.example.demo.dto.ChatRequest;
import com.example.demo.dto.ChatResponse;
import com.example.demo.entity.ChatMessage;
import com.example.demo.entity.ChatSession;
import com.example.demo.repository.ChatMessageRepository;
import com.example.demo.repository.ChatSessionRepository;
import org.json.JSONObject; 
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;

@Service
public class ChatService {

    @Autowired
    private ChatSessionRepository sessionRepo;

    @Autowired
    private ChatMessageRepository messageRepo;

    // NEW: We point Java directly to our local Python Microservice!
    private static final String PYTHON_AI_URL = "https://hani2384-election-ai-brain.hf.space/api/generate";

    public ChatResponse processMessage(ChatRequest request) {
        // 1. Fetch existing session, or create a new one if it's the first message
        ChatSession session;
        if (request.getSessionId() != null) {
            session = sessionRepo.findById(request.getSessionId())
                    .orElseGet(() -> sessionRepo.save(new ChatSession()));
        } else {
            session = sessionRepo.save(new ChatSession());
        }

        // 2. Save the User's message to PostgreSQL
        saveMessage(session, "USER", request.getMessage());

        // 3. Send the message to the Python FastAPI Brain
        String aiText = callPythonAI(request.getMessage());

        // 4. Save the AI's response to PostgreSQL
        saveMessage(session, "AI", aiText);

        // 5. Return the response back to the Controller
        return new ChatResponse(session.getId(), aiText);
    }

    private void saveMessage(ChatSession session, String sender, String content) {
        ChatMessage msg = new ChatMessage();
        msg.setChatSession(session);
        msg.setSender(sender);
        msg.setContent(content);
        messageRepo.save(msg);
    }

    private String callPythonAI(String userMessage) {
        try {
            // Create the exact simple JSON payload our FastAPI server expects: {"message": "..."}
            JSONObject requestBody = new JSONObject();
            requestBody.put("message", userMessage);

            HttpClient client = HttpClient.newHttpClient();
            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(PYTHON_AI_URL))
                    .header("Content-Type", "application/json")
                    .POST(HttpRequest.BodyPublishers.ofString(requestBody.toString()))
                    .build();

            HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());
            JSONObject jsonResponse = new JSONObject(response.body());
            
            // Extract the text from our Python server's {"response": "..."} format
            return jsonResponse.getString("response")
                    .replace("\n", "<br>")
                    .replaceAll("\\*\\*(.*?)\\*\\*", "<strong>$1</strong>");

        } catch (Exception e) {
            return "Microservice Error: Is the Python FastAPI server running on port 8000?";
        }
    }
}