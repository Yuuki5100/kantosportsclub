package com.example.servercommon.repository;

import com.example.servercommon.model.Manual;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface ManualRepository extends JpaRepository<Manual, Long> {

    @Query(
            value = """
                    SELECT m FROM Manual m
                     WHERE (:titleName IS NULL OR m.title LIKE %:titleName%)
                       AND (
                            :target IS NULL
                            OR :target = 0
                            OR (:target = 1 AND m.generalUserFlag = TRUE)
                            OR (:target = 2 AND m.masterAdminFlag = TRUE)
                       )
                       AND (
                            :isdeleted IS NULL
                            OR :isdeleted = 0
                            OR (:isdeleted = 1 AND m.deletedFlag = FALSE)
                            OR (:isdeleted = 2 AND m.deletedFlag = TRUE)
                       )
                    """,
            countQuery = """
                    SELECT COUNT(m) FROM Manual m
                     WHERE (:titleName IS NULL OR m.title LIKE %:titleName%)
                       AND (
                            :target IS NULL
                            OR :target = 0
                            OR (:target = 1 AND m.generalUserFlag = TRUE)
                            OR (:target = 2 AND m.masterAdminFlag = TRUE)
                       )
                       AND (
                            :isdeleted IS NULL
                            OR :isdeleted = 0
                            OR (:isdeleted = 1 AND m.deletedFlag = FALSE)
                            OR (:isdeleted = 2 AND m.deletedFlag = TRUE)
                       )
                    """
    )
    Page<Manual> search(
            @Param("titleName") String titleName,
            @Param("target") Integer target,
            @Param("isdeleted") Integer isdeleted,
            Pageable pageable);
}
