package com.example.servercommon.repository;

import com.example.servercommon.model.NoticeFile;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface NoticeFileRepository extends JpaRepository<NoticeFile, Long> {
    List<NoticeFile> findAllByNoticeIdAndDeletedFlagFalse(Long noticeId);
    Optional<NoticeFile> findByIdAndDeletedFlagFalse(Long id);
}
