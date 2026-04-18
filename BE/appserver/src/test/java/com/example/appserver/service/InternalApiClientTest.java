package com.example.appserver.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.http.*;
import org.springframework.web.client.RestTemplate;

import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class InternalApiClientTest {

    private RestTemplate restTemplate;
    private InternalApiClient internalApiClient;

    @BeforeEach
    void setUp() {
        restTemplate = mock(RestTemplate.class);
        internalApiClient = new InternalApiClient(restTemplate);
    }

    @Test
    void post_ShouldSendRequestWithBearerAndJsonContentType() {
        String url = "http://example.com/api";
        Map<String, String> body = Map.of("key", "value");
        String jwt = "dummy-jwt";
        Class<String> responseType = String.class;

        ResponseEntity<String> mockResponse = new ResponseEntity<>("OK", HttpStatus.OK);
        when(restTemplate.exchange(anyString(), any(), any(), eq(responseType)))
                .thenReturn(mockResponse);

        ResponseEntity<String> response = internalApiClient.post(url, body, jwt, responseType);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals("OK", response.getBody());

        // ArgumentCaptorでHttpEntityを取得してヘッダー確認
        ArgumentCaptor<HttpEntity<Map<String, String>>> captor = ArgumentCaptor.forClass(HttpEntity.class);
        verify(restTemplate).exchange(eq(url), eq(HttpMethod.POST), captor.capture(), eq(responseType));

        HttpHeaders headers = captor.getValue().getHeaders();
        assertEquals("Bearer " + jwt, headers.getFirst(HttpHeaders.AUTHORIZATION));
        assertEquals(MediaType.APPLICATION_JSON, headers.getContentType());
        assertEquals(body, captor.getValue().getBody());
    }

    @Test
    void postFormData_ShouldDelegateToPost() {
        InternalApiClient spyClient = spy(internalApiClient);

        String url = "http://example.com/api";
        Map<String, String> formData = Map.of("param", "value");
        String jwt = "jwt-token";
        Class<String> responseType = String.class;

        ResponseEntity<String> mockResponse = new ResponseEntity<>("OK", HttpStatus.OK);
        doReturn(mockResponse).when(spyClient).post(url, formData, jwt, responseType);

        ResponseEntity<String> response = spyClient.postFormData(url, formData, jwt, responseType);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals("OK", response.getBody());

        verify(spyClient).post(url, formData, jwt, responseType);
    }

    @Test
    void get_ShouldSendRequestWithBearer() {
        String url = "http://example.com/get";
        String jwt = "jwt-token";
        Class<String> responseType = String.class;

        ResponseEntity<String> mockResponse = new ResponseEntity<>("GET_OK", HttpStatus.OK);
        when(restTemplate.exchange(anyString(), any(), any(), eq(responseType)))
                .thenReturn(mockResponse);

        ResponseEntity<String> response = internalApiClient.get(url, jwt, responseType);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals("GET_OK", response.getBody());

        ArgumentCaptor<HttpEntity<Void>> captor = ArgumentCaptor.forClass(HttpEntity.class);
        verify(restTemplate).exchange(eq(url), eq(HttpMethod.GET), captor.capture(), eq(responseType));

        HttpHeaders headers = captor.getValue().getHeaders();
        assertEquals("Bearer " + jwt, headers.getFirst(HttpHeaders.AUTHORIZATION));
        assertNull(captor.getValue().getBody());
    }
}
