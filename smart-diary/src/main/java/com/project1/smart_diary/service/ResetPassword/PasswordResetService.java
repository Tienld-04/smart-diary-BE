package com.project1.smart_diary.service.ResetPassword;


import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.util.UUID;
import java.util.concurrent.TimeUnit;

@Service
public class PasswordResetService {
    @Autowired
    private StringRedisTemplate redisTemplate;

    public String createResetToken(String email) {
        String token = UUID.randomUUID().toString();
        redisTemplate
                .opsForValue()
                .set("reset_token:" + token, email, 10, TimeUnit.MINUTES);
        return token;
    }

    public String validateResetToken(String token) {
        return redisTemplate.opsForValue().get("reset_token:" + token);
    }

    public void removeResetToken(String token) {
        redisTemplate.delete("reset_token:" + token);
    }
}
