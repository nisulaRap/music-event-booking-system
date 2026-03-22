package com.musicbooking.payment_service.service;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
 
import java.nio.charset.StandardCharsets;
import java.security.Key;
 
@Service
public class JwtService {
 
    @Value("${jwt.secret}")
    private String secret;
 
    private Key getKey() {
        return Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
    }
 
    public void validateToken(String token) {
        Jwts.parserBuilder().setSigningKey(getKey()).build().parseClaimsJws(token);
    }
 
    public String extractUserId(String token) {
        Claims claims = Jwts.parserBuilder()
                .setSigningKey(getKey()).build()
                .parseClaimsJws(token).getBody();
        return claims.getSubject();
    }
}
