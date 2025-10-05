package com.project1.smart_diary.dto.response;

import lombok.*;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ChatMessageResponse {
    String userMessage;
    String chatMessage;
}
