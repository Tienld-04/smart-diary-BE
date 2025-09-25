package com.project1.smart_diary.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LoginRequest {
    @NotBlank(message = "Username not null")
    private String email;

    @NotBlank(message = "Password not null")
    @Size(min = 6)
    private String password;

}
