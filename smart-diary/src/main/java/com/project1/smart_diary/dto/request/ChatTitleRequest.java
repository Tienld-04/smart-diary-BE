package com.project1.smart_diary.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ChatTitleRequest {
    @NotBlank(message = "title not null")
    private String title;
}
