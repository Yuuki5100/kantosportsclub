package com.example.appserver.service;

import org.springframework.beans.BeanUtils;
import org.springframework.stereotype.Service;

import com.example.appserver.request.batchresult.SampleJobInstanceRequest;
import com.example.servercommon.model.CustomJobInstance;
import com.example.servercommon.repository.CustomJobInstanceRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class CustomJobInstanceService {
    private final CustomJobInstanceRepository repository;

    public void apply(SampleJobInstanceRequest request) {
        CustomJobInstance entity = new CustomJobInstance();
        BeanUtils.copyProperties(request, entity);
        entity.setJobKey(request.getJobKey());
        repository.save(entity);
    }
}
