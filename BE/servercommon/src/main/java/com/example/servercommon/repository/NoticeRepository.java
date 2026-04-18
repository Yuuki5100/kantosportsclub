package com.example.servercommon.repository;

import com.example.servercommon.model.Notice;
import java.time.LocalDate;
import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface NoticeRepository extends JpaRepository<Notice, Long> {
    Page<Notice> findByEndDateGreaterThanEqual(LocalDate endDate, Pageable pageable);
    List<Notice> findByEndDateGreaterThanEqual(LocalDate endDate, Sort sort);
}