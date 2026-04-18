package com.example.servercommon.service;

import java.io.File;
import java.io.InputStream;
import java.net.URL;
import java.util.List;

public interface StorageService {
    public List<File> listInputFiles();
    public File getFileByPath(String filePath);
    public boolean isAlreadyProcessed(File file);
    public void markAsSuccess(File file);
    public void markAsFailed(File file);
    public void upload(String path, InputStream inputStream);
    public URL generatePresignedUrl(String objectKey);
    public void delete(String path);
    public List<String> listByPrefix(String prefix);
}
