package com.example.servercommon.responseModel;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class UploadedFileResponse {
    private String fileId;
    private String originalName;
}
