package com.project1.smart_diary.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DiaryDateRequest {
    @NotNull
    private Integer year;
    @NotNull
    private Integer month;
    @NotNull
    private Integer day;

}
