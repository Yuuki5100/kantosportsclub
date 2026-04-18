package com.example.servercommon.repository;

import com.example.servercommon.model.ErrorCodeSettingModel;
import com.example.servercommon.model.ErrorCodeId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ErrorCodeSettingRepository extends JpaRepository<ErrorCodeSettingModel, ErrorCodeId> {
    // 必要に応じてカスタムクエリを定義できます
}
