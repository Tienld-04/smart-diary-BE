package com.project1.smart_diary.components;


import java.security.SecureRandom;
import java.util.Base64;

public class JwtKeyGenerator {
    public static String generateBase64Key(int bytes) {
        byte[] key = new byte[bytes];
        new SecureRandom().nextBytes(key);
        return Base64.getEncoder().encodeToString(key);
    }
//    public static void main(String[] args) {
//        // 64 bytes => 512 bits -> phù hợp cho HS512
//        String key512 = generateBase64Key(48);
//        System.out.println("512-bit base64 key (64 bytes):");
//        System.out.println(key512);
//    }
}
