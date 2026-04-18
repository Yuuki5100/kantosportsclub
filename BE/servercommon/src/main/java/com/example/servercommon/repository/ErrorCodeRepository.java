package com.example.servercommon.repository;

import com.example.servercommon.model.ErrorCode;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ErrorCodeRepository extends JpaRepository<ErrorCode, String> {
    Optional<ErrorCode> findByCodeAndLocale(String code, String locale);
}
