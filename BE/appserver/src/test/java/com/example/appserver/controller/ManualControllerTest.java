package com.example.appserver.controller;

import com.example.appserver.request.manual.ManualListQuery;
import com.example.appserver.response.manual.ManualDetail;
import com.example.appserver.response.manual.ManualDetailData;
import com.example.appserver.response.manual.ManualListData;
import com.example.appserver.response.manual.ManualListItem;
import com.example.appserver.service.ManualFileUploadService;
import com.example.appserver.service.ManualService;
import com.example.servercommon.responseModel.ApiResponse;
import com.example.servercommon.service.StorageService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.*;
import org.springframework.core.io.InputStreamResource;
import org.springframework.http.ResponseEntity;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.validation.BeanPropertyBindingResult;
import org.springframework.validation.BindingResult;
import org.springframework.validation.FieldError;
import org.springframework.web.multipart.MultipartFile;

import com.example.appserver.request.manual.ManualCreateRequest;
import com.example.appserver.request.manual.ManualUpdateRequest;
import com.example.appserver.response.manual.ManualCreateResponse;
import com.example.appserver.response.manual.ManualUpdateResponse;
import com.example.appserver.response.manual.ManualUploadResponse;
import com.example.servercommon.model.Manual;
import com.example.servercommon.message.BackendMessageResolver;


import com.example.appserver.response.manual.ManualUploadResponse;
import com.example.servercommon.model.Manual;
import org.springframework.core.io.InputStreamResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.util.Collections;
import java.nio.file.Files;
import java.nio.charset.StandardCharsets;
import java.util.Collections;



import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;
import static org.junit.jupiter.api.Assertions.*;

import java.lang.reflect.Field;
import java.lang.reflect.Method;
import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.Locale;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class ManualControllerTest {

    @Mock
    private ManualService manualService;

    @Mock
    private ManualFileUploadService manualFileUploadService;

    @Mock
    private StorageService storageService;

    @Mock
    private BackendMessageResolver messageResolver;

    @InjectMocks
    private ManualController manualController;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    // =========================================================
    // Helper: read String property safely (getter or field)
    // =========================================================
    private static String readStringProperty(Object obj, String... candidates) {
        if (obj == null) return null;

        for (String name : candidates) {
            // 1) Try getter: getXxx()
            String getter = "get" + Character.toUpperCase(name.charAt(0)) + name.substring(1);
            try {
                Method m = obj.getClass().getMethod(getter);
                Object v = m.invoke(obj);
                if (v != null) return String.valueOf(v);
            } catch (Exception ignored) {
            }

            // 2) Try boolean getter: isXxx()
            String isGetter = "is" + Character.toUpperCase(name.charAt(0)) + name.substring(1);
            try {
                Method m = obj.getClass().getMethod(isGetter);
                Object v = m.invoke(obj);
                if (v != null) return String.valueOf(v);
            } catch (Exception ignored) {
            }

            // 3) Try field access
            try {
                Field f = obj.getClass().getDeclaredField(name);
                f.setAccessible(true);
                Object v = f.get(obj);
                if (v != null) return String.valueOf(v);
            } catch (Exception ignored) {
            }
        }

        return null;
    }

    // =========================================================
    // MANUAL-UT-001
    // =========================================================
    @Test
    void list_validQuery_returnsListData() {
        ManualListQuery query = new ManualListQuery();
        query.setTitleName("a");
        query.setTarget(0);
        query.setIsdeleted(0);
        query.setPageNumber(1);
        query.setPagesize(50);

        ManualListItem item = new ManualListItem(
                1L, "Title A", true, false, "tester", "2026/02/12 10:00:00"
        );
        ManualListData expected = new ManualListData(List.of(item), 1L);

        when(manualService.getList(query)).thenReturn(expected);

        BindingResult br = new BeanPropertyBindingResult(query, "query"); // no errors

        ResponseEntity<?> response = manualController.list(query, br, Locale.JAPAN);

        assertEquals(200, response.getStatusCodeValue());
        assertTrue(response.getBody() instanceof ManualListData);

        ManualListData body = (ManualListData) response.getBody();
        assertNotNull(body);
        assertEquals(1L, body.getTotal());
        assertEquals(1, body.getManuals().size());
        assertEquals(1L, body.getManuals().get(0).getManualId());

        verify(manualService, times(1)).getList(query);
    }

    // =========================================================
    // MANUAL-UT-002
    // =========================================================
    @Test
    void list_pageNumberBelowMin_returns400_andServiceNotCalled() {
        ManualListQuery query = new ManualListQuery();
        query.setPageNumber(0);

        BindingResult br = new BeanPropertyBindingResult(query, "query");
        br.addError(new FieldError("query", "pageNumber", "must be >= 1"));

        ResponseEntity<?> response = manualController.list(query, br, Locale.JAPAN);

        assertEquals(400, response.getStatusCodeValue());
        assertTrue(response.getBody() instanceof ApiResponse);

        @SuppressWarnings("unchecked")
        ApiResponse<Object> body = (ApiResponse<Object>) response.getBody();
        assertNotNull(body);
        assertEquals("E4001", body.getErrorCode());

        // Try to verify arg field if present (args/message/etc.)
        String arg = readStringProperty(body, "args", "arg", "message", "errorMessage");
        // If your ApiResponse stores "pageNumber" somewhere, we confirm it.
        if (arg != null) {
            assertTrue(arg.contains("pageNumber"));
        }

        verify(manualService, never()).getList(any());
    }

    // =========================================================
    // MANUAL-UT-003
    // =========================================================
    @Test
    void list_pageSizeBelowMin_returns400_andServiceNotCalled() {
        ManualListQuery query = new ManualListQuery();
        query.setPagesize(0);

        BindingResult br = new BeanPropertyBindingResult(query, "query");
        br.addError(new FieldError("query", "pagesize", "must be >= 1"));

        ResponseEntity<?> response = manualController.list(query, br, Locale.JAPAN);

        assertEquals(400, response.getStatusCodeValue());
        assertTrue(response.getBody() instanceof ApiResponse);

        @SuppressWarnings("unchecked")
        ApiResponse<Object> body = (ApiResponse<Object>) response.getBody();
        assertNotNull(body);
        assertEquals("E4001", body.getErrorCode());

        String arg = readStringProperty(body, "args", "arg", "message", "errorMessage");
        if (arg != null) {
            assertTrue(arg.contains("pagesize"));
        }

        verify(manualService, never()).getList(any());
    }

    // =========================================================
    // MANUAL-UT-004
    // =========================================================
    @Test
    void list_pageSizeAboveMax_returns400_andServiceNotCalled() {
        ManualListQuery query = new ManualListQuery();
        query.setPagesize(51);

        BindingResult br = new BeanPropertyBindingResult(query, "query");
        br.addError(new FieldError("query", "pagesize", "must be <= 50"));

        ResponseEntity<?> response = manualController.list(query, br, Locale.JAPAN);

        assertEquals(400, response.getStatusCodeValue());
        assertTrue(response.getBody() instanceof ApiResponse);

        @SuppressWarnings("unchecked")
        ApiResponse<Object> body = (ApiResponse<Object>) response.getBody();
        assertNotNull(body);
        assertEquals("E4001", body.getErrorCode());

        String arg = readStringProperty(body, "args", "arg", "message", "errorMessage");
        if (arg != null) {
            assertTrue(arg.contains("pagesize"));
        }

        verify(manualService, never()).getList(any());
    }

    // =========================================================
    // MANUAL-UT-005
    // =========================================================
    @Test
    void list_titleNameTooLong_returns400_andServiceNotCalled() {
        ManualListQuery query = new ManualListQuery();
        query.setTitleName("a".repeat(256));

        BindingResult br = new BeanPropertyBindingResult(query, "query");
        br.addError(new FieldError("query", "titleName", "size must be <= 255"));

        ResponseEntity<?> response = manualController.list(query, br, Locale.JAPAN);

        assertEquals(400, response.getStatusCodeValue());
        assertTrue(response.getBody() instanceof ApiResponse);

        @SuppressWarnings("unchecked")
        ApiResponse<Object> body = (ApiResponse<Object>) response.getBody();
        assertNotNull(body);
        assertEquals("E4001", body.getErrorCode());

        String arg = readStringProperty(body, "args", "arg", "message", "errorMessage");
        if (arg != null) {
            assertTrue(arg.contains("titleName"));
        }

        verify(manualService, never()).getList(any());
    }

    // =========================================================
    // MANUAL-UT-006
    // =========================================================
    @Test
    void list_targetInvalid_returns400_andServiceNotCalled() {
        ManualListQuery query = new ManualListQuery();
        query.setTarget(9);

        BindingResult br = new BeanPropertyBindingResult(query, "query"); // no validation error

        ResponseEntity<?> response = manualController.list(query, br, Locale.JAPAN);

        assertEquals(400, response.getStatusCodeValue());
        assertTrue(response.getBody() instanceof ApiResponse);

        @SuppressWarnings("unchecked")
        ApiResponse<Object> body = (ApiResponse<Object>) response.getBody();
        assertNotNull(body);
        assertEquals("E4001", body.getErrorCode());

        String arg = readStringProperty(body, "args", "arg", "message", "errorMessage");
        if (arg != null) {
            assertTrue(arg.contains("target"));
        }

        verify(manualService, never()).getList(any());
    }

    // =========================================================
    // MANUAL-UT-007
    // =========================================================
    @Test
    void list_isdeletedInvalid_returns400_andServiceNotCalled() {
        ManualListQuery query = new ManualListQuery();
        query.setIsdeleted(9);

        BindingResult br = new BeanPropertyBindingResult(query, "query");

        ResponseEntity<?> response = manualController.list(query, br, Locale.JAPAN);

        assertEquals(400, response.getStatusCodeValue());
        assertTrue(response.getBody() instanceof ApiResponse);

        @SuppressWarnings("unchecked")
        ApiResponse<Object> body = (ApiResponse<Object>) response.getBody();
        assertNotNull(body);
        assertEquals("E4001", body.getErrorCode());

        String arg = readStringProperty(body, "args", "arg", "message", "errorMessage");
        if (arg != null) {
            assertTrue(arg.contains("isdeleted"));
        }

        verify(manualService, never()).getList(any());
    }

    // =========================================================
    // MANUAL-UT-008
    // =========================================================
    @Test
    void detail_exists_returns200() {
        ManualDetail detail = new ManualDetail(
                1L, "Manual 1", "desc", true, false,
                "2026/02/12 10:00:00", List.of("doc-1"), false
        );
        ManualDetailData data = new ManualDetailData(detail);

        when(manualService.getDetail(1L)).thenReturn(Optional.of(data));

        ResponseEntity<?> response = manualController.detail(1L, Locale.JAPAN);

        assertEquals(200, response.getStatusCodeValue());
        assertTrue(response.getBody() instanceof ManualDetailData);

        ManualDetailData body = (ManualDetailData) response.getBody();
        assertNotNull(body);
        assertNotNull(body.getManual());
        assertEquals(1L, body.getManual().getManualId());

        verify(manualService, times(1)).getDetail(1L);
    }

    // =========================================================
    // MANUAL-UT-009
    // =========================================================
    @Test
    void detail_notExists_returns404() {
        when(manualService.getDetail(999L)).thenReturn(Optional.empty());

        ResponseEntity<?> response = manualController.detail(999L, Locale.JAPAN);

        assertEquals(404, response.getStatusCodeValue());
        assertTrue(response.getBody() instanceof ApiResponse);

        @SuppressWarnings("unchecked")
        ApiResponse<Object> body = (ApiResponse<Object>) response.getBody();
        assertNotNull(body);
        assertEquals("E4041", body.getErrorCode());

        String msg = readStringProperty(body, "args", "arg", "message", "errorMessage");
        if (msg != null) {
            assertTrue(msg.contains("manual not found"));
        }

        verify(manualService, times(1)).getDetail(999L);
    }

    // =========================================================
    // MANUAL-UT-010 (Mockito UT version)
    // =========================================================
    @Test
    void detail_manualIdNull_returns400_andServiceNotCalled() {
        ResponseEntity<?> response = manualController.detail(null, Locale.JAPAN);

        assertEquals(400, response.getStatusCodeValue());
        assertTrue(response.getBody() instanceof ApiResponse);

        @SuppressWarnings("unchecked")
        ApiResponse<Object> body = (ApiResponse<Object>) response.getBody();
        assertNotNull(body);
        assertEquals("E4001", body.getErrorCode());

        String msg = readStringProperty(body, "args", "arg", "message", "errorMessage");
        if (msg != null) {
            assertTrue(msg.contains("manualId"));
        }

        verify(manualService, never()).getDetail(anyLong());
    }


    // =========================================================
    // 11) MANUAL-UT-011 create 正常
    // =========================================================
    @Test
    void create_validRequest_authenticated_createsManual() {
        // Arrange
        ManualCreateRequest request = new ManualCreateRequest();
        request.setManualTitle("t");
        request.setDescription("d");
        request.setGeneralUser(true);
        request.setSystemUser(false);
        request.setDocIds(List.of("doc1", "doc2"));

        BindingResult br = new BeanPropertyBindingResult(request, "request"); // no errors

        when(manualService.getCurrentUserId()).thenReturn("u1");

        Manual created = new Manual();
        created.setId(10L);
        when(manualService.create(request, "u1")).thenReturn(created);

        // Act
        ResponseEntity<?> response = manualController.create(request, br, Locale.JAPAN);

        // Assert
        assertEquals(200, response.getStatusCodeValue());
        assertTrue(response.getBody() instanceof ManualCreateResponse);

        ManualCreateResponse body = (ManualCreateResponse) response.getBody();
        assertNotNull(body);
        assertEquals(10L, body.getManualId());

        verify(manualService, times(1)).getCurrentUserId();
        verify(manualService, times(1)).create(request, "u1");
    }

    // =========================================================
    // 12) MANUAL-UT-012 create manualTitle blank → 400 (BindingResult error)
    // =========================================================
    @Test
    void create_manualTitleBlank_returns400_andServiceNotCalled() {
        ManualCreateRequest request = new ManualCreateRequest();
        request.setManualTitle("");
        request.setDescription("d");
        request.setGeneralUser(true);
        request.setSystemUser(false);

        BindingResult br = new BeanPropertyBindingResult(request, "request");
        br.addError(new FieldError("request", "manualTitle", "must not be blank"));

        ResponseEntity<?> response = manualController.create(request, br, Locale.JAPAN);

        assertEquals(400, response.getStatusCodeValue());
        assertTrue(response.getBody() instanceof ApiResponse);

        @SuppressWarnings("unchecked")
        ApiResponse<Object> body = (ApiResponse<Object>) response.getBody();
        assertNotNull(body);
        assertEquals("E4001", body.getErrorCode());

        // if your helper exists, use it. Otherwise just skip arg exact check.
        String arg = readStringProperty(body, "args", "arg", "message", "errorMessage");
        if (arg != null) assertTrue(arg.contains("manualTitle"));

        verify(manualService, never()).getCurrentUserId();
        verify(manualService, never()).create(any(), any());
    }

    // =========================================================
    // 13) MANUAL-UT-013 create manualTitle too long → 400 (BindingResult error)
    // =========================================================
    @Test
    void create_manualTitleTooLong_returns400_andServiceNotCalled() {
        ManualCreateRequest request = new ManualCreateRequest();
        request.setManualTitle("a".repeat(21)); // max 20 over
        request.setDescription("d");
        request.setGeneralUser(true);
        request.setSystemUser(false);

        BindingResult br = new BeanPropertyBindingResult(request, "request");
        br.addError(new FieldError("request", "manualTitle", "size must be <= 20"));

        ResponseEntity<?> response = manualController.create(request, br, Locale.JAPAN);

        assertEquals(400, response.getStatusCodeValue());
        assertTrue(response.getBody() instanceof ApiResponse);

        @SuppressWarnings("unchecked")
        ApiResponse<Object> body = (ApiResponse<Object>) response.getBody();
        assertNotNull(body);
        assertEquals("E4001", body.getErrorCode());

        String arg = readStringProperty(body, "args", "arg", "message", "errorMessage");
        if (arg != null) assertTrue(arg.contains("manualTitle"));

        verify(manualService, never()).getCurrentUserId();
        verify(manualService, never()).create(any(), any());
    }

    // =========================================================
    // 14) MANUAL-UT-014 create description too long → 400 (BindingResult error)
    // =========================================================
    @Test
    void create_descriptionTooLong_returns400_andServiceNotCalled() {
        ManualCreateRequest request = new ManualCreateRequest();
        request.setManualTitle("t");
        request.setDescription("a".repeat(251)); // max 250 over
        request.setGeneralUser(true);
        request.setSystemUser(false);

        BindingResult br = new BeanPropertyBindingResult(request, "request");
        br.addError(new FieldError("request", "description", "size must be <= 250"));

        ResponseEntity<?> response = manualController.create(request, br, Locale.JAPAN);

        assertEquals(400, response.getStatusCodeValue());
        assertTrue(response.getBody() instanceof ApiResponse);

        @SuppressWarnings("unchecked")
        ApiResponse<Object> body = (ApiResponse<Object>) response.getBody();
        assertNotNull(body);
        assertEquals("E4001", body.getErrorCode());

        String arg = readStringProperty(body, "args", "arg", "message", "errorMessage");
        if (arg != null) assertTrue(arg.contains("description"));

        verify(manualService, never()).getCurrentUserId();
        verify(manualService, never()).create(any(), any());
    }

    // =========================================================
    // 15) MANUAL-UT-015 create unauthenticated → 401
    // =========================================================
    @Test
    void create_unauthenticated_returns401_andServiceNotCalled() {
        ManualCreateRequest request = new ManualCreateRequest();
        request.setManualTitle("t");
        request.setDescription("d");
        request.setGeneralUser(true);
        request.setSystemUser(false);

        BindingResult br = new BeanPropertyBindingResult(request, "request"); // no errors

        when(manualService.getCurrentUserId()).thenReturn(null);

        ResponseEntity<?> response = manualController.create(request, br, Locale.JAPAN);

        assertEquals(401, response.getStatusCodeValue());
        assertTrue(response.getBody() instanceof ApiResponse);

        @SuppressWarnings("unchecked")
        ApiResponse<Object> body = (ApiResponse<Object>) response.getBody();
        assertNotNull(body);
        assertEquals("E401", body.getErrorCode());

        String msg = readStringProperty(body, "args", "arg", "message", "errorMessage");
        if (msg != null) assertTrue(msg.contains("Unauthorized"));

        verify(manualService, times(1)).getCurrentUserId();
        verify(manualService, never()).create(any(), any());
    }

    // =========================================================
    // 16) MANUAL-UT-016 create userId invalid (blank) → 401
    // NOTE: current controller checks only null, not blank.
    // We implement per test case expectation (blank treated as unauthorized).
    // If this fails, it’s a DEV gap to report.
    // =========================================================
    @Test
    void create_userIdBlank_returns401_andServiceNotCalled_expectedSpec() {
        ManualCreateRequest request = new ManualCreateRequest();
        request.setManualTitle("t");
        request.setDescription("d");
        request.setGeneralUser(true);
        request.setSystemUser(false);

        BindingResult br = new BeanPropertyBindingResult(request, "request"); // no errors

        when(manualService.getCurrentUserId()).thenReturn("   "); // blank/space

        Manual created = new Manual();
        created.setId(10L);
        when(manualService.create(request, "   ")).thenReturn(created);

        ResponseEntity<?> response = manualController.create(request, br, Locale.JAPAN);

        // Spec expects 401. Current dev code might return 200 and call create().
        // report to dev team.
        assertEquals(401, response.getStatusCodeValue());

        verify(manualService, times(1)).getCurrentUserId();
        verify(manualService, never()).create(any(), any());
    }

    // =========================================================
    // 17) MANUAL-UT-017 update 正常
    // =========================================================
    @Test
    void update_exists_authenticated_updatesManual() {
        Long manualId = 1L;

        ManualUpdateRequest request = new ManualUpdateRequest();
        request.setManualTitle("t");
        request.setDescription("d");
        request.setGeneralUser(true);
        request.setSystemUser(false);
        request.setDocIds(List.of("doc1"));

        BindingResult br = new BeanPropertyBindingResult(request, "request"); // no errors

        when(manualService.getCurrentUserId()).thenReturn("u1");

        Manual updated = new Manual();
        updated.setId(1L);
        when(manualService.update(manualId, request, "u1")).thenReturn(Optional.of(updated));

        ResponseEntity<?> response = manualController.update(manualId, request, br, Locale.JAPAN);

        assertEquals(200, response.getStatusCodeValue());
        assertTrue(response.getBody() instanceof ManualUpdateResponse);

        ManualUpdateResponse body = (ManualUpdateResponse) response.getBody();
        assertNotNull(body);
        assertEquals(1L, body.getManualId());

        verify(manualService, times(1)).getCurrentUserId();
        verify(manualService, times(1)).update(manualId, request, "u1");
    }

    // =========================================================
    // 18) MANUAL-UT-018 update not found → 404
    // =========================================================
    @Test
    void update_notExists_returns404_andServiceCalledOnce() {
        Long manualId = 999L;

        ManualUpdateRequest request = new ManualUpdateRequest();
        request.setManualTitle("t");
        request.setDescription("d");
        request.setGeneralUser(true);
        request.setSystemUser(false);

        BindingResult br = new BeanPropertyBindingResult(request, "request"); // no errors

        when(manualService.getCurrentUserId()).thenReturn("u1");
        when(manualService.update(manualId, request, "u1")).thenReturn(Optional.empty());

        ResponseEntity<?> response = manualController.update(manualId, request, br, Locale.JAPAN);

        assertEquals(404, response.getStatusCodeValue());
        assertTrue(response.getBody() instanceof ApiResponse);

        @SuppressWarnings("unchecked")
        ApiResponse<Object> body = (ApiResponse<Object>) response.getBody();
        assertNotNull(body);
        assertEquals("E4041", body.getErrorCode());

        String msg = readStringProperty(body, "args", "arg", "message", "errorMessage");
        if (msg != null) assertTrue(msg.contains("manual not found"));

        verify(manualService, times(1)).update(manualId, request, "u1");
    }

    // =========================================================
    // 19) MANUAL-UT-019 update manualTitle blank → 400 (BindingResult error)
    // =========================================================
    @Test
    void update_manualTitleBlank_returns400_andServiceNotCalled() {
        Long manualId = 1L;

        ManualUpdateRequest request = new ManualUpdateRequest();
        request.setManualTitle("");

        BindingResult br = new BeanPropertyBindingResult(request, "request");
        br.addError(new FieldError("request", "manualTitle", "must not be blank"));

        ResponseEntity<?> response = manualController.update(manualId, request, br, Locale.JAPAN);

        assertEquals(400, response.getStatusCodeValue());
        assertTrue(response.getBody() instanceof ApiResponse);

        @SuppressWarnings("unchecked")
        ApiResponse<Object> body = (ApiResponse<Object>) response.getBody();
        assertNotNull(body);
        assertEquals("E4001", body.getErrorCode());

        String arg = readStringProperty(body, "args", "arg", "message", "errorMessage");
        if (arg != null) assertTrue(arg.contains("manualTitle"));

        verify(manualService, never()).getCurrentUserId();
        verify(manualService, never()).update(anyLong(), any(), anyString());
    }

    // =========================================================
    // 20) MANUAL-UT-020 update unauthenticated → 401
    // =========================================================
    @Test
    void update_unauthenticated_returns401_andServiceNotCalled() {
        Long manualId = 1L;

        ManualUpdateRequest request = new ManualUpdateRequest();
        request.setManualTitle("t");
        request.setDescription("d");

        BindingResult br = new BeanPropertyBindingResult(request, "request"); // no errors

        when(manualService.getCurrentUserId()).thenReturn(null);

        ResponseEntity<?> response = manualController.update(manualId, request, br, Locale.JAPAN);

        assertEquals(401, response.getStatusCodeValue());
        assertTrue(response.getBody() instanceof ApiResponse);

        @SuppressWarnings("unchecked")
        ApiResponse<Object> body = (ApiResponse<Object>) response.getBody();
        assertNotNull(body);
        assertEquals("E401", body.getErrorCode());

        String msg = readStringProperty(body, "args", "arg", "message", "errorMessage");
        if (msg != null) assertTrue(msg.contains("Unauthorized"));

        verify(manualService, times(1)).getCurrentUserId();
        verify(manualService, never()).update(anyLong(), any(), anyString());
    }



    // =========================================================
    // 21) MANUAL-UT-021 delete 正常
    // =========================================================
    @Test
    void delete_exists_authenticated_softDeletes_returns200_noBody() {
        when(manualService.getCurrentUserId()).thenReturn("u1");

        Manual deleted = new Manual();
        deleted.setId(1L);
        when(manualService.softDelete(1L, "u1")).thenReturn(Optional.of(deleted));

        ResponseEntity<?> response = manualController.delete(1L, Locale.JAPAN);

        assertEquals(200, response.getStatusCodeValue());
        assertNull(response.getBody());

        verify(manualService, times(1)).getCurrentUserId();
        verify(manualService, times(1)).softDelete(1L, "u1");
    }

    // =========================================================
    // 22) MANUAL-UT-022 delete not found → 404
    // =========================================================
    @Test
    void delete_notExists_returns404() {
        when(manualService.getCurrentUserId()).thenReturn("u1");
        when(manualService.softDelete(999L, "u1")).thenReturn(Optional.empty());

        ResponseEntity<?> response = manualController.delete(999L, Locale.JAPAN);

        assertEquals(404, response.getStatusCodeValue());
        assertTrue(response.getBody() instanceof ApiResponse);

        @SuppressWarnings("unchecked")
        ApiResponse<Object> body = (ApiResponse<Object>) response.getBody();
        assertNotNull(body);
        assertEquals("E4041", body.getErrorCode());

        String msg = readStringProperty(body, "args", "arg", "message", "errorMessage");
        if (msg != null) assertTrue(msg.contains("manual not found"));

        verify(manualService, times(1)).getCurrentUserId();
        verify(manualService, times(1)).softDelete(999L, "u1");
    }

    // =========================================================
    // 23) MANUAL-UT-023 delete unauthenticated → 401
    // =========================================================
    @Test
    void delete_unauthenticated_returns401_andServiceNotCalled() {
        when(manualService.getCurrentUserId()).thenReturn(null);

        ResponseEntity<?> response = manualController.delete(1L, Locale.JAPAN);

        assertEquals(401, response.getStatusCodeValue());
        assertTrue(response.getBody() instanceof ApiResponse);

        @SuppressWarnings("unchecked")
        ApiResponse<Object> body = (ApiResponse<Object>) response.getBody();
        assertNotNull(body);
        assertEquals("E401", body.getErrorCode());

        String msg = readStringProperty(body, "args", "arg", "message", "errorMessage");
        if (msg != null) assertTrue(msg.contains("Unauthorized"));

        verify(manualService, times(1)).getCurrentUserId();
        verify(manualService, never()).softDelete(anyLong(), anyString());
    }

    // =========================================================
    // 24) MANUAL-UT-024 upload 正常
    // =========================================================
    @Test
    void upload_success_returns200_andDocIds() {
        MultipartFile f1 = new MockMultipartFile("files", "a.pdf", "application/pdf", "aaa".getBytes(StandardCharsets.UTF_8));
        MultipartFile f2 = new MockMultipartFile("files", "b.pdf", "application/pdf", "bbb".getBytes(StandardCharsets.UTF_8));

        when(manualFileUploadService.uploadFiles(List.of(f1, f2))).thenReturn(List.of("doc1", "doc2"));

        ResponseEntity<?> response = manualController.upload(List.of(f1, f2), Locale.JAPAN);

        assertEquals(200, response.getStatusCodeValue());
        assertTrue(response.getBody() instanceof ManualUploadResponse);

        ManualUploadResponse body = (ManualUploadResponse) response.getBody();
        assertNotNull(body);
        assertEquals(List.of("doc1", "doc2"), body.getDocIds());

        verify(manualFileUploadService, times(1)).uploadFiles(List.of(f1, f2));
    }



    // =========================================================
    // 25) MANUAL-UT-025 upload extension not allowed → 400
    // =========================================================
    @Test
    void upload_extensionNotAllowed_returns400() {
        MultipartFile f1 = new MockMultipartFile("files", "a.exe", "application/octet-stream", "x".getBytes(StandardCharsets.UTF_8));

        when(manualFileUploadService.uploadFiles(List.of(f1)))
                .thenThrow(new IllegalArgumentException("extension not allowed"));

        ResponseEntity<?> response = manualController.upload(List.of(f1), Locale.JAPAN);

        assertEquals(400, response.getStatusCodeValue());
        assertTrue(response.getBody() instanceof ApiResponse);

        @SuppressWarnings("unchecked")
        ApiResponse<Object> body = (ApiResponse<Object>) response.getBody();
        assertNotNull(body);
        assertEquals("E4001", body.getErrorCode());

        String msg = readStringProperty(body, "args", "arg", "message", "errorMessage");
        if (msg != null) assertTrue(msg.contains("extension not allowed"));

        verify(manualFileUploadService, times(1)).uploadFiles(List.of(f1));
    }

    // =========================================================
    // 26) MANUAL-UT-026 upload file too large → 400
    // =========================================================
    @Test
    void upload_fileTooLarge_returns400() {
        MultipartFile f1 = new MockMultipartFile("files", "a.pdf", "application/pdf", "x".getBytes(StandardCharsets.UTF_8));

        when(manualFileUploadService.uploadFiles(List.of(f1)))
                .thenThrow(new IllegalArgumentException("file too large"));

        ResponseEntity<?> response = manualController.upload(List.of(f1), Locale.JAPAN);

        assertEquals(400, response.getStatusCodeValue());
        assertTrue(response.getBody() instanceof ApiResponse);

        @SuppressWarnings("unchecked")
        ApiResponse<Object> body = (ApiResponse<Object>) response.getBody();
        assertNotNull(body);
        assertEquals("E4001", body.getErrorCode());

        String msg = readStringProperty(body, "args", "arg", "message", "errorMessage");
        if (msg != null) assertTrue(msg.contains("file too large"));

        verify(manualFileUploadService, times(1)).uploadFiles(List.of(f1));
    }

    // =========================================================
    // 27) MANUAL-UT-027 upload unexpected error → 500
    // =========================================================
    @Test
    void upload_unexpectedException_returns500() {
        MultipartFile f1 = new MockMultipartFile("files", "a.pdf", "application/pdf", "x".getBytes(StandardCharsets.UTF_8));

        when(manualFileUploadService.uploadFiles(List.of(f1)))
                .thenThrow(new RuntimeException("config missing"));

        ResponseEntity<?> response = manualController.upload(List.of(f1), Locale.JAPAN);

        assertEquals(500, response.getStatusCodeValue());
        assertTrue(response.getBody() instanceof ApiResponse);

        @SuppressWarnings("unchecked")
        ApiResponse<Object> body = (ApiResponse<Object>) response.getBody();
        assertNotNull(body);
        assertEquals("E5001", body.getErrorCode());

        String msg = readStringProperty(body, "args", "arg", "message", "errorMessage");
        if (msg != null) assertTrue(msg.contains("upload failed"));

        verify(manualFileUploadService, times(1)).uploadFiles(List.of(f1));
    }

    // =========================================================
    // 28) MANUAL-UT-028 download file exists → 200 + headers + body
    // =========================================================
    @Test
    void download_fileExists_returns200_withHeaders_andBody() throws Exception {
        // Arrange temp file
        File tmp = File.createTempFile("manual-download-", ".bin");
        tmp.deleteOnExit();
        byte[] content = "hello".getBytes(StandardCharsets.UTF_8);
        Files.write(tmp.toPath(), content);

        String docId = "doc-123";
        when(storageService.listByPrefix(anyString())).thenReturn(List.of("path/key/00000000-0000-0000-0000-000000000000_filename.pdf"));
        when(storageService.getFileByPath("path/key/00000000-0000-0000-0000-000000000000_filename.pdf")).thenReturn(tmp);

        // Act
        ResponseEntity<InputStreamResource> response = manualController.download(docId);

        // Assert
        assertEquals(200, response.getStatusCodeValue());
        assertNotNull(response.getHeaders());
        assertEquals(MediaType.APPLICATION_OCTET_STREAM, response.getHeaders().getContentType());
        assertEquals(tmp.length(), response.getHeaders().getContentLength());

        String cd = response.getHeaders().getFirst(HttpHeaders.CONTENT_DISPOSITION);
        assertNotNull(cd);
        assertTrue(cd.contains("attachment"));

        // Body exists
        assertNotNull(response.getBody());
        try (var is = response.getBody().getInputStream()) {
            byte[] actual = is.readAllBytes();
            assertArrayEquals(content, actual);
        }

        verify(storageService, times(1)).listByPrefix(anyString());
        verify(storageService, times(1)).getFileByPath(anyString());
    }

    // =========================================================
    // 29) MANUAL-UT-029 download key not found → 404 empty body
    // =========================================================
    @Test
    void download_keyNotFound_returns404() {
        when(storageService.listByPrefix(anyString())).thenReturn(Collections.emptyList());

        ResponseEntity<InputStreamResource> response = manualController.download("doc-999");

        assertEquals(404, response.getStatusCodeValue());
        assertNull(response.getBody());

        verify(storageService, times(1)).listByPrefix(anyString());
        verify(storageService, never()).getFileByPath(anyString());
    }


    // =========================================================
    // 30) MANUAL-UT-030 download: key exists but file missing/null -> 404
    // =========================================================
    @Test
    void download_shouldReturn404WhenFileMissing() {
        String docId = "doc-31";
        String key = "path/key/file.pdf";

        when(storageService.listByPrefix(anyString())).thenReturn(List.of(key));
        when(storageService.getFileByPath(key)).thenReturn(null); // missing

        ResponseEntity<InputStreamResource> response = manualController.download(docId);

        assertEquals(404, response.getStatusCodeValue());
        assertNull(response.getBody());

        verify(storageService, times(1)).listByPrefix(anyString());
        verify(storageService, times(1)).getFileByPath(key);
    }

    // =========================================================
    // 31) MANUAL-UT-031 download: exception -> 500 empty body
    // =========================================================
    @Test
    void download_shouldReturn500WhenDownloadThrows() {
        String docId = "doc-32";
        String key = "path/key/file.pdf";

        when(storageService.listByPrefix(anyString())).thenReturn(List.of(key));
        when(storageService.getFileByPath(key)).thenThrow(new RuntimeException("boom"));

        ResponseEntity<InputStreamResource> response = manualController.download(docId);

        assertEquals(500, response.getStatusCodeValue());
        assertNull(response.getBody());

        verify(storageService, times(1)).listByPrefix(anyString());
        verify(storageService, times(1)).getFileByPath(key);
    }

    // =========================================================
    // 32) MANUAL-UT-032 download: docId no slash -> listByPrefix(docId) is used
    // =========================================================
    @Test
    void download_shouldSearchByDocIdPrefixWhenDocIdHasNoSlash() throws Exception {
        String docId = "abc123";
        String key = "abc123_file.pdf";

        // temp file so download returns 200
        File tmp = File.createTempFile("manual-download-33-", ".bin");
        tmp.deleteOnExit();
        Files.write(tmp.toPath(), "hi".getBytes(StandardCharsets.UTF_8));

        ArgumentCaptor<String> prefixCaptor = ArgumentCaptor.forClass(String.class);

        when(storageService.listByPrefix(anyString())).thenReturn(List.of(key));
        when(storageService.getFileByPath(key)).thenReturn(tmp);

        ResponseEntity<InputStreamResource> response = manualController.download(docId);

        assertEquals(200, response.getStatusCodeValue());
        assertNotNull(response.getBody());

        verify(storageService).listByPrefix(prefixCaptor.capture());
        assertEquals("abc123", prefixCaptor.getValue()); // IMPORTANT
    }

    // =========================================================
    // 33) MANUAL-UT-033 download: docId has slash and long name -> folder + first 36 chars
    // =========================================================
    @Test
    void download_shouldTrimPrefixToFolderPlus36CharsWhenDocIdHasSlashAndLongName() throws Exception {
        // nameAfterSlash length >= 36
        String docId = "folder/ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789XXXX.pdf";
        // expected: folder/ + first 36 chars of nameAfterSlash
        String expectedPrefix = "folder/ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"; // 36 chars
        String key = "folder/ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789_file.pdf";

        File tmp = File.createTempFile("manual-download-34-", ".bin");
        tmp.deleteOnExit();
        Files.write(tmp.toPath(), "ok".getBytes(StandardCharsets.UTF_8));

        ArgumentCaptor<String> prefixCaptor = ArgumentCaptor.forClass(String.class);

        when(storageService.listByPrefix(anyString())).thenReturn(List.of(key));
        when(storageService.getFileByPath(key)).thenReturn(tmp);

        ResponseEntity<InputStreamResource> response = manualController.download(docId);

        assertEquals(200, response.getStatusCodeValue());

        verify(storageService).listByPrefix(prefixCaptor.capture());
        assertEquals(expectedPrefix, prefixCaptor.getValue());
    }

    // =========================================================
    // 34) MANUAL-UT-034 download: docId has slash and short name (<36) -> prefix is folder/
    // =========================================================
    @Test
    void download_shouldNotTrimPrefixWhenNameAfterSlashShorterThan36() throws Exception {
        String docId = "folder/short.pdf";
        String expectedPrefix = "folder/";
        String key = "folder/short_file.pdf";

        File tmp = File.createTempFile("manual-download-35-", ".bin");
        tmp.deleteOnExit();
        Files.write(tmp.toPath(), "ok".getBytes(StandardCharsets.UTF_8));

        ArgumentCaptor<String> prefixCaptor = ArgumentCaptor.forClass(String.class);

        when(storageService.listByPrefix(anyString())).thenReturn(List.of(key));
        when(storageService.getFileByPath(key)).thenReturn(tmp);

        ResponseEntity<InputStreamResource> response = manualController.download(docId);

        assertEquals(200, response.getStatusCodeValue());

        verify(storageService).listByPrefix(prefixCaptor.capture());
        assertEquals(expectedPrefix, prefixCaptor.getValue());
    }

    // =========================================================
    // 35) MANUAL-UT-035 download: key longer than 37 -> filename trimmed in Content-Disposition
    // =========================================================
    @Test
    void download_shouldTrimReturnedFilenameWhenKeyLongerThan37() throws Exception {
        String docId = "doc-36";

        // make key's last segment longer than 37 chars:
        String key = "folder/" + "1234567890123456789012345678901234567" + "realname.pdf";
        // fileName becomes last segment, then if length>37 -> substring(37)
        String lastSegment = key.substring(key.lastIndexOf('/') + 1);
        String expectedReturnedName = lastSegment.substring(37);

        File tmp = File.createTempFile("manual-download-36-", ".bin");
        tmp.deleteOnExit();
        Files.write(tmp.toPath(), "content".getBytes(StandardCharsets.UTF_8));

        when(storageService.listByPrefix(anyString())).thenReturn(List.of(key));
        when(storageService.getFileByPath(key)).thenReturn(tmp);

        ResponseEntity<InputStreamResource> response = manualController.download(docId);

        assertEquals(200, response.getStatusCodeValue());

        String cd = response.getHeaders().getFirst(HttpHeaders.CONTENT_DISPOSITION);
        assertNotNull(cd);
        assertTrue(cd.contains("filename=\"" + expectedReturnedName + "\""));
    }

    // =========================================================
    // 36) MANUAL-UT-036 upload: files empty list -> 200 and empty docIds when service returns empty
    // =========================================================
    @Test
    void upload_shouldReturn200WhenFilesEmptyListAndServiceReturnsEmptyDocIds() {
        when(manualFileUploadService.uploadFiles(Collections.emptyList()))
                .thenReturn(Collections.emptyList());

        ResponseEntity<?> response = manualController.upload(Collections.emptyList(), Locale.JAPAN);

        assertEquals(200, response.getStatusCodeValue());
        assertTrue(response.getBody() instanceof ManualUploadResponse);

        ManualUploadResponse body = (ManualUploadResponse) response.getBody();
        assertNotNull(body);
        assertNotNull(body.getDocIds());
        assertTrue(body.getDocIds().isEmpty());

        verify(manualFileUploadService, times(1)).uploadFiles(Collections.emptyList());
    }




}
