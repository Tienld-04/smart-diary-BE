package com.project1.smart_diary.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ChatMesssageRequest {

    private String title;
    @NotBlank(message = "Message not null")
    private String message;
}
