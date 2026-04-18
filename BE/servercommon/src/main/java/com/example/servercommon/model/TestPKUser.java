package com.example.servercommon.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Data;

@Entity
@Table(name = "test_pk_user")
@Data
public class TestPKUser {
    @Id
    private String id;

    @Column(name = "name", nullable = true)
    private String name;
}
