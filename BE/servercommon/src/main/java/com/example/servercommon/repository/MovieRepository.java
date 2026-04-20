package com.example.servercommon.repository;


import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.servercommon.model.Movie;

@Repository
public interface MovieRepository extends JpaRepository<Movie, Integer> {

    List<Movie> findByTitleContainingIgnoreCase(String title);

    List<Movie> findByDescriptionContainingIgnoreCase(String description);

    List<Movie> findByLocationId(String locationId);

    List<Movie> findByUrlContaining(String url);

    List<Movie> findByCreatedAtBetween(LocalDateTime start, LocalDateTime end);

    List<Movie> findByUpdatedAtBetween(LocalDateTime start, LocalDateTime end);

    List<Movie> findByTitleContainingIgnoreCaseAndLocationId(String title, String locationId);
}
