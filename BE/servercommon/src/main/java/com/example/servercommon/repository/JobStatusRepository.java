package com.example.servercommon.repository;

import com.example.servercommon.model.JobStatus;

import jakarta.validation.constraints.NotNull;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.Optional;

public interface JobStatusRepository extends JpaRepository<JobStatus, Long> {
    /**
     * ジョブ名から jobName を取得する
     * 
     * @param String jobName ジョブ名
     * @return ジョブが存在すれば Optional でラップされた JobStatus、存在しなければ空の Optional
     */
    Optional<JobStatus> findByJobName(String jobName);

    /**
     * ページ遷移のパラメータから jobName を取得する
     * 
     * @param String prefix 前ページ
     * @param Pageable pageable 次のページ
     * @return ジョブが存在すれば Optional でラップされた JobStatus、存在しなければ空の Optional
     */
    Page<JobStatus> findByJobNameStartingWith(String prefix, Pageable pageable);

    /**
     * ファイル名存在確認
     * 
     * @param originalFileName ファイル名
     * @return ジョブが存在すればtrue、存在しなければfalse
     */
    boolean existsByOriginalFileName(String originalFileName);
}