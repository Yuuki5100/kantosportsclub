package com.example.servercommon.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "settings")
@Data
public class SettingModel {

    @Id
    @Column(name = "item", nullable = false)
    private String item;

    @Column(name = "type", nullable = true)
    private String type;

    @Column(name = "val", nullable = true)
    private String val;
}
