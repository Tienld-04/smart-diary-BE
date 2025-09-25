package com.project1.smart_diary.config;
import com.project1.smart_diary.repository.InvalidatedTokenRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.oauth2.core.OAuth2Error;
import org.springframework.security.oauth2.core.OAuth2TokenValidator;
import org.springframework.security.oauth2.core.OAuth2TokenValidatorResult;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Component;

@Configuration
public class InvalidatedJwtValidator implements OAuth2TokenValidator<Jwt> {

//    @Autowired
//    private InvalidatedTokenRepository  invalidatedTokenRepository;
    private final InvalidatedTokenRepository invalidatedTokenRepository;

    public InvalidatedJwtValidator(InvalidatedTokenRepository invalidatedTokenRepository) {
        this.invalidatedTokenRepository = invalidatedTokenRepository;
    }
    @Override
    public OAuth2TokenValidatorResult validate(Jwt jwt) {
        String jti = jwt.getId(); // "jti" claim
        if (jti != null && invalidatedTokenRepository.existsByJti(jti)) {
            OAuth2Error error = new OAuth2Error("invalid_token", "Token has been invalidated", null);
            return OAuth2TokenValidatorResult.failure(error);
        }
        return OAuth2TokenValidatorResult.success();
    }
}