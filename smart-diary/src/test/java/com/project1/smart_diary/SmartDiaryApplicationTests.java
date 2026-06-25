package com.project1.smart_diary;

import com.project1.smart_diary.config.EnvLoader;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;

@SpringBootTest
class SmartDiaryApplicationTests {


	static {
		EnvLoader.load();
	}
	@Test
	void contextLoads() {
	}
}
