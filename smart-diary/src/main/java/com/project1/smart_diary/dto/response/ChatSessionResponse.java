package com.project1.smart_diary.dto.response;

import lombok.*;

import java.util.List;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ChatSessionResponse {
    private String title;
    private List<ChatMessageResponse> messageResponses;
}
