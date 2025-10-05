package com.project1.smart_diary.service;

import com.project1.smart_diary.converter.ChatConverter;
import com.project1.smart_diary.dto.request.ChatMesssageRequest;
import com.project1.smart_diary.dto.response.ChatMessageResponse;
import com.project1.smart_diary.dto.response.ChatSessionResponse;
import com.project1.smart_diary.entity.ChatMessage;
import com.project1.smart_diary.entity.ChatSession;
import com.project1.smart_diary.entity.UserEntity;
import com.project1.smart_diary.repository.ChatMessageRepository;
import com.project1.smart_diary.repository.ChatSessionRepository;
import com.project1.smart_diary.repository.UserRepository;
import lombok.Builder;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestClient;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ChatService {
    private final GeminiAPIService geminiAPIService;
    private final ChatMessageRepository chatMessageRepository;
    private final DiaryService diaryService;
    private final ChatSessionRepository chatSessionRepository;
    private final UserRepository userRepository;
    private final ChatConverter chatConverter;
    @Transactional
    public ChatSessionResponse createChatSession(ChatMesssageRequest chatMesssageRequest) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        UserEntity userEntity = userRepository.findByEmail(email);
        String chatResult = geminiAPIService.getChatbotResponse(email, chatMesssageRequest.getMessage());
        if (chatMesssageRequest.getTitle() != null && !chatMesssageRequest.getTitle().isBlank()) {
            ChatSession chatSession = chatSessionRepository.findByUser_EmailAndTitle(email, chatMesssageRequest.getTitle());
            ChatMessage chatMessageUser = ChatMessage.builder()
                    .message(chatMesssageRequest.getMessage())
                    .isUserMessage(true)
                    .session(chatSession)
                    .build();
//            chatMessageRepository.save(chatMessageUser);
            chatSessionRepository.saveAndFlush(chatSession);
            ChatMessage chatMessageAI = ChatMessage.builder()
                    .message(chatResult)
                    .isUserMessage(false)
                    .session(chatSession)
                    .build();
            chatMessageRepository.save(chatMessageAI);
            ChatMessageResponse chatMessageResponse = ChatMessageResponse.builder()
                    .userMessage(chatMessageUser.getMessage())
                    .chatMessage(chatResult)
                    .build();
            List<ChatMessageResponse> chatMessageResponses = new ArrayList<>();
            chatMessageResponses.add(chatMessageResponse);
            return ChatSessionResponse.builder()
                    .title(chatMesssageRequest.getTitle())
                    .messageResponses(chatMessageResponses)
                    .build();
        } else {
            String title =  chatMesssageRequest.getMessage();
            String[] words = title.split("\\s+");
            int limit = Math.min(5, words.length);
            String result = String.join(" ", Arrays.copyOfRange(words, 0, limit));
            ChatSession chatSession = ChatSession.builder()
                    .title(result)
                    .user(userEntity)
                    .build();
         //   chatSessionRepository.save(chatSession);
            ChatSession chatSession1 = chatSessionRepository.saveAndFlush(chatSession);
            ChatMessage chatMessageUser = ChatMessage.builder()
                    .message(chatMesssageRequest.getMessage())
                    .isUserMessage(true)
                    .session(chatSession1)
                    .build();
            chatMessageRepository.save(chatMessageUser);
            ChatMessage chatMessageAI = ChatMessage.builder()
                    .message(chatResult)
                    .isUserMessage(false)
                    .session(chatSession1)
                    .build();
            chatMessageRepository.save(chatMessageAI);
            ChatMessageResponse chatMessageResponse = ChatMessageResponse.builder()
                    .userMessage(chatMessageUser.getMessage())
                    .chatMessage(chatResult)
                    .build();
            List<ChatMessageResponse> chatMessageResponses = new ArrayList<>();
            chatMessageResponses.add(chatMessageResponse);
            return ChatSessionResponse.builder()
                    .title(result)
                    .messageResponses(chatMessageResponses)
                    .build();
        }
    }
    public ChatSessionResponse getChatSessionByTitle(String title) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        ChatSession chatSession = chatSessionRepository.findByUser_EmailAndTitle(email, title);
        List<ChatMessage> chatMessages = chatSession.getMessages();
        List<ChatMessageResponse>  chatMessageResponses = new ArrayList<>();
        for (ChatMessage chatMessage : chatMessages) {
            ChatMessageResponse chatMessageResponse = chatConverter.converToChatMessageResponse(chatMessage);
            chatMessageResponses.add(chatMessageResponse);
        }
        return ChatSessionResponse.builder()
                .title(title)
                .messageResponses(chatMessageResponses)
                .build();
    }
}
