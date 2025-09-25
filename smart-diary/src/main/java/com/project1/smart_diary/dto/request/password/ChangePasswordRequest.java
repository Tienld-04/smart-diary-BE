package com.project1.smart_diary.dto.request.password;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ChangePasswordRequest {

    String oldPassword;

    @NotBlank(message = "newPassword not null")
    @Size(min = 6)
    String newPassword;

    @NotBlank(message = "confirmNewPassword not null")
    @Size(min = 6)
    String confirmNewPassword;
}
