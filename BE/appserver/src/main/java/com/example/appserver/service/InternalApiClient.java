package com.example.appserver.service;

import com.example.appserver.security.JwtTokenProvider;
import org.springframework.http.*;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import java.util.Map;

@Component
public class InternalApiClient {

    private final RestTemplate restTemplate;

    public InternalApiClient(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    /**
     * 一般的なPOSTリクエストを送信する（JSON形式）
     */
    public <T, R> ResponseEntity<R> post(
            String url,
            T body,
            String internalJwt,
            Class<R> responseType
    ) {
        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(internalJwt);
        headers.setContentType(MediaType.APPLICATION_JSON);

        HttpEntity<T> requestEntity = new HttpEntity<>(body, headers);

        return restTemplate.exchange(
                url,
                HttpMethod.POST,
                requestEntity,
                responseType
        );
    }

    /**
     * Map形式（JSONオブジェクト）をPOSTするためのユーティリティ（任意）
     */
    public <R> ResponseEntity<R> postFormData(
            String url,
            Map<String, String> formData,
            String internalJwt,
            Class<R> responseType
    ) {
        return this.post(url, formData, internalJwt, responseType);
    }

    /**
     * 一般的なGETリクエスト
     */
    public <R> ResponseEntity<R> get(
            String url,
            String internalJwt,
            Class<R> responseType
    ) {
        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(internalJwt);

        HttpEntity<Void> requestEntity = new HttpEntity<>(headers);

        return restTemplate.exchange(
                url,
                HttpMethod.GET,
                requestEntity,
                responseType
        );
    }
}
