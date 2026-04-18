package com.example.servercommon.validation;

import com.example.servercommon.file.FileType;

import lombok.AllArgsConstructor;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.ApplicationContext;
import org.springframework.stereotype.Component;

import java.io.InputStream;
import java.util.List;

/**
 * ファイル名に応じて適切な FileValidator を呼び出すディスパッチャー。
 */
@Component
@AllArgsConstructor
public class FileValidatorDispatcher {

    @Autowired
    private final ApplicationContext applicationContext;

    public List<ValidationResult<?>> validate(String filename, InputStream inputStream) {
        FileType fileType = FileType.fromFilename(filename);

        @SuppressWarnings("unchecked")
        FileValidator<Object> validator = (FileValidator<Object>) applicationContext.getBean(
                fileType.getValidatorBeanName(),
                FileValidator.class);

        List<ValidationResult<Object>> result = validator.validate(inputStream);
        return (List<ValidationResult<?>>) (List<?>) result;
    }
}
