package com.musicbooking.booking_service.config;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpRequest;
import org.springframework.http.client.ClientHttpRequestExecution;
import org.springframework.http.client.ClientHttpRequestInterceptor;
import org.springframework.http.client.ClientHttpResponse;
import org.springframework.web.client.RestTemplate;

import java.io.IOException;
import java.util.List;

/**
 * Configures a {@link RestTemplate} that automatically appends
 * an {@code X-API-Key} header to every outgoing request.
 *
 * <p>The key is loaded from the {@code API_KEY} environment variable
 * via the {@code api.key} application property. It is never hardcoded.</p>
 */
@Slf4j
@Configuration
public class RestTemplateConfig {

    @Value("${api.key}")
    private String apiKey;

    @Bean
    public RestTemplate restTemplate() {
        RestTemplate restTemplate = new RestTemplate();
        restTemplate.setInterceptors(List.of(new ApiKeyInterceptor(apiKey)));
        return restTemplate;
    }

    /**
     * Interceptor that injects the shared API key into every outgoing HTTP request.
     */
    static final class ApiKeyInterceptor implements ClientHttpRequestInterceptor {

        private static final String API_KEY_HEADER = "X-API-Key";
        private final String apiKey;

        ApiKeyInterceptor(String apiKey) {
            this.apiKey = apiKey;
        }

        @Override
        public ClientHttpResponse intercept(
                HttpRequest request,
                byte[] body,
                ClientHttpRequestExecution execution
        ) throws IOException {
            request.getHeaders().set(API_KEY_HEADER, apiKey);
            log.debug("Outgoing request to {} with API key header set", request.getURI());
            return execution.execute(request, body);
        }
    }
}
