package com.musicbooking.booking_service.security;

import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;

/**
 * JWT utility for validating incoming tokens and extracting claims.
 *
 * <p>The signing secret is loaded from the {@code JWT_SECRET} environment variable
 * via the {@code jwt.secret} application property. It is never hardcoded.</p>
 */
@Slf4j
@Component
public class JwtUtil {

    private final SecretKey signingKey;

    public JwtUtil(@Value("${jwt.secret}") String secret) {
        this.signingKey = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
    }

    /**
     * Validates a JWT token and returns {@code true} if it is valid.
     *
     * @param token the raw JWT string (without the "Bearer " prefix)
     * @return {@code true} if parsing succeeds; {@code false} on any exception
     */
    public boolean validateToken(String token) {
        try {
            Jwts.parser()
                    .verifyWith(signingKey)
                    .build()
                    .parseSignedClaims(token);
            return true;
        } catch (JwtException | IllegalArgumentException ex) {
            log.warn("Invalid JWT: {}", ex.getMessage());
            return false;
        }
    }

    /**
     * Extracts the subject (typically the username or userId) from a valid token.
     *
     * @param token the raw JWT string
     * @return the subject claim value
     */
    public String extractSubject(String token) {
        return Jwts.parser()
                .verifyWith(signingKey)
                .build()
                .parseSignedClaims(token)
                .getPayload()
                .getSubject();
    }
}
