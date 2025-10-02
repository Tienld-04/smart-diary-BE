package com.project1.smart_diary.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

import java.util.List;
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpdateDiaryRequest {
    @NotBlank(message = "Id diary not null")
    private Long diaryId;
    @NotBlank(message = "Title not null")
    private String title;
    @NotBlank(message = "Content not null")
    private String content;
    private List<Long> imageIdsDelete;

}
