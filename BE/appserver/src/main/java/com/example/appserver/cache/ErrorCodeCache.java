package com.example.appserver.cache;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import com.example.servercommon.config.GenericCache;
import com.example.servercommon.model.ErrorCodeSettingModel;
import com.example.servercommon.repository.ErrorCodeSettingRepository;

import lombok.AllArgsConstructor;

// キャッシュ取得機能を提供するクラス
// 本来は、別ファイルに外だしして記載すべきだが可読性を上げるため当クラスに記載
@AllArgsConstructor
@Component
public class ErrorCodeCache extends GenericCache<ErrorCodeSettingModel> {
    @Autowired
    private ErrorCodeSettingRepository errorCodeSettingRepository;

    // キャッシュを更新する
    public void updateCache() {
        // DBからデータを全権取得する
        List<ErrorCodeSettingModel> errorCodeList = errorCodeSettingRepository.findAll();
        super.reloadCache("errorCodes", errorCodeList);
    }

    // メールテンプレートのキャッシュを取得する
    public List<ErrorCodeSettingModel> getCache() {
        // キャストして値を返す
        return (List<ErrorCodeSettingModel>)super.getCache("errorCodes");
    }
}
