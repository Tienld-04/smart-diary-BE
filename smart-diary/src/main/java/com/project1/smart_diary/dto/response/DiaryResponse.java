package com.project1.smart_diary.dto.response;

import com.project1.smart_diary.enums.Emotion;
import lombok.*;

import java.time.LocalDateTime;
import java.util.List;
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DiaryResponse {
    private Long id;
    private String title;
    private String content;
    private Emotion emotion;
    private String advice;
    private List<DiaryMediaResponse> listMedia;
    private LocalDateTime createAt;
}
