package com.example.servercommon.repository;

import java.time.LocalDate;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.example.servercommon.model.IdSequence;

import jakarta.persistence.LockModeType;

public interface IdSequenceRepository extends JpaRepository<IdSequence, Long> {

    /**
     * 対象の行を読み取り時にロックし、他のトランザクションによる読み取り・更新を防止する
     * @param id 識別子
     * @param date 登録する日付
     * @return IdSequence 該当するIDシーケンスレコード
     */
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT s FROM IdSequence s WHERE s.id = :id AND FUNCTION('DATE', s.date) = :date")
    Optional<IdSequence> findByIdAndDateForUpdate(@Param("id") String id,
            @Param("date")  LocalDate date);

}
