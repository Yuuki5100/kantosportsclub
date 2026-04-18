package com.example.servercommon.model;

import java.math.BigDecimal;
import java.sql.Date;

import org.springframework.format.annotation.DateTimeFormat;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Builder
@Entity
@Table(name = "\"order\"") // ← H2用の予約語回避。PostgreSQL/MySQLでも問題なし
@NoArgsConstructor
@AllArgsConstructor
@Data
public class Orders {
    // 注文ID
    @Id
    @Column(name = "order_id")
    private int orderId;

    // 名称
    @Size(max = 255)
    @Column(name = "product_name")
    private String productName;

    // 数量
    @Column(name = "quantity")
    private int quantity;

    // 価格

    @Digits(integer = 10, fraction = 2)
    @Column(name = "price")
    private BigDecimal price;

    // 日付
    @DateTimeFormat(pattern = "yyyy-MM-dd")
    @Column(name = "order_date")
    private Date orderDate;
}
