package com.project1.smart_diary.dto.request;

import lombok.*;

import java.time.LocalDate;

@Getter
@Setter
@Builder
public class DiarySearchRequest {
    private LocalDate fromDate;
    private LocalDate toDate;
    private String emotion;
    private String keyword;
}
