package com.project1.smart_diary.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DiaryRequest {
    @NotBlank(message = "Title not null")
    private String title;
    @NotBlank(message = "Content not null")
    private String content;
}
