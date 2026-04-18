package com.example.servercommon.repository;

import com.example.servercommon.model.ManualFile;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ManualFileRepository extends JpaRepository<ManualFile, Long> {
    List<ManualFile> findAllByManualIdAndDeletedFlagFalse(Long manualId);
    Optional<ManualFile> findByIdAndDeletedFlagFalse(Long id);
}
