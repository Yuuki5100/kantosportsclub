package com.example.servercommon.helper;

import com.example.servercommon.config.ReportCacheProperties;
import com.example.servercommon.model.ReportDefinition;
import com.example.servercommon.model.ReportLayout;
import com.example.servercommon.model.ReportMaster;
import com.example.servercommon.repository.ReportLayoutRepository;
import com.example.servercommon.repository.ReportMasterRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.Mockito.*;

class ReportDefinitionLoaderTest {

    private ReportMasterRepository reportMasterRepository;
    private ReportLayoutRepository reportLayoutRepository;
    private ReportCacheProperties cacheProperties;
    private ReportDefinitionLoader loader;

    private final Long REPORT_ID = 1L;
    private ReportMaster mockMaster;
    private List<ReportLayout> mockLayoutList;

    @BeforeEach
    void setUp() {
        reportMasterRepository = mock(ReportMasterRepository.class);
        reportLayoutRepository = mock(ReportLayoutRepository.class);
        cacheProperties = mock(ReportCacheProperties.class);

        loader = new ReportDefinitionLoader(
            reportMasterRepository,
            reportLayoutRepository,
            cacheProperties
        );

        mockMaster = new ReportMaster();
        mockMaster.setReportId(REPORT_ID);
        mockMaster.setTemplateFile("template.xlsx");

        ReportLayout layout = new ReportLayout();
        layout.setPropertyPath("name");
        layout.setDisplayLabel("氏名");

        mockLayoutList = List.of(layout);
    }

    @Test
    void キャッシュ無効時は常にDBから取得される() {
        when(cacheProperties.isEnabled()).thenReturn(false);
        when(reportMasterRepository.findByReportId(REPORT_ID)).thenReturn(mockMaster);
        when(reportLayoutRepository.findByReportId(REPORT_ID)).thenReturn(mockLayoutList);

        ReportDefinition def1 = loader.load(REPORT_ID);
        ReportDefinition def2 = loader.load(REPORT_ID);

        assertThat(def1).isNotNull();
        assertThat(def2).isNotNull();
        verify(reportMasterRepository, times(2)).findByReportId(REPORT_ID);
        verify(reportLayoutRepository, times(2)).findByReportId(REPORT_ID);
    }

    @Test
    void キャッシュ有効時は最初の一度だけDBから取得される() {
        when(cacheProperties.isEnabled()).thenReturn(true);
        when(reportMasterRepository.findByReportId(REPORT_ID)).thenReturn(mockMaster);
        when(reportLayoutRepository.findByReportId(REPORT_ID)).thenReturn(mockLayoutList);

        ReportDefinition def1 = loader.load(REPORT_ID);
        ReportDefinition def2 = loader.load(REPORT_ID);

        assertThat(def1).isSameAs(def2);
        verify(reportMasterRepository, times(1)).findByReportId(REPORT_ID);
        verify(reportLayoutRepository, times(1)).findByReportId(REPORT_ID);
    }

    @Test
    void キャッシュ有効時にreloadすると再取得される() {
        when(cacheProperties.isEnabled()).thenReturn(true);
        when(reportMasterRepository.findByReportId(REPORT_ID)).thenReturn(mockMaster);
        when(reportLayoutRepository.findByReportId(REPORT_ID)).thenReturn(mockLayoutList);

        ReportDefinition def1 = loader.load(REPORT_ID);
        loader.reload(REPORT_ID);
        ReportDefinition def2 = loader.load(REPORT_ID);

        assertThat(def1).isNotSameAs(def2);
        verify(reportMasterRepository, times(2)).findByReportId(REPORT_ID);
        verify(reportLayoutRepository, times(2)).findByReportId(REPORT_ID);
    }

    @Test
    void レポートマスターが存在しない場合は例外が発生する() {
        when(cacheProperties.isEnabled()).thenReturn(false);
        when(reportMasterRepository.findByReportId(REPORT_ID)).thenReturn(null);

        assertThatThrownBy(() -> loader.load(REPORT_ID))
            .isInstanceOf(IllegalArgumentException.class)
            .hasMessageContaining("帳票が見つかりません");
    }

    @Test
    void レイアウトが空の場合は例外が発生する() {
        when(cacheProperties.isEnabled()).thenReturn(false);
        when(reportMasterRepository.findByReportId(REPORT_ID)).thenReturn(mockMaster);
        when(reportLayoutRepository.findByReportId(REPORT_ID)).thenReturn(List.of());

        assertThatThrownBy(() -> loader.load(REPORT_ID))
            .isInstanceOf(IllegalArgumentException.class)
            .hasMessageContaining("帳票レイアウトが存在しません");
    }
}
