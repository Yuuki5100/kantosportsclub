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
import java.util.concurrent.ConcurrentHashMap;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.Mockito.*;

class UserServiceImplTest {

    private ReportMasterRepository reportMasterRepository;
    private ReportLayoutRepository reportLayoutRepository;
    private ReportCacheProperties cacheProperties;
    private ReportDefinitionLoader loader;

    private final Long REPORT_ID = 100L;

    @BeforeEach
    void setUp() {
        reportMasterRepository = mock(ReportMasterRepository.class);
        reportLayoutRepository = mock(ReportLayoutRepository.class);
        cacheProperties = mock(ReportCacheProperties.class);

        loader = new ReportDefinitionLoader(reportMasterRepository, reportLayoutRepository, cacheProperties);
    }

    @Test
    void loadFromDatabase_successfullyCreatesDefinitionWithoutCache() {
        when(cacheProperties.isEnabled()).thenReturn(false);

        ReportMaster master = new ReportMaster();
        ReportLayout layout = new ReportLayout();
        when(reportMasterRepository.findByReportId(REPORT_ID)).thenReturn(master);
        when(reportLayoutRepository.findByReportId(REPORT_ID)).thenReturn(List.of(layout));

        ReportDefinition result = loader.load(REPORT_ID);

        assertThat(result).isNotNull();
        assertThat(result.getReportMaster()).isEqualTo(master);
        assertThat(result.getLayoutList()).containsExactly(layout);

        verify(reportMasterRepository, times(1)).findByReportId(REPORT_ID);
        verify(reportLayoutRepository, times(1)).findByReportId(REPORT_ID);
    }

    @Test
    void loadFromDatabase_throwsWhenReportNotFound() {
        when(cacheProperties.isEnabled()).thenReturn(false);
        when(reportMasterRepository.findByReportId(REPORT_ID)).thenReturn(null);

        assertThatThrownBy(() -> loader.load(REPORT_ID))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("帳票が見つかりません");

        verify(reportLayoutRepository, never()).findByReportId(any());
    }

    @Test
    void loadFromDatabase_throwsWhenLayoutListEmpty() {
        when(cacheProperties.isEnabled()).thenReturn(false);

        when(reportMasterRepository.findByReportId(REPORT_ID)).thenReturn(new ReportMaster());
        when(reportLayoutRepository.findByReportId(REPORT_ID)).thenReturn(List.of());

        assertThatThrownBy(() -> loader.load(REPORT_ID))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("帳票レイアウトが存在しません");
    }

    @Test
    void load_usesCacheWhenEnabled() {
        when(cacheProperties.isEnabled()).thenReturn(true);

        ReportMaster master = new ReportMaster();
        ReportLayout layout = new ReportLayout();
        when(reportMasterRepository.findByReportId(REPORT_ID)).thenReturn(master);
        when(reportLayoutRepository.findByReportId(REPORT_ID)).thenReturn(List.of(layout));

        // 初回ロード（DB呼び出しあり）
        ReportDefinition first = loader.load(REPORT_ID);

        // 2回目ロード（キャッシュ利用でDB呼び出しなし）
        ReportDefinition second = loader.load(REPORT_ID);

        assertThat(second).isSameAs(first);

        // DBアクセスは一度だけ
        verify(reportMasterRepository, times(1)).findByReportId(REPORT_ID);
        verify(reportLayoutRepository, times(1)).findByReportId(REPORT_ID);
    }

    @Test
    void reload_clearsCacheWhenEnabled() {
        when(cacheProperties.isEnabled()).thenReturn(true);

        ReportMaster master = new ReportMaster();
        ReportLayout layout = new ReportLayout();
        when(reportMasterRepository.findByReportId(REPORT_ID)).thenReturn(master);
        when(reportLayoutRepository.findByReportId(REPORT_ID)).thenReturn(List.of(layout));

        // キャッシュ作成
        loader.load(REPORT_ID);
        assertThat(loader.isCacheEnabled()).isTrue();

        // キャッシュを削除
        loader.reload(REPORT_ID);

        // 内部キャッシュが空であることを確認（反射的に確認）
        ConcurrentHashMap<Long, ReportDefinition> cache =
                (ConcurrentHashMap<Long, ReportDefinition>) getField(loader, "cache");

        assertThat(cache.containsKey(REPORT_ID)).isFalse();
    }

    // private フィールドへアクセスするための簡易ヘルパー
    private Object getField(Object target, String name) {
        try {
            var f = target.getClass().getDeclaredField(name);
            f.setAccessible(true);
            return f.get(target);
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }
}
