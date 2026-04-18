package com.example.servercommon.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.servercommon.model.CustomJobInstance;

public interface CustomJobInstanceRepository extends JpaRepository<CustomJobInstance, Long> {
}
