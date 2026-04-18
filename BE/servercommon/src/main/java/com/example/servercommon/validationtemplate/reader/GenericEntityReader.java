package com.example.servercommon.validationtemplate.reader;

import lombok.RequiredArgsConstructor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@RequiredArgsConstructor
public class GenericEntityReader {

    public <T> List<T> findAllEntities(JpaRepository<T, ?> repository) {
        return repository.findAll();
    }
}
