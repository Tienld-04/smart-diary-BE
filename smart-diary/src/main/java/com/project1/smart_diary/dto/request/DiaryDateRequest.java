package com.project1.smart_diary.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DiaryDateRequest {
    @NotBlank(message = "year not null")
    private int year;
    @NotBlank(message = "month not null")
    private int month;
    @NotBlank(message = "day not null")
    private int day;

}
