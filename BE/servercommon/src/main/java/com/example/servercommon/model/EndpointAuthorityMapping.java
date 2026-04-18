package com.example.servercommon.model;

import java.time.LocalDateTime;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Entity
@Table(name = "endpoint_authority_mapping")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class EndpointAuthorityMapping {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String url;

    @Column(nullable = false, length = 6)
    private String method;

    @Column(nullable = false)
    private Long menuFunctionId;

    // --- 今はまだDBに持たない拡張用権限レベル ---
    // @Transient
    @Column(nullable = false, length = 2)
    private Integer requiredLevel;

      @Column(
            name = "updated_at",
            nullable = false,
            insertable = false,
            updatable = false,
            columnDefinition = "TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP"
    )
    private LocalDateTime updatedAt;

    @Column(
            name = "created_at",
            nullable = false,
            insertable = false,
            updatable = false,
            columnDefinition = "TIMESTAMP DEFAULT CURRENT_TIMESTAMP"
    )
    private LocalDateTime createdAt;



    // ✅ テストや補助用に必要な4引数のコンストラクタ
    public EndpointAuthorityMapping(Long id, String url, String method, Long menuFunctionId) {
        this.id = id;
        this.url = url;
        this.method = method;
        this.menuFunctionId = menuFunctionId;
    }
}


