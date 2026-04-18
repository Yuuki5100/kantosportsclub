package com.example.appserver.config;

import lombok.Getter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

import java.util.List;

@Getter
@Component
@ConfigurationProperties(prefix = "file")
public class FileUploadProperties {

    /**
     * アップロード許可拡張子リスト（例: pdf, xlsx）
     */
    private List<String> allowedExtensions;

    public void setAllowedExtensions(List<String> allowedExtensions) {
        this.allowedExtensions = allowedExtensions.stream()
                .map(ext -> ext.trim().toLowerCase())
                .toList();
    }

    public boolean isExtensionAllowed(String filename) {
        if (filename == null || !filename.contains(".")) return false;
        String ext = filename.substring(filename.lastIndexOf('.') + 1).toLowerCase();
        return allowedExtensions.contains(ext);
    }
}
