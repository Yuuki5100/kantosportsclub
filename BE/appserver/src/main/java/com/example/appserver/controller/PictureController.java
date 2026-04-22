package com.example.appserver.controller;

import com.example.appserver.security.RequirePermission;
import com.example.servercommon.model.Picture;
import com.example.servercommon.repository.PictureRepository;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/pictures")
public class PictureController {

    private final PictureRepository pictureRepository;

    public PictureController(PictureRepository pictureRepository) {
        this.pictureRepository = pictureRepository;
    }

    @GetMapping
    @RequirePermission(permissionId = 7, statusLevelId = 1) // PICTURE, なし
    public List<Picture> findAll() {
        return pictureRepository.findAll();
    }
}
