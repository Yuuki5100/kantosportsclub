package com.example.servercommon.model;

import java.io.Serializable;
import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.IdClass;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * シーケンステーブル用クラス
 */
@Entity
@Table(name = "id_sequence")
@IdClass(IdSequence.IdSequenceKey.class)
@Data
@NoArgsConstructor
@AllArgsConstructor
public class IdSequence {
    @Id
    @Column(name = "id", length = 3, nullable = false)
    private String id;  // id

    @Id
    @Column(name = "date", nullable = false)
    private LocalDateTime date; // 日付

    @Column(name = "current_no", nullable = false)
    private Integer currentNo; // 現在NO

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    /*
     * PK key セット
     */
    public static class IdSequenceKey implements Serializable {
        private String id;
        private LocalDateTime date;
    }

}
