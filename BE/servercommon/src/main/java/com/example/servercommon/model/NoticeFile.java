package com.example.servercommon.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "notice_file")
public class NoticeFile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", nullable = false)
    private Long id;

    @Column(name = "notice_id", nullable = false)
    private Long noticeId;

    @Column(name = "file_name", length = 255)
    private String fileName;

    @Column(name = "destination_url", length = 500)
    private String destinationUrl;

    @Column(name = "file_size", precision = 10, scale = 3)
    private BigDecimal fileSize;

    @Column(name = "file_format", length = 20)
    private String fileFormat;

    @Column(name = "deleted_flag", nullable = false)
    private Boolean deletedFlag;

    @Column(name = "creator_user_id", nullable = false, length = 100)
    private String creatorUserId;

    @Column(name = "created_date_and_time", nullable = false)
    private LocalDateTime createdDateTime;

    @Column(name = "updater_user_id", nullable = false, length = 100)
    private String updaterUserId;

    @Column(name = "updated_date_and_time", nullable = false)
    private LocalDateTime updatedDateTime;
}
