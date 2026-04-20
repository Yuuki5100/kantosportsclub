package com.example.servercommon.repository;

import com.example.servercommon.model.Picture;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface PictureRepository extends JpaRepository<Picture, Integer> {

    List<Picture> findByTitleContainingIgnoreCase(String title);

    List<Picture> findByDescriptionContainingIgnoreCase(String description);

    List<Picture> findByLocationId(String locationId);

    List<Picture> findByCreatedAtBetween(LocalDateTime start, LocalDateTime end);

    List<Picture> findByUpdatedAtBetween(LocalDateTime start, LocalDateTime end);

    List<Picture> findByTitleContainingIgnoreCaseAndLocationId(String title, String locationId);
}
