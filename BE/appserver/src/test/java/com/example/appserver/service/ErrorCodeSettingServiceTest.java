package com.example.appserver.service;

import com.example.appserver.cache.ErrorCodeCache;
import com.example.servercommon.model.ErrorCodeId;
import com.example.servercommon.model.ErrorCodeSettingModel;
import com.example.servercommon.repository.ErrorCodeSettingRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.mockito.Mockito;

import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class ErrorCodeSettingServiceTest {

    private ErrorCodeSettingService service;
    private ErrorCodeSettingRepository repository;
    private ErrorCodeCache cache;

    @BeforeEach
    void setUp() {
        repository = mock(ErrorCodeSettingRepository.class);
        cache = mock(ErrorCodeCache.class);

        service = new ErrorCodeSettingService();
        // フィールドに直接注入
        setField(service, "errorCodeRepository", repository);
        setField(service, "errorCodeCache", cache);
    }

    private void setField(Object target, String fieldName, Object value) {
        try {
            java.lang.reflect.Field field = target.getClass().getDeclaredField(fieldName);
            field.setAccessible(true);
            field.set(target, value);
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }

    @Test
    void findAll_ShouldReturnCachedErrorCodes() {
        List<ErrorCodeSettingModel> cached = Arrays.asList(
                new ErrorCodeSettingModel("E001", "ja", "エラー1"),
                new ErrorCodeSettingModel("E002", "en", "Error 2")
        );
        when(cache.getCache()).thenReturn(cached);

        List<ErrorCodeSettingModel> result = service.findAll();

        assertEquals(2, result.size());
        assertEquals("E001", result.get(0).getCode());
        verify(cache, times(1)).getCache();
    }

    @Test
    void saveOrUpdate_ShouldSaveErrorCode() {
        ErrorCodeSettingModel model = new ErrorCodeSettingModel("E003", "ja", "新しいエラー");
        when(repository.save(model)).thenReturn(model);

        ErrorCodeSettingModel result = service.saveOrUpdate(model);

        assertNotNull(result);
        assertEquals("E003", result.getCode());
        verify(repository, times(1)).save(model);
    }

    @Test
    void updateMessage_ShouldUpdateExistingErrorCode() {
        ErrorCodeSettingModel existing = new ErrorCodeSettingModel("E004", "ja", "古いメッセージ");
        ErrorCodeId id = new ErrorCodeId("E004", "ja");

        when(repository.findById(id)).thenReturn(Optional.of(existing));
        when(repository.save(existing)).thenReturn(existing);

        Optional<ErrorCodeSettingModel> result = service.updateMessage("E004", "ja", "新しいメッセージ");

        assertTrue(result.isPresent());
        assertEquals("新しいメッセージ", result.get().getMessage());
        verify(repository, times(1)).findById(id);
        verify(repository, times(1)).save(existing);
    }

    @Test
    void updateMessage_ShouldInsertNewErrorCodeIfNotExist() {
        ErrorCodeId id = new ErrorCodeId("E005", "en");

        when(repository.findById(id)).thenReturn(Optional.empty());
        ArgumentCaptor<ErrorCodeSettingModel> captor = ArgumentCaptor.forClass(ErrorCodeSettingModel.class);
        when(repository.save(captor.capture())).thenAnswer(invocation -> invocation.getArgument(0));

        Optional<ErrorCodeSettingModel> result = service.updateMessage("E005", "en", "New Error");

        assertTrue(result.isPresent());
        assertEquals("E005", result.get().getCode());
        assertEquals("New Error", result.get().getMessage());

        verify(repository, times(1)).findById(id);
        verify(repository, times(1)).save(any(ErrorCodeSettingModel.class));
    }
}
