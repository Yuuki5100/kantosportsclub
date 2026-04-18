package com.example.servercommon.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "user_detail")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserDetail {

    @Id
    @Column(name = "user_id")
    private Long userId;

    @Column(name = "phone_number")
    private String phoneNumber;

    @Column(name = "kana_name")
    private String kanaName;

    @Column(name = "address")
    private String address;
}
