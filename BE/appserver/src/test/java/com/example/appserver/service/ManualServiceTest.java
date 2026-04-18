package com.example.appserver.service;

import com.example.appserver.request.manual.ManualCreateRequest;
import com.example.appserver.request.manual.ManualListQuery;
import com.example.appserver.request.manual.ManualUpdateRequest;
import com.example.appserver.response.manual.ManualDetailData;
import com.example.appserver.response.manual.ManualListData;
import com.example.appserver.response.manual.ManualListItem;
import com.example.servercommon.model.Manual;
import com.example.servercommon.model.ManualFile;
import com.example.servercommon.repository.ManualFileRepository;
import com.example.servercommon.repository.ManualRepository;
import com.example.servercommon.repository.UserRepository;
import com.example.servercommon.service.StorageService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;

import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.Authentication;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;

import java.math.BigDecimal;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Map;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

import com.example.appserver.security.CustomUserDetails;
import com.example.servercommon.model.UserModel;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.User;

import java.time.LocalDateTime;
import java.time.ZoneOffset;


import org.mockito.Mockito;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

// only for UT-070 (if your project has this class)
import com.example.appserver.security.CustomUserDetails;


import java.util.Collections;


import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

class ManualServiceTest {

    @Mock
    private ManualRepository manualRepository;

    @Mock
    private ManualFileRepository manualFileRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private StorageService storageService;

    @InjectMocks
    private ManualService manualService;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    // =========================================================
    // 37) MANUAL-UT-037 getList: trim titleName before search
    // =========================================================
    @Test
    void getList_shouldTrimTitleNameBeforeSearch() {
        ManualListQuery query = new ManualListQuery();
        query.setTitleName(" abc ");
        query.setTarget(0);
        query.setIsdeleted(0);
        query.setPageNumber(1);
        query.setPagesize(50);

        when(manualRepository.search(any(), any(), any(), any(PageRequest.class)))
                .thenReturn(Page.empty());

        manualService.getList(query);

        ArgumentCaptor<String> titleCaptor = ArgumentCaptor.forClass(String.class);
        verify(manualRepository).search(titleCaptor.capture(), eq(0), eq(0), any(PageRequest.class));
        assertEquals("abc", titleCaptor.getValue());
    }

    // =========================================================
    // 38) MANUAL-UT-038 getList: default pageNumber=1 when null (page index 0)
    // =========================================================
    @Test
    void getList_shouldUseDefaultPageNumberWhenNull() {
        ManualListQuery query = new ManualListQuery();
        query.setTitleName("a");
        query.setPageNumber(null);
        query.setPagesize(50);

        when(manualRepository.search(any(), any(), any(), any(PageRequest.class)))
                .thenReturn(Page.empty());

        manualService.getList(query);

        ArgumentCaptor<PageRequest> pageableCaptor = ArgumentCaptor.forClass(PageRequest.class);
        verify(manualRepository).search(any(), any(), any(), pageableCaptor.capture());

        PageRequest pr = pageableCaptor.getValue();
        assertEquals(0, pr.getPageNumber()); // (default 1) - 1
    }

    // =========================================================
    // 39) MANUAL-UT-039 getList: default pageSize=50 when null
    // =========================================================
    @Test
    void getList_shouldUseDefaultPageSizeWhenNull() {
        ManualListQuery query = new ManualListQuery();
        query.setTitleName("a");
        query.setPageNumber(1);
        query.setPagesize(null);

        when(manualRepository.search(any(), any(), any(), any(PageRequest.class)))
                .thenReturn(Page.empty());

        manualService.getList(query);

        ArgumentCaptor<PageRequest> pageableCaptor = ArgumentCaptor.forClass(PageRequest.class);
        verify(manualRepository).search(any(), any(), any(), pageableCaptor.capture());

        PageRequest pr = pageableCaptor.getValue();
        assertEquals(50, pr.getPageSize());
    }

    // =========================================================
    // 40) MANUAL-UT-040 getList: default sort updatedDateTime DESC
    // =========================================================
    @Test
    void getList_shouldApplyDefaultSortUpdatedDateTimeDesc() {
        ManualListQuery query = new ManualListQuery();
        query.setPageNumber(1);
        query.setPagesize(50);

        when(manualRepository.search(any(), any(), any(), any(PageRequest.class)))
                .thenReturn(Page.empty());

        manualService.getList(query);

        ArgumentCaptor<PageRequest> pageableCaptor = ArgumentCaptor.forClass(PageRequest.class);
        verify(manualRepository).search(any(), any(), any(), pageableCaptor.capture());

        Sort sort = pageableCaptor.getValue().getSort();
        Sort.Order order = sort.getOrderFor("updatedDateTime");
        assertNotNull(order);
        assertEquals(Sort.Direction.DESC, order.getDirection());
    }

    // =========================================================
    // 44) MANUAL-UT-044 getList: map Manual -> ManualListItem correctly
    // =========================================================
    @Test
    void getList_shouldMapEntityToManualListItemCorrectly() {
        ManualListQuery query = new ManualListQuery();
        query.setPageNumber(1);
        query.setPagesize(50);

        Manual m = new Manual();
        m.setId(1L);
        m.setTitle("Title");
        m.setGeneralUserFlag(true);
        m.setMasterAdminFlag(false);
        m.setUpdaterUserId("u1");
        m.setUpdatedDateTime(LocalDateTime.of(2026, 2, 12, 10, 0, 0));

        Page<Manual> page = new PageImpl<>(List.of(m), PageRequest.of(0, 50), 1);

        when(manualRepository.search(any(), any(), any(), any(PageRequest.class))).thenReturn(page);
        when(userRepository.findById("u1")).thenReturn(Optional.empty()); // updatedBy -> ""

        ManualListData data = manualService.getList(query);

        assertNotNull(data);
        assertEquals(1L, data.getTotal());
        assertNotNull(data.getManuals());
        assertEquals(1, data.getManuals().size());

        ManualListItem item = data.getManuals().get(0);
        assertEquals(1L, item.getManualId());
        assertEquals("Title", item.getManualTitle());
        assertTrue(item.getGeneralUser());
        assertFalse(item.getSystemUser());
        assertEquals("", item.getUpdatedBy());
        assertNotNull(item.getUpdatedAt()); // formatted
    }

    // =========================================================
    // 42) MANUAL-UT-042 getDetail: include docIds from ManualFileRepository
    // =========================================================
    @Test
    void getDetail_shouldReturnManualDetailIncludingDocIds() {
        Manual manual = new Manual();
        manual.setId(10L);
        manual.setTitle("T");
        manual.setContent("C");
        manual.setGeneralUserFlag(true);
        manual.setMasterAdminFlag(false);
        manual.setUpdatedDateTime(LocalDateTime.of(2026, 2, 12, 10, 0, 0));
        manual.setDeletedFlag(false);

        ManualFile f1 = new ManualFile();
        f1.setDestinationUrl("doc1");
        ManualFile f2 = new ManualFile();
        f2.setDestinationUrl("doc2");

        when(manualRepository.findById(10L)).thenReturn(Optional.of(manual));
        when(manualFileRepository.findAllByManualIdAndDeletedFlagFalse(10L)).thenReturn(List.of(f1, f2));
        when(userRepository.findById(anyString())).thenReturn(Optional.empty());

        Optional<ManualDetailData> opt = manualService.getDetail(10L);

        assertTrue(opt.isPresent());
        ManualDetailData data = opt.get();
        assertNotNull(data.getManual());
        assertEquals(10L, data.getManual().getManualId());
        assertEquals(List.of("doc1", "doc2"), data.getManual().getDocIds());
    }

    // =========================================================
    // 43) MANUAL-UT-043 getDetail: manual not found -> Optional.empty
    // =========================================================
    @Test
    void getDetail_shouldReturnEmptyWhenManualNotFound() {
        when(manualRepository.findById(999L)).thenReturn(Optional.empty());

        Optional<ManualDetailData> opt = manualService.getDetail(999L);

        assertTrue(opt.isEmpty());
        verify(manualFileRepository, never()).findAllByManualIdAndDeletedFlagFalse(anyLong());
    }

    // =========================================================
    // 44) MANUAL-UT-044 create: target flags null -> false
    // =========================================================
    @Test
    void create_shouldSetTargetFlagsFalseWhenNull() {
        ManualCreateRequest request = new ManualCreateRequest();
        request.setManualTitle("t");
        request.setDescription("d");
        request.setGeneralUser(null);
        request.setSystemUser(null);
        request.setDocIds(null);

        Manual saved = new Manual();
        saved.setId(10L);
        when(manualRepository.save(any(Manual.class))).thenReturn(saved);

        ArgumentCaptor<Manual> manualCaptor = ArgumentCaptor.forClass(Manual.class);

        Manual result = manualService.create(request, "u1");
        assertEquals(10L, result.getId());

        verify(manualRepository).save(manualCaptor.capture());
        Manual toSave = manualCaptor.getValue();

        assertFalse(toSave.getGeneralUserFlag());
        assertFalse(toSave.getMasterAdminFlag());
    }

    // =========================================================
    // 45) MANUAL-UT-045 create: target flags true -> true
    // =========================================================
    @Test
    void create_shouldSetTargetFlagsTrueWhenTrue() {
        ManualCreateRequest request = new ManualCreateRequest();
        request.setManualTitle("t");
        request.setDescription("d");
        request.setGeneralUser(true);
        request.setSystemUser(true);
        request.setDocIds(null);

        Manual saved = new Manual();
        saved.setId(10L);
        when(manualRepository.save(any(Manual.class))).thenReturn(saved);

        ArgumentCaptor<Manual> manualCaptor = ArgumentCaptor.forClass(Manual.class);

        manualService.create(request, "u1");

        verify(manualRepository).save(manualCaptor.capture());
        Manual toSave = manualCaptor.getValue();

        assertTrue(toSave.getGeneralUserFlag());
        assertTrue(toSave.getMasterAdminFlag());
    }

    // =========================================================
    // 46) MANUAL-UT-046 create: audit fields + default flags
    // =========================================================
    @Test
    void create_shouldSetAuditFieldsAndDefaultFlagsOnCreate() {
        ManualCreateRequest request = new ManualCreateRequest();
        request.setManualTitle("t");
        request.setDescription("d");
        request.setGeneralUser(false);
        request.setSystemUser(false);
        request.setDocIds(null);

        Manual saved = new Manual();
        saved.setId(10L);
        when(manualRepository.save(any(Manual.class))).thenReturn(saved);

        ArgumentCaptor<Manual> manualCaptor = ArgumentCaptor.forClass(Manual.class);

        manualService.create(request, "u1");

        verify(manualRepository).save(manualCaptor.capture());
        Manual toSave = manualCaptor.getValue();

        assertEquals("u1", toSave.getCreatorUserId());
        assertEquals("u1", toSave.getUpdaterUserId());
        assertNotNull(toSave.getCreatedDateTime());
        assertNotNull(toSave.getUpdatedDateTime());
        assertFalse(toSave.getDeletedFlag());
        assertFalse(toSave.getSystemConfiguratorFlag());
    }

    // =========================================================
    // 47) MANUAL-UT-047 update: title/content always overwritten
    // =========================================================
    @Test
    void update_shouldUpdateTitleAndContentAlways() {
        Manual existing = new Manual();
        existing.setId(1L);
        existing.setTitle("old");
        existing.setContent("oldC");
        existing.setGeneralUserFlag(false);
        existing.setMasterAdminFlag(false);

        ManualUpdateRequest request = new ManualUpdateRequest();
        request.setManualTitle("newTitle");
        request.setDescription("newDesc");
        request.setGeneralUser(null);
        request.setSystemUser(null);
        request.setDocIds(null);

        when(manualRepository.findById(1L)).thenReturn(Optional.of(existing));
        when(manualRepository.save(any(Manual.class))).thenAnswer(inv -> inv.getArgument(0));

        ArgumentCaptor<Manual> saveCaptor = ArgumentCaptor.forClass(Manual.class);

        Optional<Manual> opt = manualService.update(1L, request, "u1");

        assertTrue(opt.isPresent());

        verify(manualRepository).save(saveCaptor.capture());
        Manual saved = saveCaptor.getValue();

        assertEquals("newTitle", saved.getTitle());
        assertEquals("newDesc", saved.getContent());
        assertEquals("u1", saved.getUpdaterUserId());
        assertNotNull(saved.getUpdatedDateTime());
    }







    // =========================================================
    // 48) MANUAL-UT-048 update: keep generalUserFlag when request.generalUser is null
    // =========================================================
    @Test
    void update_shouldKeepGeneralUserFlagWhenNull() {
        Manual existing = new Manual();
        existing.setId(1L);
        existing.setTitle("old");
        existing.setContent("oldC");
        existing.setGeneralUserFlag(true);      // existing TRUE
        existing.setMasterAdminFlag(false);

        ManualUpdateRequest request = new ManualUpdateRequest();
        request.setManualTitle("newTitle");
        request.setDescription("newDesc");
        request.setGeneralUser(null);           // keep
        request.setSystemUser(true);            // change allowed
        request.setDocIds(null);

        when(manualRepository.findById(1L)).thenReturn(Optional.of(existing));
        when(manualRepository.save(any(Manual.class))).thenAnswer(inv -> inv.getArgument(0));

        ArgumentCaptor<Manual> saveCaptor = ArgumentCaptor.forClass(Manual.class);

        Optional<Manual> opt = manualService.update(1L, request, "u1");
        assertTrue(opt.isPresent());

        verify(manualRepository).save(saveCaptor.capture());
        Manual saved = saveCaptor.getValue();

        assertTrue(saved.getGeneralUserFlag());       // unchanged
        assertTrue(saved.getMasterAdminFlag());       // updated to true
    }

    // =========================================================
    // 49) MANUAL-UT-049 update: keep masterAdminFlag when request.systemUser is null
    // =========================================================
    @Test
    void update_shouldKeepSystemUserFlagWhenNull() {
        Manual existing = new Manual();
        existing.setId(1L);
        existing.setTitle("old");
        existing.setContent("oldC");
        existing.setGeneralUserFlag(false);
        existing.setMasterAdminFlag(true);      // existing TRUE

        ManualUpdateRequest request = new ManualUpdateRequest();
        request.setManualTitle("newTitle");
        request.setDescription("newDesc");
        request.setGeneralUser(true);           // change allowed
        request.setSystemUser(null);            // keep
        request.setDocIds(null);

        when(manualRepository.findById(1L)).thenReturn(Optional.of(existing));
        when(manualRepository.save(any(Manual.class))).thenAnswer(inv -> inv.getArgument(0));

        ArgumentCaptor<Manual> saveCaptor = ArgumentCaptor.forClass(Manual.class);

        Optional<Manual> opt = manualService.update(1L, request, "u1");
        assertTrue(opt.isPresent());

        verify(manualRepository).save(saveCaptor.capture());
        Manual saved = saveCaptor.getValue();

        assertTrue(saved.getGeneralUserFlag());       // updated to true
        assertTrue(saved.getMasterAdminFlag());       // unchanged (still true)
    }

    // =========================================================
    // 50) MANUAL-UT-050 update: updater + updatedDateTime updated
    // =========================================================
    @Test
    void update_shouldUpdateUpdaterAndUpdatedDateTime() {
        Manual existing = new Manual();
        existing.setId(1L);
        existing.setTitle("old");
        existing.setContent("oldC");
        existing.setUpdaterUserId("oldUser");
        existing.setUpdatedDateTime(LocalDateTime.of(2026, 1, 1, 0, 0, 0));

        ManualUpdateRequest request = new ManualUpdateRequest();
        request.setManualTitle("newTitle");
        request.setDescription("newDesc");
        request.setGeneralUser(null);
        request.setSystemUser(null);
        request.setDocIds(null);

        when(manualRepository.findById(1L)).thenReturn(Optional.of(existing));
        when(manualRepository.save(any(Manual.class))).thenAnswer(inv -> inv.getArgument(0));

        ArgumentCaptor<Manual> saveCaptor = ArgumentCaptor.forClass(Manual.class);

        Optional<Manual> opt = manualService.update(1L, request, "u1");
        assertTrue(opt.isPresent());

        verify(manualRepository).save(saveCaptor.capture());
        Manual saved = saveCaptor.getValue();

        assertEquals("u1", saved.getUpdaterUserId());
        assertNotNull(saved.getUpdatedDateTime());
        assertTrue(saved.getUpdatedDateTime().isAfter(LocalDateTime.of(2026, 1, 1, 0, 0, 0)));
    }

    // =========================================================
    // 51) MANUAL-UT-051 softDelete: deletedFlag=true + audit fields updated
    // =========================================================
    @Test
    void softDelete_shouldSetDeletedFlagTrueAndAuditFields() {
        Manual existing = new Manual();
        existing.setId(1L);
        existing.setDeletedFlag(false);
        existing.setUpdaterUserId("oldUser");
        existing.setUpdatedDateTime(LocalDateTime.of(2026, 1, 1, 0, 0, 0));

        when(manualRepository.findById(1L)).thenReturn(Optional.of(existing));
        when(manualRepository.save(any(Manual.class))).thenAnswer(inv -> inv.getArgument(0));

        ArgumentCaptor<Manual> saveCaptor = ArgumentCaptor.forClass(Manual.class);

        Optional<Manual> opt = manualService.softDelete(1L, "u1");
        assertTrue(opt.isPresent());

        verify(manualRepository).save(saveCaptor.capture());
        Manual saved = saveCaptor.getValue();

        assertTrue(saved.getDeletedFlag());
        assertEquals("u1", saved.getUpdaterUserId());
        assertNotNull(saved.getUpdatedDateTime());
        assertTrue(saved.getUpdatedDateTime().isAfter(LocalDateTime.of(2026, 1, 1, 0, 0, 0)));
    }

    // =========================================================
    // 52) MANUAL-UT-052 findDownloadFile: returns only not-deleted file (repository method)
    // =========================================================
    @Test
    void findDownloadFile_shouldReturnOnlyNotDeletedFile() {
        ManualFile file = new ManualFile();
        file.setId(100L);
        file.setDeletedFlag(false);

        when(manualFileRepository.findByIdAndDeletedFlagFalse(100L)).thenReturn(Optional.of(file));

        Optional<ManualFile> opt = manualService.findDownloadFile(100L);

        assertTrue(opt.isPresent());
        assertFalse(opt.get().getDeletedFlag());
        verify(manualFileRepository, times(1)).findByIdAndDeletedFlagFalse(100L);
    }

    // =========================================================
    // 53) MANUAL-UT-053 uploadFile: set all fields and save ManualFile
    // =========================================================
    @Test
    void uploadFile_shouldSetAllFieldsAndSaveManualFile() {
        when(manualFileRepository.save(any(ManualFile.class))).thenAnswer(inv -> inv.getArgument(0));

        ArgumentCaptor<ManualFile> captor = ArgumentCaptor.forClass(ManualFile.class);

        ManualFile saved = manualService.uploadFile(
                10L,
                "a.pdf",
                "folder/a.pdf",
                12345L,
                "pdf",
                "u1"
        );

        verify(manualFileRepository).save(captor.capture());
        ManualFile mf = captor.getValue();

        assertEquals(10L, mf.getManualId());
        assertEquals("a.pdf", mf.getFileName());
        assertEquals("folder/a.pdf", mf.getDestinationUrl());
        assertEquals("pdf", mf.getFileFormat());
        assertNotNull(mf.getFileSize());
        assertFalse(mf.getDeletedFlag());
        assertEquals("u1", mf.getCreatorUserId());
        assertEquals("u1", mf.getUpdaterUserId());
        assertNotNull(mf.getCreatedDateTime());
        assertNotNull(mf.getUpdatedDateTime());

        // returned object is what repo saved (we return argument)
        assertNotNull(saved);
    }

    // =========================================================
    // 54) MANUAL-UT-054 getCurrentUserId: return null when not authenticated
    // =========================================================
    @Test
    void getCurrentUserId_shouldReturnNullWhenNotAuthenticated() {
        // Case 1: auth is null
        SecurityContextHolder.clearContext();
        assertNull(manualService.getCurrentUserId());

        // Case 2: auth exists but not authenticated
        Authentication auth = mock(Authentication.class);
        when(auth.isAuthenticated()).thenReturn(false);
        SecurityContextHolder.getContext().setAuthentication(auth);

        assertNull(manualService.getCurrentUserId());

        SecurityContextHolder.clearContext();
    }

    // =========================================================
    // 55) MANUAL-UT-055 create: docIds null -> manualFileRepository.save not called
    // =========================================================
    @Test
    void create_shouldNotSaveManualFilesWhenDocIdsNull() {
        ManualCreateRequest request = new ManualCreateRequest();
        request.setManualTitle("t");
        request.setDescription("d");
        request.setGeneralUser(true);
        request.setSystemUser(false);
        request.setDocIds(null);

        Manual saved = new Manual();
        saved.setId(10L);
        when(manualRepository.save(any(Manual.class))).thenReturn(saved);

        manualService.create(request, "u1");

        verify(manualRepository, times(1)).save(any(Manual.class));
        verify(manualFileRepository, never()).save(any(ManualFile.class));
    }

    // =========================================================
    // 56) MANUAL-UT-056 create: ignore blank docIds, save only valid ones
    // =========================================================
    @Test
    void create_shouldIgnoreBlankDocIdsWhenSaving() {
        ManualCreateRequest request = new ManualCreateRequest();
        request.setManualTitle("t");
        request.setDescription("d");
        request.setGeneralUser(true);
        request.setSystemUser(false);
        request.setDocIds(List.of("", "   ", "folder/a.pdf"));

        Manual saved = new Manual();
        saved.setId(10L);
        when(manualRepository.save(any(Manual.class))).thenReturn(saved);
        when(manualFileRepository.save(any(ManualFile.class))).thenAnswer(inv -> inv.getArgument(0));

        // avoid fileSize resolution touching storage
        when(storageService.listByPrefix(anyString())).thenReturn(Collections.emptyList());

        manualService.create(request, "u1");

        // should save exactly 1 ManualFile (for folder/a.pdf)
        verify(manualFileRepository, times(1)).save(any(ManualFile.class));

        ArgumentCaptor<ManualFile> captor = ArgumentCaptor.forClass(ManualFile.class);
        verify(manualFileRepository).save(captor.capture());
        assertEquals("folder/a.pdf", captor.getValue().getDestinationUrl());
    }

    // =========================================================
    // 57) MANUAL-UT-057 create: extract fileName and extension on saveManualFiles
    // docId name segment > 37 -> fileName substring(37) result
    // =========================================================
    @Test
    void create_shouldExtractFileNameAndExtensionOnSaveManualFiles() {
        String docId = "folder/1234567890123456789012345678901234567sample.pdf";
        // last segment: "1234567890123456789012345678901234567sample.pdf"
        String lastSegment = docId.substring(docId.lastIndexOf('/') + 1);
        String expectedFileName = lastSegment.substring(37); // "sample.pdf"
        String expectedExt = "pdf";

        ManualCreateRequest request = new ManualCreateRequest();
        request.setManualTitle("t");
        request.setDescription("d");
        request.setGeneralUser(true);
        request.setSystemUser(false);
        request.setDocIds(List.of(docId));

        Manual saved = new Manual();
        saved.setId(10L);
        when(manualRepository.save(any(Manual.class))).thenReturn(saved);
        when(manualFileRepository.save(any(ManualFile.class))).thenAnswer(inv -> inv.getArgument(0));

        // avoid fileSize resolution touching storage
        when(storageService.listByPrefix(anyString())).thenReturn(Collections.emptyList());

        manualService.create(request, "u1");

        ArgumentCaptor<ManualFile> captor = ArgumentCaptor.forClass(ManualFile.class);
        verify(manualFileRepository, times(1)).save(captor.capture());

        ManualFile mf = captor.getValue();
        assertEquals(docId, mf.getDestinationUrl());
        assertEquals(expectedFileName, mf.getFileName());
        assertEquals(expectedExt, mf.getFileFormat());
    }


    // =========================================================
    // MANUAL-UT-058
    // update: removed docId -> existing ManualFile is soft-deleted
    // =========================================================
    @Test
    void update_shouldSoftDeleteRemovedDocIdsDuringSync() {
        Manual existingManual = new Manual();
        existingManual.setId(1L);

        ManualFile a = new ManualFile();
        a.setManualId(1L);
        a.setDestinationUrl("a.pdf");
        a.setDeletedFlag(false);

        ManualFile b = new ManualFile();
        b.setManualId(1L);
        b.setDestinationUrl("b.pdf");
        b.setDeletedFlag(false);

        when(manualRepository.findById(1L)).thenReturn(Optional.of(existingManual));
        when(manualRepository.save(any(Manual.class))).thenAnswer(inv -> inv.getArgument(0));

        when(manualFileRepository.findAllByManualIdAndDeletedFlagFalse(1L)).thenReturn(List.of(a, b));
        when(manualFileRepository.save(any(ManualFile.class))).thenAnswer(inv -> inv.getArgument(0));

        ManualUpdateRequest req = new ManualUpdateRequest();
        req.setManualTitle("t");
        req.setDescription("d");
        req.setDocIds(List.of("a.pdf")); // b.pdf removed => should be deleted

        manualService.update(1L, req, "u1");

        ArgumentCaptor<ManualFile> captor = ArgumentCaptor.forClass(ManualFile.class);
        verify(manualFileRepository, atLeastOnce()).save(captor.capture());

        boolean bDeleted = captor.getAllValues().stream().anyMatch(mf ->
                "b.pdf".equals(mf.getDestinationUrl())
                        && Boolean.TRUE.equals(mf.getDeletedFlag())
                        && "u1".equals(mf.getUpdaterUserId())
                        && mf.getUpdatedDateTime() != null
        );
        assertTrue(bDeleted, "b.pdf should be soft-deleted with updater + updatedDateTime");
    }

    // =========================================================
    // MANUAL-UT-059
    // update: new docId -> new ManualFile inserted
    // =========================================================
    @Test
    void update_shouldAddNewDocIdsDuringSync() {
        Manual existingManual = new Manual();
        existingManual.setId(1L);

        ManualFile a = new ManualFile();
        a.setManualId(1L);
        a.setDestinationUrl("a.pdf");
        a.setDeletedFlag(false);

        when(manualRepository.findById(1L)).thenReturn(Optional.of(existingManual));
        when(manualRepository.save(any(Manual.class))).thenAnswer(inv -> inv.getArgument(0));

        when(manualFileRepository.findAllByManualIdAndDeletedFlagFalse(1L)).thenReturn(List.of(a));
        when(manualFileRepository.save(any(ManualFile.class))).thenAnswer(inv -> inv.getArgument(0));

        // avoid storage/fileSize influence
        when(storageService.listByPrefix(anyString())).thenReturn(List.of());

        ManualUpdateRequest req = new ManualUpdateRequest();
        req.setManualTitle("t");
        req.setDescription("d");
        req.setDocIds(List.of("a.pdf", "c.pdf"));

        manualService.update(1L, req, "u1");

        ArgumentCaptor<ManualFile> captor = ArgumentCaptor.forClass(ManualFile.class);
        verify(manualFileRepository, atLeastOnce()).save(captor.capture());

        boolean cInserted = captor.getAllValues().stream().anyMatch(mf ->
                "c.pdf".equals(mf.getDestinationUrl())
                        && Boolean.FALSE.equals(mf.getDeletedFlag())
                        && "u1".equals(mf.getCreatorUserId())
                        && "u1".equals(mf.getUpdaterUserId())
                        && mf.getCreatedDateTime() != null
                        && mf.getUpdatedDateTime() != null
        );
        assertTrue(cInserted, "c.pdf should be inserted with audit fields");
    }

    // =========================================================
    // MANUAL-UT-060
    // update: no duplicate when docIds unchanged
    // =========================================================
    @Test
    void update_shouldNotDuplicateExistingDocIdsDuringSync() {
        Manual existingManual = new Manual();
        existingManual.setId(1L);

        ManualFile a = new ManualFile();
        a.setManualId(1L);
        a.setDestinationUrl("a.pdf");
        a.setDeletedFlag(false);

        when(manualRepository.findById(1L)).thenReturn(Optional.of(existingManual));
        when(manualRepository.save(any(Manual.class))).thenAnswer(inv -> inv.getArgument(0));

        when(manualFileRepository.findAllByManualIdAndDeletedFlagFalse(1L)).thenReturn(List.of(a));

        ManualUpdateRequest req = new ManualUpdateRequest();
        req.setManualTitle("t");
        req.setDescription("d");
        req.setDocIds(List.of("a.pdf"));

        manualService.update(1L, req, "u1");

        // no removed docIds, no new docIds => no save on manualFileRepository
        verify(manualFileRepository, never()).save(any(ManualFile.class));
    }

    // =========================================================
    // MANUAL-UT-061
    // update: ignore blank docIds, only x.pdf inserted
    // =========================================================
    @Test
    void update_shouldIgnoreBlankDocIdsDuringSync() {
        Manual existingManual = new Manual();
        existingManual.setId(1L);

        when(manualRepository.findById(1L)).thenReturn(Optional.of(existingManual));
        when(manualRepository.save(any(Manual.class))).thenAnswer(inv -> inv.getArgument(0));

        when(manualFileRepository.findAllByManualIdAndDeletedFlagFalse(1L)).thenReturn(List.of());
        when(manualFileRepository.save(any(ManualFile.class))).thenAnswer(inv -> inv.getArgument(0));

        when(storageService.listByPrefix(anyString())).thenReturn(List.of());

        ManualUpdateRequest req = new ManualUpdateRequest();
        req.setManualTitle("t");
        req.setDescription("d");
        req.setDocIds(List.of("", "   ", "x.pdf"));

        manualService.update(1L, req, "u1");

        ArgumentCaptor<ManualFile> captor = ArgumentCaptor.forClass(ManualFile.class);
        verify(manualFileRepository, times(1)).save(captor.capture());

        assertEquals("x.pdf", captor.getValue().getDestinationUrl());
    }

    // =========================================================
    // MANUAL-UT-062
    // update: docIds null -> all existing files soft-deleted
    // (dev code treats null as empty list => delete all existing)
    // =========================================================
    @Test
    void update_shouldMarkAllExistingFilesDeletedWhenDocIdsNull() {
        Manual existingManual = new Manual();
        existingManual.setId(1L);

        ManualFile a = new ManualFile();
        a.setManualId(1L);
        a.setDestinationUrl("a.pdf");
        a.setDeletedFlag(false);

        ManualFile b = new ManualFile();
        b.setManualId(1L);
        b.setDestinationUrl("b.pdf");
        b.setDeletedFlag(false);

        when(manualRepository.findById(1L)).thenReturn(Optional.of(existingManual));
        when(manualRepository.save(any(Manual.class))).thenAnswer(inv -> inv.getArgument(0));

        when(manualFileRepository.findAllByManualIdAndDeletedFlagFalse(1L)).thenReturn(List.of(a, b));
        when(manualFileRepository.save(any(ManualFile.class))).thenAnswer(inv -> inv.getArgument(0));

        ManualUpdateRequest req = new ManualUpdateRequest();
        req.setManualTitle("t");
        req.setDescription("d");
        req.setDocIds(null);

        manualService.update(1L, req, "u1");

        ArgumentCaptor<ManualFile> captor = ArgumentCaptor.forClass(ManualFile.class);
        verify(manualFileRepository, times(2)).save(captor.capture());

        assertTrue(captor.getAllValues().stream().allMatch(mf -> Boolean.TRUE.equals(mf.getDeletedFlag())));
    }

    // =========================================================
    // MANUAL-UT-063
    // create/update: fileSize KB (scale=3) when storage file exists
    // We use create() to trigger saveManualFiles()
    // =========================================================
    @Test
    void create_shouldSetFileSizeKbScale3WhenStorageFileExists() throws Exception {
        Path tmp = Files.createTempFile("manual", ".bin");
        Files.write(tmp, new byte[2048]); // 2048 bytes => 2.000 KB

        String docId = "folder/a.pdf";

        when(storageService.listByPrefix(docId)).thenReturn(List.of("key1"));
        when(storageService.getFileByPath("key1")).thenReturn(tmp.toFile());

        when(manualFileRepository.save(any(ManualFile.class))).thenAnswer(inv -> inv.getArgument(0));

        ManualCreateRequest request = new ManualCreateRequest();
        request.setManualTitle("t");
        request.setDescription("d");
        request.setGeneralUser(true);
        request.setSystemUser(false);
        request.setDocIds(List.of(docId));

        Manual saved = new Manual();
        saved.setId(10L);
        when(manualRepository.save(any(Manual.class))).thenReturn(saved);

        manualService.create(request, "u1");

        ArgumentCaptor<ManualFile> captor = ArgumentCaptor.forClass(ManualFile.class);
        verify(manualFileRepository).save(captor.capture());

        assertEquals(new BigDecimal("2.000"), captor.getValue().getFileSize());
    }

    // =========================================================
    // MANUAL-UT-064
    // create/update: storage throws -> fileSize null, no exception
    // =========================================================
    @Test
    void create_shouldSetFileSizeNullWhenStorageThrowsException() {
        String docId = "folder/a.pdf";
        when(storageService.listByPrefix(docId)).thenThrow(new RuntimeException("boom"));

        when(manualFileRepository.save(any(ManualFile.class))).thenAnswer(inv -> inv.getArgument(0));

        ManualCreateRequest request = new ManualCreateRequest();
        request.setManualTitle("t");
        request.setDescription("d");
        request.setGeneralUser(true);
        request.setSystemUser(false);
        request.setDocIds(List.of(docId));

        Manual saved = new Manual();
        saved.setId(10L);
        when(manualRepository.save(any(Manual.class))).thenReturn(saved);

        assertDoesNotThrow(() -> manualService.create(request, "u1"));

        ArgumentCaptor<ManualFile> captor = ArgumentCaptor.forClass(ManualFile.class);
        verify(manualFileRepository).save(captor.capture());

        assertNull(captor.getValue().getFileSize());
    }

    // =========================================================
    // MANUAL-UT-065
    // getCurrentUserId: authentication null -> null
    // =========================================================
    @Test
    void getCurrentUserId_shouldReturnNullWhenAuthenticationNull() {
        SecurityContextHolder.clearContext();
        assertNull(manualService.getCurrentUserId());
    }

    // =========================================================
    // MANUAL-UT-066
    // getCurrentUserId: auth exists but not authenticated -> null
    // =========================================================
    @Test
    void getCurrentUserId_shouldReturnNullWhenAuthIsNotAuthenticated() {
        Authentication auth = mock(Authentication.class);
        when(auth.isAuthenticated()).thenReturn(false);

        SecurityContextHolder.getContext().setAuthentication(auth);

        assertNull(manualService.getCurrentUserId());

        SecurityContextHolder.clearContext();
    }


    // =========================================================
    // MANUAL-UT-067
    // getCurrentUserId: principal is CustomUserDetails -> returns domainUser.userId
    // (matches your uploaded CustomUserDetails.java)
    // =========================================================
    @Test
    void getCurrentUserId_shouldReturnUserIdWhenPrincipalIsCustomUserDetails() {
        UserModel user = mock(UserModel.class);
        when(user.getUserId()).thenReturn("u1");

        CustomUserDetails details = new CustomUserDetails(user, Map.of());

        Authentication auth = mock(Authentication.class);
        when(auth.isAuthenticated()).thenReturn(true);
        when(auth.getPrincipal()).thenReturn(details);

        SecurityContextHolder.getContext().setAuthentication(auth);

        assertEquals("u1", manualService.getCurrentUserId());

        SecurityContextHolder.clearContext();
    }



    // =========================================================
    // MANUAL-UT-068
    // principal is UserModel -> returns userId
    // =========================================================
    @Test
    void getCurrentUserId_shouldReturnUserIdWhenPrincipalIsUserModel() {
        UserModel user = new UserModel();
        user.setUserId("u2");

        Authentication auth = mock(Authentication.class);
        when(auth.isAuthenticated()).thenReturn(true);
        when(auth.getPrincipal()).thenReturn(user);

        SecurityContextHolder.getContext().setAuthentication(auth);

        assertEquals("u2", manualService.getCurrentUserId());

        SecurityContextHolder.clearContext();
    }

    // =========================================================
    // MANUAL-UT-069
    // principal is Spring Security User -> returns username
    // =========================================================
    @Test
    void getCurrentUserId_shouldReturnUsernameWhenPrincipalIsSpringUser() {
        User springUser = new User("springUser", "pw", List.of());

        Authentication auth = mock(Authentication.class);
        when(auth.isAuthenticated()).thenReturn(true);
        when(auth.getPrincipal()).thenReturn(springUser);

        SecurityContextHolder.getContext().setAuthentication(auth);

        assertEquals("springUser", manualService.getCurrentUserId());

        SecurityContextHolder.clearContext();
    }

    // =========================================================
    // MANUAL-UT-070
    // principal unknown type -> returns null
    // =========================================================
    @Test
    void getCurrentUserId_shouldReturnNullWhenPrincipalUnknownType() {
        Authentication auth = mock(Authentication.class);
        when(auth.isAuthenticated()).thenReturn(true);
        when(auth.getPrincipal()).thenReturn(new Object());

        SecurityContextHolder.getContext().setAuthentication(auth);

        assertNull(manualService.getCurrentUserId());

        SecurityContextHolder.clearContext();
    }

    // =========================================================
    // MANUAL-UT-071
    // updaterUserId blank -> updatedBy should be ""
    // =========================================================
    @Test
    void getList_shouldReturnEmptyUpdatedByWhenUpdaterUserIdBlank() {
        Manual m = new Manual();
        m.setId(1L);
        m.setTitle("t");
        m.setGeneralUserFlag(true);
        m.setMasterAdminFlag(false);
        m.setUpdaterUserId(""); // blank
        m.setUpdatedDateTime(LocalDateTime.now());

        // page mock
        org.springframework.data.domain.Page<Manual> page =
                new org.springframework.data.domain.PageImpl<>(List.of(m));

        when(manualRepository.search(any(), any(), any(), any())).thenReturn(page);

        ManualListQuery q = new ManualListQuery();
        ManualListData result = manualService.getList(q);

        assertEquals(1, result.getManuals().size());
        assertEquals("", result.getManuals().get(0).getUpdatedBy());

        // userRepository must not be called if updaterUserId blank
        verify(userRepository, never()).findById(any());
    }

    // =========================================================
    // MANUAL-UT-072
    // updater user not found -> updatedBy should be ""
    // =========================================================
    @Test
    void getList_shouldReturnEmptyUpdatedByWhenUserNotFound() {
        Manual m = new Manual();
        m.setId(1L);
        m.setTitle("t");
        m.setGeneralUserFlag(true);
        m.setMasterAdminFlag(false);
        m.setUpdaterUserId("u-x"); // non blank
        m.setUpdatedDateTime(LocalDateTime.now());

        org.springframework.data.domain.Page<Manual> page =
                new org.springframework.data.domain.PageImpl<>(List.of(m));

        when(manualRepository.search(any(), any(), any(), any())).thenReturn(page);
        when(userRepository.findById("u-x")).thenReturn(Optional.empty());

        ManualListData result = manualService.getList(new ManualListQuery());

        assertEquals("", result.getManuals().get(0).getUpdatedBy());
        verify(userRepository, times(1)).findById("u-x");
    }

    // =========================================================
    // MANUAL-UT-073
    // updatedAt format should be JST yyyy/MM/dd HH:mm:ss
    // NOTE: ManualService uses dateTime.atZone(JST).format(...)
    // So we validate the exact expected JST formatted string.
    // =========================================================
    @Test
    void getList_shouldFormatDateTimeAsJstPattern() {
        // Use a known UTC moment and interpret it as LocalDateTime (dev code does not attach zone)
        // Then service converts UTC -> JST and formats the converted value.
        LocalDateTime fixed = LocalDateTime.of(2026, 2, 12, 10, 0, 0);

        Manual m = new Manual();
        m.setId(1L);
        m.setTitle("t");
        m.setGeneralUserFlag(true);
        m.setMasterAdminFlag(false);
        m.setUpdaterUserId("");
        m.setUpdatedDateTime(fixed);

        org.springframework.data.domain.Page<Manual> page =
                new org.springframework.data.domain.PageImpl<>(List.of(m));
        when(manualRepository.search(any(), any(), any(), any())).thenReturn(page);

        ManualListData result = manualService.getList(new ManualListQuery());

        assertEquals("2026/02/12 19:00:00", result.getManuals().get(0).getUpdatedAt());
    }

    // =========================================================
    // MANUAL-UT-074
    // updatedDateTime null -> updatedAt null
    // =========================================================
    @Test
    void getList_shouldReturnNullUpdatedAtWhenUpdatedDateTimeNull() {
        Manual m = new Manual();
        m.setId(1L);
        m.setTitle("t");
        m.setGeneralUserFlag(true);
        m.setMasterAdminFlag(false);
        m.setUpdaterUserId("");
        m.setUpdatedDateTime(null);

        org.springframework.data.domain.Page<Manual> page =
                new org.springframework.data.domain.PageImpl<>(List.of(m));
        when(manualRepository.search(any(), any(), any(), any())).thenReturn(page);

        ManualListData result = manualService.getList(new ManualListQuery());

        assertNull(result.getManuals().get(0).getUpdatedAt());
    }



}

