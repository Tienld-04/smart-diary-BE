package com.project1.smart_diary.config;


import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestTemplate;

import java.util.Map;
@Getter
@Setter
@Configuration
@ConfigurationProperties(prefix = "gemini.api")
public class GeminiApiConfig {

    private String key;
    private String url;
    private Map<String, String> endpoints;

    public void test() {
        System.out.println("API Key: " + key + " URL: " + url);
        System.out.println("Text Endpoint: " + endpoints.get("text-generation"));
    }
    @Bean
    public RestTemplate restTemplate() {
        return new RestTemplate();
    }

}
