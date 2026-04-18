package com.example.servercommon.model;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.IdClass;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "error_codes")
@IdClass(ErrorCodeId.class)
@Data
public class ErrorCodeSettingModel {

    @Id
    private String code;
    private String locale;
    private String message;

}
