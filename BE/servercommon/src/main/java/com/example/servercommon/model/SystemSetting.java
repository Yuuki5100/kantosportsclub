package com.example.servercommon.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.LocalDateTime;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "system_setting")
public class SystemSetting {

    @Id
    @Column(name = "id", length = 45)
    private String id;

    @Column(name = "company_name", length = 20)
    private String companyName;

    @Column(name = "password_validity_days")
    private Integer passwordValidityDays;

    @Column(name = "password_attempt_validity_count")
    private Integer passwordAttemptValidityCount;

    @Column(name = "password_reissue_url_expiration_date")
    private Integer passwordReissueUrlExpiration;

    @Column(name = "number_of_days_available_for_reservation")
    private Integer numberOfDaysAvailableForReservation;

    @Column(name = "number_of_retries")
    private Integer numberOfRetries;

    @Column(name = "number_of_notices")
    private Integer numberOfNotices;

    @Column(name = "creator_user_id", nullable = false, length = 100)
    private String creatorUserId;

    @Column(name = "created_date_and_time", nullable = false)
    private LocalDateTime createdDateTime;

    @Column(name = "updater_user_id", nullable = false, length = 100)
    private String updaterUserId;

    @Column(name = "updated_date_and_time", nullable = false)
    private LocalDateTime updatedDateTime;
}
