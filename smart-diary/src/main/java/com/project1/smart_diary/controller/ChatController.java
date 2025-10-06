package com.project1.smart_diary.controller;

import com.project1.smart_diary.dto.request.ChatMesssageRequest;
import com.project1.smart_diary.dto.request.ChatTitleRequest;
import com.project1.smart_diary.dto.response.ChatSessionResponse;
import com.project1.smart_diary.entity.ChatSession;
import com.project1.smart_diary.service.ChatService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/chat")
public class ChatController {
    @Autowired
    private ChatService chatService;

    @PostMapping
    public ResponseEntity<ChatSessionResponse> chatMessageUserWithAI(
            @Valid @RequestBody ChatMesssageRequest chatMesssageRequest) {
        return ResponseEntity.ok(chatService.createChatSession(chatMesssageRequest));
    }

    @GetMapping
    public ResponseEntity<ChatSessionResponse> getChatSessionResponseByTitle(
            @RequestBody ChatTitleRequest chatTitleRequest) {
        return ResponseEntity.ok(chatService.getChatSessionByTitle(chatTitleRequest));
    }
}
