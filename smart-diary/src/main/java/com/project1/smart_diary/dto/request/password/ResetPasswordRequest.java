package com.project1.smart_diary.dto.request.password;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ResetPasswordRequest {

    @NotBlank(message = "Token not null")
    private String token;

    @NotBlank(message = "newPassword not null")
    @Size(min = 6, message = "Password must be at least 6 characters")
    private String newPassword;

    @NotBlank(message = "confirmPassword not null")
    @Size(min = 6, message = "Password must be at least 6 characters")
    private String confirmPassword;
}
