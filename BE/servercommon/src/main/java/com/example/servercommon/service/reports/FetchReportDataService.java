package com.example.servercommon.service.reports;

import com.example.servercommon.model.ReportLayout;
import org.apache.commons.beanutils.PropertyUtils;
import org.springframework.stereotype.Service;

import java.util.*;

/**
 * エンティティから帳票データを構築するサービス。
 */
@Service
public class FetchReportDataService {

    /**
     * デフォルトコンストラクタ（テスト用途含む）
     */
    public FetchReportDataService() {
        // 明示的に何も初期化不要
    }

    /**
     * エンティティリストと帳票レイアウトに基づき、帳票埋め込み用のデータを生成する。
     *
     * @param entities エンティティのリスト（例：List<Order>）
     * @param layouts  帳票レイアウト（表示したいプロパティパス等）
     * @return List<Map<String, Object>> 形式の帳票データ
     */
public List<Map<String, Object>> fetchReportData(List<?> entities, List<ReportLayout> layouts) {
    List<Map<String, Object>> result = new ArrayList<>();

    for (Object entity : entities) {
        Map<String, Object> row = new LinkedHashMap<>();

        for (ReportLayout layout : layouts) {
            String propertyPath = layout.getPropertyPath();
            String displayKey = layout.getDisplayLabel() != null ? layout.getDisplayLabel() : propertyPath;

            try {
                Object value = PropertyUtils.getProperty(entity, propertyPath);
                row.put(displayKey, value);
            } catch (Exception e) {
                row.put(displayKey, null);
            }
        }

        result.add(row);
    }

    return result;
}

}
