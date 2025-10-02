package com.project1.smart_diary.controller;

import com.nimbusds.jose.JOSEException;
import com.project1.smart_diary.dto.LoginGoogleDTO;
import com.project1.smart_diary.dto.request.*;
import com.project1.smart_diary.dto.request.password.ChangePasswordRequest;
import com.project1.smart_diary.dto.request.password.ResetPasswordRequest;
import com.project1.smart_diary.dto.request.password.SendMailResetPassword;
import com.project1.smart_diary.dto.response.AuthenticationResponse;
import com.project1.smart_diary.dto.response.UserResponse;
import com.project1.smart_diary.security.JwtService;
import com.project1.smart_diary.service.AuthService;
import com.project1.smart_diary.service.ResetPassword.EmailService;
import com.project1.smart_diary.service.ResetPassword.PasswordResetService;
import com.project1.smart_diary.service.UserService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.web.bind.annotation.*;

import java.text.ParseException;
import java.time.LocalDateTime;
import java.util.Map;

@RestController
@RequestMapping("/auth")
public class AuthController {
    @Autowired
    private UserService userService;
    @Autowired
    private AuthService authService;
    @Autowired
    private EmailService emailService;
    @Autowired
    private PasswordResetService passwordResetService;
    @Autowired
    private JwtService jwtService;
    @PostMapping("/login")
    public ResponseEntity<AuthenticationResponse> login(@Valid @RequestBody LoginRequest loginRequest) {
        return ResponseEntity.ok(authService.login(loginRequest));
    }

    @PostMapping("/register")
    public ResponseEntity<UserResponse> register(@Valid @RequestBody UserCreateRequest userCreateRequest) {
        UserResponse userResponse = userService.createUser(userCreateRequest);
        return ResponseEntity.ok(userResponse);
    }
    @PostMapping("/logout")
    public ResponseEntity<String> logout(HttpServletRequest request) {
        authService.logout(request);
        return ResponseEntity.ok("Logout successful");
    }

    //http://localhost:8080/oauth2/authorization/google
    //https://lavona-nonproficient-roxana.ngrok-free.dev/oauth2/authorization/google
    //https://lavona-nonproficient-roxana.ngrok-free.dev/auth/login/google
    //http://localhost:8080/auth/login/google
    @GetMapping("/login/google")
    public ResponseEntity<AuthenticationResponse> loginGoogle(@AuthenticationPrincipal OAuth2User principal) {
        Map<String, Object> attributes = principal.getAttributes();
        String email = (String) attributes.get("email");
        String name = (String) attributes.get("name");
        String picture = (String) attributes.get("picture");
        String sub = (String) attributes.get("sub");
        //
        LoginGoogleDTO loginGoogleDTO = new LoginGoogleDTO();
        loginGoogleDTO.setEmail(email);
        loginGoogleDTO.setFullName(name);
        loginGoogleDTO.setAvatarUrl(picture);
        loginGoogleDTO.setCreatedAt(LocalDateTime.now());
        loginGoogleDTO.setProviderId(sub);
        userService.createUserWithGoogle(loginGoogleDTO);
        //
        return ResponseEntity.ok(authService.LoginWithGoogle(loginGoogleDTO));
    }

    @PostMapping("/change-password")
    public ResponseEntity<String> changePassword(@Valid @RequestBody ChangePasswordRequest changePasswordRequest) {
        String changePassword = authService.changePassword(changePasswordRequest);
        return ResponseEntity.ok(changePassword);

    }

    @PostMapping("/request-reset")
    public ResponseEntity<String> requestReset(@Valid @RequestBody SendMailResetPassword sendMailResetPassword) {
        emailService.checkMail(sendMailResetPassword.getEmail());
        String token = passwordResetService.createResetToken(sendMailResetPassword.getEmail());
        emailService.sendResetPasswordEmail(sendMailResetPassword.getEmail(), token);
        return ResponseEntity.ok("Link đặt lại mật khẩu đã được gửi tới email: " + sendMailResetPassword.getEmail());
    }

    @PostMapping("/reset-password")
    public ResponseEntity<String> resetPassword(@Valid @RequestBody ResetPasswordRequest resetPasswordRequest) {
        if (!resetPasswordRequest.getNewPassword().equals(resetPasswordRequest.getConfirmPassword())) {
            return ResponseEntity.badRequest().body("Mật khẩu xác nhận không khớp");
        }
        String email = passwordResetService.validateResetToken(resetPasswordRequest.getToken());
        if (email == null) {
            return ResponseEntity.badRequest().body("Token không hợp lệ hoặc đã hết hạn");
        }
        String res = authService.resetPassword(email, resetPasswordRequest.getNewPassword());
        passwordResetService.removeResetToken(resetPasswordRequest.getToken());
        return ResponseEntity.ok(res);
    }
    @PostMapping("/refresh")
    public ResponseEntity<AuthenticationResponse> refreshToken(@Valid @RequestBody RefreshTokenRequest refreshTokenRequest) throws ParseException, JOSEException {
        var res = jwtService.refreshToken(refreshTokenRequest);
        return ResponseEntity.ok(res);
    }
}
