package com.example.appserver.service;

import com.example.servercommon.model.MailTemplateEntity;
import com.example.servercommon.repository.MailTemplateRepository;
import com.example.servercommon.responseModel.TemplateSummaryResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class MailTemplateQueryService {

    private final MailTemplateRepository repository;

    @Transactional(readOnly = true)
    public List<TemplateSummaryResponse> getAllSummaries() {
        return repository.findAll().stream()
                .map(e -> new TemplateSummaryResponse(e.getTemplateName(), e.getLocale()))
                .toList();
    }
}
