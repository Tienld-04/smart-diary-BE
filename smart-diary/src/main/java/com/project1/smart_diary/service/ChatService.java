package com.project1.smart_diary.service;

import com.project1.smart_diary.converter.ChatConverter;
import com.project1.smart_diary.dto.request.ChatMesssageRequest;
import com.project1.smart_diary.dto.request.ChatTitleRequest;
import com.project1.smart_diary.dto.response.ChatMessageResponse;
import com.project1.smart_diary.dto.response.ChatSessionResponse;
import com.project1.smart_diary.entity.ChatMessage;
import com.project1.smart_diary.entity.ChatSession;
import com.project1.smart_diary.entity.DiaryEntity;
import com.project1.smart_diary.entity.UserEntity;
import com.project1.smart_diary.repository.ChatMessageRepository;
import com.project1.smart_diary.repository.ChatSessionRepository;
import com.project1.smart_diary.repository.DiaryRepository;
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

import static org.apache.commons.lang3.StringUtils.defaultString;

@Service
@RequiredArgsConstructor
public class ChatService {
    private final GeminiAPIService geminiAPIService;
    private final ChatMessageRepository chatMessageRepository;
    private final DiaryService diaryService;
    private final ChatSessionRepository chatSessionRepository;
    private final UserRepository userRepository;
    private final ChatConverter chatConverter;
    private final DiaryRepository diaryRepository;
    @Transactional
    public ChatSessionResponse createChatSession(ChatMesssageRequest chatMesssageRequest) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        UserEntity userEntity = userRepository.findByEmail(email);
        List<DiaryEntity> diaries = diaryRepository.findTop3ByUser_EmailOrderByCreatedAtDesc(email);
        StringBuilder contextBuilder = new StringBuilder();
        for (DiaryEntity diary : diaries) {
            contextBuilder.append("- ")
                    .append(diary.getTitle()).append(": ")
                    .append(diary.getContent())
                    .append("\n");
        }
        String context = contextBuilder.toString();
        String chatResult = geminiAPIService.getChatbotResponse(email, chatMesssageRequest.getMessage(), context);

        if (chatMesssageRequest.getTitle() != null && !chatMesssageRequest.getTitle().isBlank()) {
            ChatSession chatSession1 = chatSessionRepository.findByUser_EmailAndTitle(email, chatMesssageRequest.getTitle());
            if(chatSession1 == null){
                chatSession1 = new ChatSession();
                chatSession1.setUser(userEntity);
                chatSession1.setTitle(chatMesssageRequest.getTitle());
            }
            ChatSession chatSession = chatSessionRepository.save(chatSession1);

            ChatMessage chatMessageUser = ChatMessage.builder()
                    .message(chatMesssageRequest.getMessage())
                    .isUserMessage(true)
                    .session(chatSession)
                    .build();
            chatMessageRepository.save(chatMessageUser);
//            chatSessionRepository.saveAndFlush(chatSession);
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
            ChatSession chatSession2 = chatSessionRepository.saveAndFlush(chatSession);
            ChatMessage chatMessageUser = ChatMessage.builder()
                    .message(chatMesssageRequest.getMessage())
                    .isUserMessage(true)
                    .session(chatSession2)
                    .build();
            chatMessageRepository.save(chatMessageUser);
            ChatMessage chatMessageAI = ChatMessage.builder()
                    .message(chatResult)
                    .isUserMessage(false)
                    .session(chatSession2)
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
    public ChatSessionResponse getChatSessionByTitle(ChatTitleRequest chatTitleRequest) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        String title = chatTitleRequest.getTitle();
        ChatSession chatSession = chatSessionRepository.findByUser_EmailAndTitle(email, title);
        List<ChatMessage> chatMessages = chatMessageRepository.findBySessionOrderByCreatedAtAsc(chatSession);
        List<ChatMessageResponse>  chatMessageResponses = new ArrayList<>();
        for (ChatMessage chatMessage : chatMessages) {
            if(chatMessage.isUserMessage()){
                ChatMessageResponse chatMessageResponse = new  ChatMessageResponse();
                chatMessageResponse.setUserMessage(defaultString(chatMessage.getMessage()));
                chatMessageResponse.setChatMessage(null);
                chatMessageResponses.add(chatMessageResponse);
            }else{
                if(!chatMessageResponses.isEmpty()){
                    ChatMessageResponse last = chatMessageResponses.get(chatMessageResponses.size() - 1);
                    if (last.getChatMessage() == null) {
                        last.setChatMessage(defaultString(chatMessage.getMessage()));
                        continue;
                    }
                }
                ChatMessageResponse entry = new ChatMessageResponse();
                entry.setUserMessage(null);
                entry.setChatMessage(defaultString(chatMessage.getMessage()));
                chatMessageResponses.add(entry);
            }
        }
        return ChatSessionResponse.builder()
                .title(title)
                .messageResponses(chatMessageResponses)
                .build();
    }
}
