package com.project1.smart_diary;

import com.project1.smart_diary.config.EnvLoader;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class SmartDiaryApplication {

	public static void main(String[] args) {
		EnvLoader.load();
		SpringApplication.run(SmartDiaryApplication.class, args);
	}

}
