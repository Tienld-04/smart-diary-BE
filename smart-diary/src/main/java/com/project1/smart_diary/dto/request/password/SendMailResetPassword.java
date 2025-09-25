package com.project1.smart_diary.dto.request.password;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SendMailResetPassword {
    @NotBlank(message = "Email not null")
    @Email(message = "Email is not in correct format")
    private String email;
}
