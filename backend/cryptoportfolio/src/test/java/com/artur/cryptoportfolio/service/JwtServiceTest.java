package com.artur.cryptoportfolio.service;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class JwtServiceTest {

    private static final String SECRET_A = "a-test-signing-secret-at-least-32-bytes-long-2026";
    private static final String SECRET_B = "another-test-signing-secret-at-least-32-bytes-long";

    @Test
    void rejectsWeakSigningSecret() {
        assertThrows(IllegalArgumentException.class, () -> new JwtService("short"));
    }

    @Test
    void generatesAndValidatesSignedToken() {
        JwtService service = new JwtService(SECRET_A);
        String token = service.generateToken("developer@example.com");

        assertTrue(service.isTokenValid(token));
        assertEquals("developer@example.com", service.extractEmail(token));
    }

    @Test
    void rejectsTokenSignedWithAnotherKey() {
        String token = new JwtService(SECRET_A).generateToken("developer@example.com");

        assertFalse(new JwtService(SECRET_B).isTokenValid(token));
    }

    @Test
    void rejectsMalformedToken() {
        assertFalse(new JwtService(SECRET_A).isTokenValid("not-a-jwt"));
    }
}
