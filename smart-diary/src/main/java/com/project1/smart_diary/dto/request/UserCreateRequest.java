package com.project1.smart_diary.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserCreateRequest {

    @NotBlank(message = "Email not null")
    @Email(message = "Email is not in correct format")
    private String email;

    @NotBlank(message = "Password not null")
    @Size(min = 6)
    private String password;

    @NotBlank(message = "FullName not null")
    private String fullname;
}
