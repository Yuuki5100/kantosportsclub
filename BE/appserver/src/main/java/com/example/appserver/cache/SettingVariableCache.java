package com.example.appserver.cache;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import com.example.servercommon.config.GenericCache;
import com.example.servercommon.model.SettingModel;
import com.example.servercommon.repository.SettingRepository;

import lombok.AllArgsConstructor;

// キャッシュ取得機能を提供するクラス
// 本来は、別ファイルに外だしして記載すべきだが可読性を上げるため当クラスに記載
@AllArgsConstructor
@Component
public class SettingVariableCache extends GenericCache<SettingModel> {
    @Autowired
    private SettingRepository settingRepository;

    // キャッシュを更新する
    public void updateCache() {
        // DBからデータを全権取得する
        List<SettingModel> settingVariableList = settingRepository.findAll();
        super.reloadCache("settingVariable", settingVariableList);
    }

    // メールテンプレートのキャッシュを取得する
    public List<SettingModel> getCache() {
        // キャストして値を返す
        return (List<SettingModel>)super.getCache("settingVariable");
    }
}
