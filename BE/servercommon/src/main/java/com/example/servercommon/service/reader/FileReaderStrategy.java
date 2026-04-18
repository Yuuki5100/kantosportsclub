package com.example.servercommon.service.reader;

import com.example.servercommon.model.UserModel;

import java.io.IOException;
import java.io.InputStream;
import java.util.List;

public interface FileReaderStrategy {
    List<UserModel> read(InputStream inputStream) throws IOException;
}
