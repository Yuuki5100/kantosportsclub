package com.example.appserver.service;

import com.example.servercommon.model.ErrorCodeSettingModel;
import com.example.appserver.cache.ErrorCodeCache;
import com.example.servercommon.model.ErrorCodeId;
import com.example.servercommon.repository.ErrorCodeSettingRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class ErrorCodeSettingService {

    @Autowired
    private ErrorCodeSettingRepository errorCodeRepository;

    @Autowired
    private ErrorCodeCache errorCodeCache;

    /**
     * 全てのエラーコードを取得する
     */
    public List<ErrorCodeSettingModel> findAll() {
        List<ErrorCodeSettingModel> result = errorCodeCache.getCache();
        return result;
    }

    /**
     * エラーコードの新規登録または更新（Insert or Update）
     */
    public ErrorCodeSettingModel saveOrUpdate(ErrorCodeSettingModel errorCode) {
        return errorCodeRepository.save(errorCode);
    }

    /**
     * 特定のエラーコード（code + locale）を更新する
     */
    public Optional<ErrorCodeSettingModel> updateMessage(String code, String locale, String newMessage) {
        ErrorCodeId id = new ErrorCodeId(code, locale);
        Optional<ErrorCodeSettingModel> optional = errorCodeRepository.findById(id);
        if (optional.isPresent()) {
            ErrorCodeSettingModel model = optional.get();
            model.setMessage(newMessage);
            return Optional.of(errorCodeRepository.save(model));
        } else {
            ErrorCodeSettingModel model = new ErrorCodeSettingModel(code, locale, newMessage);
            return Optional.of(errorCodeRepository.save(model));
        }
    }
}
