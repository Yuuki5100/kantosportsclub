package com.example.servercommon.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "status_levels")
public class StatusLevelModel {

    @Id
    @Column(name = "status_level_id", nullable = false)
    private Integer statusLevelId;

    @Column(name = "status_level_name", nullable = false, length = 100)
    private String statusLevelName;
}
