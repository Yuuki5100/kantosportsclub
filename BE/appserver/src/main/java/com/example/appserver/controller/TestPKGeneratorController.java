package com.example.appserver.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.appserver.request.test.TestPKUserRequest;
import com.example.servercommon.model.TestPKUser;
import com.example.servercommon.utils.PrimaryKeyGenerator;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("auth/test-pk")
@RequiredArgsConstructor
public class TestPKGeneratorController {
    @PostMapping
    public ResponseEntity<TestPKUser> create(@RequestBody TestPKUserRequest request) {
        TestPKUser user = new TestPKUser();
        user.setId((String)PrimaryKeyGenerator.generateIfNeeded(String.class));
        user.setName(request.getName());

        return ResponseEntity.ok(user);
    }
}
