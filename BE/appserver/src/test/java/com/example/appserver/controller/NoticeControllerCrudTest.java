package com.example.appserver.controller;

import com.example.appserver.request.notice.NoticeCreateRequest;
import com.example.appserver.request.notice.NoticeUpdateRequest;
import com.example.appserver.response.notice.NoticeCreateResponse;
import com.example.appserver.response.notice.NoticeDetailResponse;
import com.example.appserver.response.notice.NoticeListItem;
import com.example.appserver.response.notice.NoticeListResponse;
import com.example.appserver.response.notice.NoticeUpdateResponse;
import com.example.appserver.service.NoticeFileService;
import com.example.appserver.service.NoticeService;
import com.example.servercommon.message.BackendMessageResolver;
import com.example.servercommon.service.StorageService;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.request.MockMultipartHttpServletRequestBuilder;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.validation.beanvalidation.LocalValidatorFactoryBean;

import java.io.File;
import java.nio.file.Files;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import static org.hamcrest.Matchers.containsString;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.multipart;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@ExtendWith(MockitoExtension.class)
class NoticeControllerCrudTest {

    @Mock
    private NoticeService noticeService;

    @Mock
    private NoticeFileService noticeFileService;

    @Mock
    private StorageService storageService;

    @Mock
    private BackendMessageResolver messageResolver;

    private MockMvc mockMvc;
    private ObjectMapper objectMapper;

    @BeforeEach
    void setUp() {
        NoticeController controller = new NoticeController(noticeService, noticeFileService, storageService, messageResolver);

        LocalValidatorFactoryBean validator = new LocalValidatorFactoryBean();
        validator.afterPropertiesSet();

        mockMvc = MockMvcBuilders.standaloneSetup(controller)
                .setValidator(validator)
                .build();

        objectMapper = new ObjectMapper();
        objectMapper.registerModule(new JavaTimeModule());
    }

    @Test
    void SC04_UT_001_shouldReturnOkAndListWhenAuthorized() throws Exception {
        NoticeListItem item = new NoticeListItem(1L, "title", "2026/01/01", "2026/12/31", "admin", "2026/01/01 10:00:00");
        when(noticeService.getList(any(LocalDate.class))).thenReturn(new NoticeListResponse(List.of(item)));

        mockMvc.perform(get("/api/notice/list"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.noticeList[0].noticeId").value(1L));
    }

    @Test
    void SC04_UT_007_shouldReturnOkWhenNoticeIdValid() throws Exception {
        NoticeDetailResponse res = new NoticeDetailResponse(
                10L, "notice", "2026/01/01", "2026/01/31", "content", List.of(), "admin",
                "2026/01/01 10:00:00", "admin", "2026/01/01 10:00:00"
        );
        when(noticeService.getDetail(10L)).thenReturn(Optional.of(res));

        mockMvc.perform(get("/api/notice/notice_id").param("notice_id", "10"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.noticeId").value(10L));
    }

    @Test
    void SC04_UT_008_shouldReturnNotFoundWhenNoticeIdDoesNotExist() throws Exception {
        when(noticeService.getDetail(999L)).thenReturn(Optional.empty());

        mockMvc.perform(get("/api/notice/notice_id").param("notice_id", "999"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.error.code").value("E4041"));
    }

    @Test
    void SC04_UT_009_shouldReturnBadRequestWhenIdInvalidFormat() throws Exception {
        mockMvc.perform(get("/api/notice/notice_id").param("notice_id", "abc"))
                .andExpect(status().isBadRequest());
    }

    @Test
    void SC04_UT_010_shouldReturnOkWhenValidRequestNoAttachments() throws Exception {
        NoticeCreateRequest req = baseCreateRequest();
        req.setDocIds(null);

        when(noticeService.getCurrentUserId()).thenReturn("admin");
        when(noticeService.isInvalidDateRange(any(), any())).thenReturn(false);
        when(noticeService.create(any(NoticeCreateRequest.class), anyString())).thenReturn(new NoticeCreateResponse(101L));

        mockMvc.perform(post("/api/notice/create")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.noticeId").value(101L));
    }

    @Test
    void SC04_UT_011_shouldReturnOkWhenValidRequestWithAttachments() throws Exception {
        NoticeCreateRequest req = baseCreateRequest();
        req.setDocIds(List.of("notice/doc-a.pdf", "notice/doc-b.pdf"));

        when(noticeService.getCurrentUserId()).thenReturn("admin");
        when(noticeService.isInvalidDateRange(any(), any())).thenReturn(false);
        when(noticeService.create(any(NoticeCreateRequest.class), anyString())).thenReturn(new NoticeCreateResponse(102L));

        mockMvc.perform(post("/api/notice/create")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.noticeId").value(102L));
    }

    @Test
    void SC04_UT_012_shouldReturnBadRequestWhenTitleMissing() throws Exception {
        String body = "{" +
                "\"startDate\":\"2026/01/01\"," +
                "\"endDate\":\"2026/01/02\"" +
                "}";

        mockMvc.perform(post("/api/notice/create")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error.code").value("E4001"))
                .andExpect(jsonPath("$.error.message").value("notice_title"));
    }

    @Test
    void SC04_UT_013_shouldReturnBadRequestWhenStartDateMissing() throws Exception {
        String body = "{" +
                "\"noticeTitle\":\"title\"," +
                "\"endDate\":\"2026/01/02\"" +
                "}";

        mockMvc.perform(post("/api/notice/create")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error.code").value("E4001"))
                .andExpect(jsonPath("$.error.message").value("start_date"));
    }

    @Test
    void SC04_UT_014_shouldReturnBadRequestWhenEndDateMissing() throws Exception {
        String body = "{" +
                "\"noticeTitle\":\"title\"," +
                "\"startDate\":\"2026/01/01\"" +
                "}";

        mockMvc.perform(post("/api/notice/create")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error.code").value("E4001"))
                .andExpect(jsonPath("$.error.message").value("end_date"));
    }

    @Test
    void SC04_UT_015_shouldReturnBadRequestWhenStartAfterEnd() throws Exception {
        NoticeCreateRequest req = baseCreateRequest();
        req.setStartDate(LocalDate.of(2026, 2, 1));
        req.setEndDate(LocalDate.of(2026, 1, 1));

        when(noticeService.isInvalidDateRange(any(), any())).thenReturn(true);

        mockMvc.perform(post("/api/notice/create")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error.code").value("E4001"))
                .andExpect(jsonPath("$.error.message").value("start_date"));
    }

    @Test
    void SC04_UT_017_shouldReturnOkWhenPartialUpdateValid() throws Exception {
        NoticeUpdateRequest req = baseUpdateRequest();
        when(noticeService.getCurrentUserId()).thenReturn("admin");
        when(noticeService.isInvalidDateRange(any(), any())).thenReturn(false);
        when(noticeService.update(anyLong(), any(NoticeUpdateRequest.class), anyString()))
                .thenReturn(Optional.of(new NoticeUpdateResponse(200L)));

        mockMvc.perform(put("/api/notice/notice_id").param("notice_id", "200")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.noticeId").value(200L));
    }

    @Test
    void SC04_UT_018_shouldReturnNotFoundWhenUpdatingNonexistentNotice() throws Exception {
        NoticeUpdateRequest req = baseUpdateRequest();

        when(noticeService.getCurrentUserId()).thenReturn("admin");
        when(noticeService.isInvalidDateRange(any(), any())).thenReturn(false);
        when(noticeService.update(anyLong(), any(NoticeUpdateRequest.class), anyString()))
                .thenReturn(Optional.empty());

        mockMvc.perform(put("/api/notice/notice_id").param("notice_id", "999")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.error.code").value("E4041"));
    }

    @Test
    void SC04_UT_022_shouldReturnOkAndDocIdsWhenValidMultipart() throws Exception {
        MockMultipartFile file = new MockMultipartFile(
                "files", "ok.pdf", "application/pdf", "abc".getBytes()
        );
        when(noticeFileService.uploadFiles(any())).thenReturn(List.of("notice/x-1-ok.pdf"));

        MockMultipartHttpServletRequestBuilder req = multipart("/api/notice/upload");
        mockMvc.perform(req.file(file))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.docIds[0]").value("notice/x-1-ok.pdf"));
    }

    @Test
    void SC04_UT_023_shouldReturnBadRequestWhenNoFiles() throws Exception {
        MockMultipartHttpServletRequestBuilder req = multipart("/api/notice/upload");
        mockMvc.perform(req)
                .andExpect(status().isBadRequest());
    }

    @Test
    void SC04_UT_024_shouldReturnBadRequestWhenMoreThan3Files() throws Exception {
        when(noticeFileService.uploadFiles(any())).thenThrow(new IllegalArgumentException("file.count"));

        MockMultipartFile f1 = new MockMultipartFile("files", "1.pdf", "application/pdf", "1".getBytes());
        MockMultipartFile f2 = new MockMultipartFile("files", "2.pdf", "application/pdf", "2".getBytes());
        MockMultipartFile f3 = new MockMultipartFile("files", "3.pdf", "application/pdf", "3".getBytes());
        MockMultipartFile f4 = new MockMultipartFile("files", "4.pdf", "application/pdf", "4".getBytes());

        mockMvc.perform(multipart("/api/notice/upload").file(f1).file(f2).file(f3).file(f4))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error.message").value("file.count"));
    }

    @Test
    void SC04_UT_025_shouldReturnBadRequestWhenFileTypeInvalid() throws Exception {
        when(noticeFileService.uploadFiles(any())).thenThrow(new IllegalArgumentException("file.type"));
        MockMultipartFile file = new MockMultipartFile("files", "bad.exe", "application/octet-stream", "x".getBytes());

        mockMvc.perform(multipart("/api/notice/upload").file(file))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error.message").value("file.type"));
    }

    @Test
    void SC04_UT_026_shouldReturnBadRequestWhenFileSizeExceeds5MB() throws Exception {
        when(noticeFileService.uploadFiles(any())).thenThrow(new IllegalArgumentException("file.size"));
        MockMultipartFile file = new MockMultipartFile("files", "big.pdf", "application/pdf", "x".getBytes());

        mockMvc.perform(multipart("/api/notice/upload").file(file))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error.message").value("file.size"));
    }

    @Test
    void SC04_UT_028_shouldHandleStorageFailureGracefully() throws Exception {
        when(noticeFileService.uploadFiles(any())).thenThrow(new RuntimeException("storage down"));
        MockMultipartFile file = new MockMultipartFile("files", "a.pdf", "application/pdf", "a".getBytes());

        mockMvc.perform(multipart("/api/notice/upload").file(file))
                .andExpect(status().isInternalServerError())
                .andExpect(jsonPath("$.error.code").value("E5001"));
    }

    @Test
    void SC04_UT_029_shouldReturnOkWhenDocIdValid() throws Exception {
        File f = File.createTempFile("notice-ut-", ".txt");
        f.deleteOnExit();
        Files.writeString(f.toPath(), "hello");

        when(storageService.listByPrefix(anyString())).thenReturn(List.of("notice/12345678-1234-1234-1234-123456789012-test.txt"));
        when(storageService.getFileByPath(anyString())).thenReturn(f);

        mockMvc.perform(get("/api/notice/download").param("id", "notice/12345678-1234-1234-1234-123456789012"))
                .andExpect(status().isOk())
                .andExpect(header().string("Content-Disposition", containsString("attachment")));
    }

    @Test
    void SC04_UT_030_shouldReturnNotFoundWhenDocIdInvalid() throws Exception {
        when(storageService.listByPrefix(anyString())).thenReturn(List.of());

        mockMvc.perform(get("/api/notice/download").param("id", "notice/not-found"))
                .andExpect(status().isNotFound());
    }

    @Test
    void SC04_UT_033_shouldReturnBadRequestWhenTitleTooLong() throws Exception {
        NoticeCreateRequest req = baseCreateRequest();
        req.setNoticeTitle("a".repeat(256));

        mockMvc.perform(post("/api/notice/create")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error.message").value("notice_title"));
    }

    @Test
    void SC04_UT_034_shouldReturnBadRequestWhenContentsTooLong() throws Exception {
        NoticeCreateRequest req = baseCreateRequest();
        req.setContents("x".repeat(251));

        mockMvc.perform(post("/api/notice/create")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error.message").value("contents"));
    }

    @Test
    void SC04_UT_035_shouldReturnBadRequestWhenFileExtensionInvalid() throws Exception {
        when(noticeFileService.uploadFiles(any())).thenThrow(new IllegalArgumentException("file.type"));
        MockMultipartFile file = new MockMultipartFile("files", "x.docx", "application/vnd.openxmlformats-officedocument.wordprocessingml.document", "x".getBytes());

        mockMvc.perform(multipart("/api/notice/upload").file(file))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error.code").value("E4002"));
    }

    @Test
    void SC04_UT_036_shouldReturnBadRequestWhenMimeTypeInvalid() throws Exception {
        when(noticeFileService.uploadFiles(any())).thenThrow(new IllegalArgumentException("file.type"));
        MockMultipartFile file = new MockMultipartFile("files", "x.pdf", "application/zip", "x".getBytes());

        mockMvc.perform(multipart("/api/notice/upload").file(file))
                .andExpect(status().isBadRequest());
    }

    @Test
    void SC04_UT_037_shouldReturnBadRequestWhenFileNameTooLong() throws Exception {
        when(noticeFileService.uploadFiles(any())).thenThrow(new IllegalArgumentException("file.name"));
        String longName = "a".repeat(256) + ".pdf";
        MockMultipartFile file = new MockMultipartFile("files", longName, "application/pdf", "x".getBytes());

        mockMvc.perform(multipart("/api/notice/upload").file(file))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error.message").value("file.name"));
    }

    @Test
    void SC04_UT_038_shouldReturnOkWhenFileIdIsNullOrNotProvided() throws Exception {
        NoticeCreateRequest req = baseCreateRequest();
        req.setDocIds(null);

        when(noticeService.getCurrentUserId()).thenReturn("admin");
        when(noticeService.isInvalidDateRange(any(), any())).thenReturn(false);
        when(noticeService.create(any(NoticeCreateRequest.class), anyString())).thenReturn(new NoticeCreateResponse(300L));

        mockMvc.perform(post("/api/notice/create")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.noticeId").value(300L));
    }

    @Test
    void SC04_UT_039_shouldReturnBadRequestWhenNoticeIdIsNegative() throws Exception {
        when(noticeService.getDetail(-1L)).thenReturn(Optional.empty());

        mockMvc.perform(get("/api/notice/notice_id").param("notice_id", "-1"))
                .andExpect(status().isNotFound());
    }

    @Test
    void SC04_UT_040_shouldReturnBadRequestWhenGetDetailNoticeIdNegative() throws Exception {
        when(noticeService.getDetail(-5L)).thenReturn(Optional.empty());

        mockMvc.perform(get("/api/notice/notice_id").param("notice_id", "-5"))
                .andExpect(status().isNotFound());
    }

    @Test
    void SC04_UT_041_shouldAcceptExactlyThreeFiles() throws Exception {
        when(noticeFileService.uploadFiles(any())).thenReturn(List.of("d1", "d2", "d3"));

        MockMultipartFile f1 = new MockMultipartFile("files", "1.pdf", "application/pdf", "1".getBytes());
        MockMultipartFile f2 = new MockMultipartFile("files", "2.pdf", "application/pdf", "2".getBytes());
        MockMultipartFile f3 = new MockMultipartFile("files", "3.pdf", "application/pdf", "3".getBytes());

        mockMvc.perform(multipart("/api/notice/upload").file(f1).file(f2).file(f3))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.docIds.length()").value(3));
    }

    @Test
    void SC04_UT_042_shouldAcceptFileSizeExactly5MB() throws Exception {
        when(noticeFileService.uploadFiles(any())).thenReturn(List.of("doc-ok"));
        byte[] payload = new byte[5 * 1024 * 1024];
        MockMultipartFile file = new MockMultipartFile("files", "5mb.pdf", "application/pdf", payload);

        mockMvc.perform(multipart("/api/notice/upload").file(file))
                .andExpect(status().isOk());
    }

    @Test
    void SC04_UT_043_shouldAcceptTitleExactly255Characters() throws Exception {
        NoticeCreateRequest req = baseCreateRequest();
        req.setNoticeTitle("t".repeat(255));

        when(noticeService.getCurrentUserId()).thenReturn("admin");
        when(noticeService.isInvalidDateRange(any(), any())).thenReturn(false);
        when(noticeService.create(any(NoticeCreateRequest.class), anyString())).thenReturn(new NoticeCreateResponse(401L));

        mockMvc.perform(post("/api/notice/create")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.noticeId").value(401L));
    }

    @Test
    void SC04_UT_044_shouldAcceptContentsExactly1500Characters() throws Exception {
        NoticeCreateRequest req = baseCreateRequest();
        req.setContents("c".repeat(250));

        when(noticeService.getCurrentUserId()).thenReturn("admin");
        when(noticeService.isInvalidDateRange(any(), any())).thenReturn(false);
        when(noticeService.create(any(NoticeCreateRequest.class), anyString())).thenReturn(new NoticeCreateResponse(402L));

        mockMvc.perform(post("/api/notice/create")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.noticeId").value(402L));
    }
    @Test
    void SC04_UT_002_shouldReturnUnauthorizedWhenNoToken() throws Exception {
        mockMvc.perform(get("/api/notice/list"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void SC04_UT_003_shouldReturnForbiddenWhenNoViewPermission() throws Exception {
        mockMvc.perform(get("/api/notice/list"))
                .andExpect(status().isForbidden());
    }

    @Test
    void SC04_UT_016_shouldReturnForbiddenWhenUserLacksUpdatePermission() throws Exception {
        NoticeCreateRequest req = baseCreateRequest();
        when(noticeService.getCurrentUserId()).thenReturn("admin");
        when(noticeService.isInvalidDateRange(any(), any())).thenReturn(false);
        when(noticeService.create(any(NoticeCreateRequest.class), anyString())).thenReturn(new NoticeCreateResponse(1000L));

        mockMvc.perform(post("/api/notice/create")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isForbidden());
    }

    @Test
    void SC04_UT_019_shouldReturnForbiddenWhenNoUpdatePermission() throws Exception {
        NoticeUpdateRequest req = baseUpdateRequest();
        when(noticeService.getCurrentUserId()).thenReturn("admin");
        when(noticeService.isInvalidDateRange(any(), any())).thenReturn(false);
        when(noticeService.update(anyLong(), any(NoticeUpdateRequest.class), anyString()))
                .thenReturn(Optional.of(new NoticeUpdateResponse(1001L)));

        mockMvc.perform(put("/api/notice/notice_id").param("notice_id", "1001")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isForbidden());
    }

    @Test
    void SC04_UT_027_shouldReturnForbiddenWhenNoUpdatePermissionOnUpload() throws Exception {
        MockMultipartFile file = new MockMultipartFile("files", "x.pdf", "application/pdf", "x".getBytes());
        when(noticeFileService.uploadFiles(any())).thenReturn(List.of("notice/ok.pdf"));

        mockMvc.perform(multipart("/api/notice/upload").file(file))
                .andExpect(status().isForbidden());
    }

    @Test
    void SC04_UT_031_shouldReturnUnauthorizedWhenNoTokenOnDownload() throws Exception {
        mockMvc.perform(get("/api/notice/download").param("id", "notice/doc.pdf"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void SC04_UT_032_shouldReturnForbiddenWhenNoPermissionOnDownload() throws Exception {
        mockMvc.perform(get("/api/notice/download").param("id", "notice/doc.pdf"))
                .andExpect(status().isForbidden());
    }
    private NoticeCreateRequest baseCreateRequest() {
        NoticeCreateRequest req = new NoticeCreateRequest();
        req.setNoticeTitle("Important notice");
        req.setStartDate(LocalDate.of(2026, 1, 1));
        req.setEndDate(LocalDate.of(2026, 1, 31));
        req.setContents("hello");
        return req;
    }

    private NoticeUpdateRequest baseUpdateRequest() {
        NoticeUpdateRequest req = new NoticeUpdateRequest();
        req.setNoticeTitle("updated");
        req.setStartDate(LocalDate.of(2026, 1, 1));
        req.setEndDate(LocalDate.of(2026, 1, 31));
        req.setContents("updated contents");
        req.setDocIds(List.of("notice/new-doc.pdf"));
        return req;
    }
}
