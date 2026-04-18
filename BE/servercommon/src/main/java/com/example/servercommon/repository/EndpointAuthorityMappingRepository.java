package com.example.servercommon.repository;

import com.example.servercommon.model.EndpointAuthorityMapping;
import org.springframework.data.jpa.repository.JpaRepository;

public interface EndpointAuthorityMappingRepository extends JpaRepository<EndpointAuthorityMapping, Long> {
    // findAll(), findById(), save() などは自動で実装される
}
