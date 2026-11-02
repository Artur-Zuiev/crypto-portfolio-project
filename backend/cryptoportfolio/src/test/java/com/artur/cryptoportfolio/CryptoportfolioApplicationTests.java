package com.artur.cryptoportfolio;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;

@SpringBootTest(properties = "app.jwt.secret=a-test-signing-secret-at-least-32-bytes-long-2026")
class CryptoportfolioApplicationTests {

	@Test
	void contextLoads() {
	}

}
