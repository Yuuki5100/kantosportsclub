package com.example.servercommon.repository;
import com.example.servercommon.model.ReportMaster;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ReportMasterRepository extends JpaRepository<ReportMaster, Long>  {
     /**
     * 全ての帳票データを取得する
     * @return 帳票データのリスト
     */
    List<ReportMaster> findAll();
    ReportMaster findByReportId(Long reportId);
}