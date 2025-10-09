package com.project1.smart_diary.dto.response;

import lombok.*;

import java.util.List;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ChatMessageResponse {
    String userMessage;
    String chatMessage;
//    private List<String> message;
}
