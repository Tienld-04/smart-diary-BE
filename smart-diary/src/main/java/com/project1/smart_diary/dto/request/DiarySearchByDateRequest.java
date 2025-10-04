package com.project1.smart_diary.dto.request;

import lombok.*;

import java.time.LocalDate;
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DiarySearchByDateRequest {
    private LocalDate fromDate;
    private LocalDate toDate;
}
