package com.project1.smart_diary.service;

import com.nimbusds.jose.*;
import com.nimbusds.jose.crypto.MACSigner;
import com.nimbusds.jose.crypto.MACVerifier;
import com.nimbusds.jwt.JWTClaimsSet;
import com.nimbusds.jwt.SignedJWT;
import com.project1.smart_diary.converter.UserConverter;
import com.project1.smart_diary.dto.LoginGoogleDTO;
import com.project1.smart_diary.dto.request.password.ChangePasswordRequest;
import com.project1.smart_diary.dto.request.LoginRequest;
import com.project1.smart_diary.dto.response.AuthenticationResponse;
import com.project1.smart_diary.entity.InvalidatedToken;
import com.project1.smart_diary.entity.UserEntity;
import com.project1.smart_diary.enums.AuthProvider;
import com.project1.smart_diary.exception.ApplicationException;
import com.project1.smart_diary.exception.ErrorCode;
import com.project1.smart_diary.repository.InvalidatedTokenRepository;
import com.project1.smart_diary.repository.UserRepository;
import com.project1.smart_diary.security.JwtService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.experimental.NonFinal;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.text.ParseException;
import java.time.temporal.ChronoUnit;
import java.util.Date;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthService {
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private UserConverter  userConverter;
    @Autowired
    private PasswordEncoder passwordEncoder;
    @Autowired
    private JwtService jwtService;
    @Autowired
    private InvalidatedTokenRepository invalidateTokenRepository;

    public AuthenticationResponse login(LoginRequest loginRequest) {
        UserEntity user = userRepository.findByEmail(loginRequest.getEmail());
        if (user == null) {
            throw new ApplicationException(ErrorCode.EMAIL_NOT_EXISTED);
        }
        PasswordEncoder passwordEncoder = new BCryptPasswordEncoder(10);
        boolean authenticated = passwordEncoder.matches(loginRequest.getPassword(), user.getPassword());
        if (!authenticated) {
            throw new ApplicationException(ErrorCode.PASSWORD_NOT_EXISTED);
        }
        String token = jwtService.genToken(user);
        return AuthenticationResponse.builder()
                .token(token)
                .authenticated(true)
                .user(userConverter.convertToUserResponse(user))
                .build();
    }
    public AuthenticationResponse LoginWithGoogle(LoginGoogleDTO loginGoogleDTO) {
        UserEntity user = userRepository.findByEmail(loginGoogleDTO.getEmail());
        if (user == null) {
            throw new ApplicationException(ErrorCode.EMAIL_NOT_EXISTED);
        }
//        PasswordEncoder passwordEncoder = new BCryptPasswordEncoder(10);
//        boolean authenticated = passwordEncoder.matches(loginRequest.getPassword(), user.getPassword());
//        if (!authenticated) {
//            throw new ApplicationException(ErrorCode.UNAUTHENTICATED);
//        }
        String token = jwtService.genToken(user);
        return AuthenticationResponse.builder()
                .token(token)
                .authenticated(true)
                .user(userConverter.convertToUserResponse(user))
                .build();
    }
    //
    @Transactional
    public String changePassword(ChangePasswordRequest changePasswordRequest) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        UserEntity user = userRepository.findByEmail(email);
        if(user == null) {
            throw new ApplicationException(ErrorCode.USER_NOT_EXISTED);
        }
        if(!changePasswordRequest.getNewPassword().equals(changePasswordRequest.getConfirmNewPassword())){
            throw new RuntimeException("Xác nhận mật khẩu không khớp");
        }
        if(user.getProvider().equals(AuthProvider.GOOGLE)){
            user.setPassword(passwordEncoder.encode(changePasswordRequest.getNewPassword()));
            user.setProvider(AuthProvider.LOCAL);
        }else{
            if(!passwordEncoder.matches(changePasswordRequest.getOldPassword(), user.getPassword())){
                throw new ApplicationException(ErrorCode.PASSWORD_INVALID);
            }
            user.setPassword(passwordEncoder.encode(changePasswordRequest.getNewPassword()));
        }
        userRepository.save(user);
        return "Change Password Success";
    }
    @Transactional
    public String resetPassword(String email, String newPassword){
        UserEntity user = userRepository.findByEmail(email);
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
        return "Change Password Success email: " + email;
    }
    @Transactional
    public void logout(HttpServletRequest request) {
        String authHeader = request.getHeader("Authorization");
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            throw new ApplicationException(ErrorCode.UNAUTHENTICATED);
        }
        String token = authHeader.substring(7);
        try {
            SignedJWT signedJWT = jwtService.verifyToken(token, false);
            String jti = signedJWT.getJWTClaimsSet().getJWTID();
            Date expiryTime = signedJWT.getJWTClaimsSet().getExpirationTime();
            InvalidatedToken invalidatedToken = InvalidatedToken.builder()
                    .jti(jti)
                    .expiryTime(expiryTime)
                    .build();
            invalidateTokenRepository.save(invalidatedToken);
            log.info("Token with jti={} invalidated until {}", jti, expiryTime);
        } catch (ParseException | JOSEException e) {
            throw new ApplicationException(ErrorCode.UNAUTHENTICATED);
        }

    }
}
