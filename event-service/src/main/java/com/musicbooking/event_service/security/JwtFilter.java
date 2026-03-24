package com.musicbooking.event_service.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
 
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.security.Key;
import java.util.List;
 
@Component
public class JwtFilter extends OncePerRequestFilter {
 
    @Value("${jwt.secret}")
    private String secret;
 
    private Key getKey() {
        return Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
    }
 
    @Override
    protected void doFilterInternal(HttpServletRequest req, HttpServletResponse res,
                                    FilterChain chain) throws ServletException, IOException {
 
        String path   = req.getServletPath();
        String method = req.getMethod();
 
        if (HttpMethod.GET.matches(method)) {
            chain.doFilter(req, res);
            return;
        }
 
        if (HttpMethod.PUT.matches(method) && path.endsWith("/reduce-seats")) {
            chain.doFilter(req, res);
            return;
        }
 
        if (path.startsWith("/swagger-ui") || path.startsWith("/v3/api-docs")) {
            chain.doFilter(req, res);
            return;
        }
 
        String header = req.getHeader("Authorization");
        if (header == null || !header.startsWith("Bearer ")) {
            res.setStatus(HttpServletResponse.SC_FORBIDDEN);
            res.getWriter().write("Missing Authorization header");
            return;
        }
 
        try {
            String token = header.substring(7);
            Claims claims = Jwts.parserBuilder()
                    .setSigningKey(getKey()).build()
                    .parseClaimsJws(token).getBody();
 
            String userId = claims.getSubject();
            String role   = claims.get("role", String.class);
            if (role == null) role = "USER";
 
            req.setAttribute("userRole", role);
 
            List<SimpleGrantedAuthority> authorities =
                    List.of(new SimpleGrantedAuthority("ROLE_" + role));
 
            SecurityContextHolder.getContext().setAuthentication(
                    new UsernamePasswordAuthenticationToken(userId, null, authorities));
 
        } catch (Exception e) {
            res.setStatus(HttpServletResponse.SC_FORBIDDEN);
            res.getWriter().write("Invalid or expired token");
            return;
        }
 
        chain.doFilter(req, res);
    }
}