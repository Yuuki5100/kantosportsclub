package com.example.appserver.service;

import com.example.appserver.cache.SettingVariableCache;
import com.example.servercommon.model.SettingModel;
import com.example.servercommon.repository.SettingRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.*;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.*;

/**
 *
 * SettingService の単体テスト
 */
@ExtendWith(MockitoExtension.class)
class SettingServiceTest {

    @Mock
    private SettingRepository settingRepository;

    @Mock
    private SettingVariableCache settingVariableCache;

    @InjectMocks
    private SettingService settingService;

    private SettingModel mockSetting;

    @BeforeEach
    void setUp() {
        mockSetting = new SettingModel();
        mockSetting.setItem("site.name");
        mockSetting.setVal("Old Value");
    }

    @Test
    void testFindAll_ReturnsCacheData() {
        List<SettingModel> cachedList = List.of(mockSetting);
        when(settingVariableCache.getCache()).thenReturn(cachedList);

        List<SettingModel> result = settingService.findAll();

        assertThat(result).hasSize(1).contains(mockSetting);
        verify(settingVariableCache, times(1)).getCache();
        verifyNoInteractions(settingRepository);

    }

    @Test
    void testUpdateSetting_WhenKeyExists() {
        when(settingRepository.findById("site.name")).thenReturn(Optional.of(mockSetting));
        when(settingRepository.save(any())).thenReturn(mockSetting);

        Optional<SettingModel> result = settingService.updateSetting("site.name", "New Value");

        assertThat(result).isPresent();
        assertThat(result.get().getVal()).isEqualTo("New Value");

        verify(settingRepository).findById("site.name");
        verify(settingRepository).save(mockSetting);

    }

    @Test
    void testUpdateSetting_WhenKeyNotFound() {
        when(settingRepository.findById("not.exists")).thenReturn(Optional.empty());

        Optional<SettingModel> result = settingService.updateSetting("not.exists", "AnyValue");

        assertThat(result).isEmpty();
        verify(settingRepository).findById("not.exists");
        verify(settingRepository, never()).save(any());

    }

    @Test
    void testDeleteSetting_WhenKeyExists() {
        when(settingRepository.existsById("site.name")).thenReturn(true);

        boolean result = settingService.deleteSetting("site.name");

        assertThat(result).isTrue();
        verify(settingRepository).deleteById("site.name");

    }

    @Test
    void testDeleteSetting_WhenKeyNotFound() {
        when(settingRepository.existsById("not.exists")).thenReturn(false);

        boolean result = settingService.deleteSetting("not.exists");

        assertThat(result).isFalse();
        verify(settingRepository, never()).deleteById(anyString());

    }
}
