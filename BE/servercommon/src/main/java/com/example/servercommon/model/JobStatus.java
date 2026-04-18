package com.example.servercommon.model;

import com.example.servercommon.enums.JobType;
import com.example.servercommon.enums.StatusType;

import jakarta.persistence.*;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Size;
import lombok.*;

import java.time.LocalDateTime;

import org.springframework.format.annotation.DateTimeFormat;

@Entity
@Table(name = "job_status")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class JobStatus {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Size(max = 255)
    @Column(name = "job_name", nullable = true)
    private String jobName;

    // DBにはint（コード）で保存するが、アプリ内ではEnumで扱えるように補助メソッドを用意
    @Max(255)
    @Column(name = "job_type", nullable = true)
    private Integer jobType;

    // ステータス
    // RUNNING / SUCCESS / FAILED（Enumの定数に含まれているかセット時確認）
    @Size(max = 255)
    @Column(name = "status", nullable = true)
    private String status;

    // 処理開始時間
    @DateTimeFormat(pattern = "yyyy/MM/dd HH:mm:ss.SSS")
    @Column(name = "start_time", nullable = true)
    private LocalDateTime startTime;

    // 処理終了時間
    @DateTimeFormat(pattern = "yyyy/MM/dd HH:mm:ss.SSS")
    @Column(name = "end_time", nullable = true)
    private LocalDateTime endTime;

    // メッセージ
    @Size(max = 255)
    @Column(name = "message", nullable = true)
    private String message;

    // ファイル名
    @Size(max = 255)
    @Column(name = "original_file_name") // ← この行を追加
    private String originalFileName;

    // --- Enum対応ヘルパー（アプリ内でEnumで扱いたい場合に使える） ---

    public void setJobTypeEnum(JobType type) {
        this.jobType = (type != null) ? type.getCode() : null;
    }

    public JobType getJobTypeEnum() {
        return (this.jobType != null) ? JobType.fromCode(this.jobType) : null;
    }

    // ステータスがEnum定数に定義されているか確認する。定義されていなければ例外をスローする。
    public void setStatus(String status) {
        this.status = StatusType.fromType(status);
    }
}
