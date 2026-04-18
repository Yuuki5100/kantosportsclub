package com.example.servercommon.repository;

import com.example.servercommon.model.ReportLayout;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ReportLayoutRepository extends JpaRepository<ReportLayout, Long>  {
    List<ReportLayout> findByReportId(Long reportId);
}