package com.example.servercommon.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.IdClass;
import jakarta.persistence.Table;
import jakarta.validation.constraints.Max;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@IdClass(ErrorCodeId.class)
@Table(name = "error_codes")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ErrorCode {

    @Id
    @Max(255)
    private String code;

    @Id
    @Max(255)
    @Column(name = "locale", nullable = true)
    private String locale;

    @Max(255)
    @Column(name = "message", nullable = true)
    private String message;
}

