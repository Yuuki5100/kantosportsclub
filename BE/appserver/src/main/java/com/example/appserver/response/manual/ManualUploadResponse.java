package com.example.appserver.response.manual;

import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class ManualUploadResponse {
    private List<String> docIds;
}
