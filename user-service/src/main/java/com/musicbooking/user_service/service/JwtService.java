package com.musicbooking.user_service.service;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
 
import java.nio.charset.StandardCharsets;
import java.security.Key;
import java.util.Date;
 
@Service
public class JwtService {
 
    @Value("${jwt.secret}")
    private String secret;
 
    private static final long EXPIRY_MS = 24 * 60 * 60 * 1000L; // 24 hours
 
    private Key getKey() {
        return Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
    }
 
    public String generateToken(String userId, String role) {
        return Jwts.builder()
                .setSubject(userId)
                .claim("role", role)
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + EXPIRY_MS))
                .signWith(getKey(), SignatureAlgorithm.HS256)
                .compact();
    }
 
    public String generateToken(String userId) {
        return generateToken(userId, "USER");
    }
 
    public void validateToken(String token) {
        Jwts.parserBuilder().setSigningKey(getKey()).build().parseClaimsJws(token);
    }
 
    public String extractUserId(String token) {
        return getClaims(token).getSubject();
    }
 
    public String extractRole(String token) {
        return getClaims(token).get("role", String.class);
    }
 
    private Claims getClaims(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(getKey()).build()
                .parseClaimsJws(token).getBody();
    }
}
