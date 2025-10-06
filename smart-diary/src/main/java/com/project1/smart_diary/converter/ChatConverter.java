package com.project1.smart_diary.converter;

import com.project1.smart_diary.dto.response.ChatMessageResponse;
import com.project1.smart_diary.dto.response.ChatSessionResponse;
import com.project1.smart_diary.entity.ChatMessage;
import com.project1.smart_diary.entity.ChatSession;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;

@Component
public class ChatConverter {
    @Autowired
    private ModelMapper modelMapper;

    public ChatMessageResponse converToChatMessageResponse(ChatMessage chatMessage) {
        ChatMessageResponse chatMessageResponse = new  ChatMessageResponse();
        if(chatMessage.isUserMessage()){
            chatMessageResponse.setUserMessage(chatMessage.getMessage());
        }else{
            chatMessageResponse.setChatMessage(chatMessage.getMessage());
        }
        return chatMessageResponse;
    }
    public ChatSessionResponse converToChatSessionResponse(ChatSession chatSession) {
        ChatSessionResponse chatSessionResponse = modelMapper.map(chatSession, ChatSessionResponse.class);
        chatSessionResponse.setTitle(chatSession.getTitle());
        List<ChatMessage>  chatMessages = chatSession.getMessages();
        List<ChatMessageResponse> chatMessageResponses = new ArrayList<>();
        for(ChatMessage chatMessage : chatMessages){
            ChatMessageResponse chatMessageResponse = converToChatMessageResponse(chatMessage);
            chatMessageResponses.add(chatMessageResponse);
        }
        chatSessionResponse.setMessageResponses(chatMessageResponses);
        return chatSessionResponse;
    }
}
