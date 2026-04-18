package com.example.servercommon.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.LocalDateTime;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "manual")
public class Manual {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", nullable = false)
    private Long id;

    @Column(name = "title", nullable = false, length = 20)
    private String title;

    @Column(name = "general_user_flag")
    private Boolean generalUserFlag;

    @Column(name = "master_admin_flag")
    private Boolean masterAdminFlag;

    @Column(name = "system_configurator_flag")
    private Boolean systemConfiguratorFlag;

    @Column(name = "content", length = 250)
    private String content;

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
