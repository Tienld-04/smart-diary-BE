package com.project1.smart_diary.dto;

import lombok.*;

import java.time.LocalDateTime;
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LoginGoogleDTO {
    private String fullName;
    private String email;
    private String avatarUrl;
    private LocalDateTime createdAt;
    private String providerId;
}
