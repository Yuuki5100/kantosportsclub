package com.example.appserver.controller;

import com.example.appserver.security.RequirePermission;
import com.example.servercommon.model.Movie;
import com.example.servercommon.repository.MovieRepository;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/movies")
public class MovieController {

    private final MovieRepository movieRepository;

    public MovieController(MovieRepository movieRepository) {
        this.movieRepository = movieRepository;
    }

    @GetMapping
    @RequirePermission(permissionId = 6, statusLevelId = 1) // MOVIE, なし
    public List<Movie> findAll() {
        return movieRepository.findAll();
    }
}
