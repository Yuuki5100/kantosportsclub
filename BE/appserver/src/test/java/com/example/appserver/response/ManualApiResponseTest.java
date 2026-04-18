package com.example.appserver.response;

import org.junit.jupiter.api.Test;

import com.example.appserver.response.manual.ManualApiResponse;

import static org.junit.jupiter.api.Assertions.*;

class ManualApiResponseTest {

    @Test
    void shouldCreateOkResponse() {
        String data = "data";

        ManualApiResponse<String> res = ManualApiResponse.ok(200, data);

        assertNotNull(res);
        assertEquals("OK", res.getResult());
        assertEquals(200, res.getStatusCode());
        assertNull(res.getArgs());
        assertEquals("data", res.getData());
    }

    @Test
    void shouldCreateClientErrorResponse() {
        ManualApiResponse<Object> res = ManualApiResponse.clientError(400, "pagesize");

        assertNotNull(res);
        assertEquals("Client Error", res.getResult());
        assertEquals(400, res.getStatusCode());
        assertEquals("pagesize", res.getArgs());
        assertNull(res.getData());
    }

    @Test
    void shouldCreateServerErrorResponse() {
        ManualApiResponse<Object> res = ManualApiResponse.serverError(500);

        assertNotNull(res);
        assertEquals("Server Error", res.getResult());
        assertEquals(500, res.getStatusCode());
        assertNull(res.getArgs());
        assertNull(res.getData());
    }
}
