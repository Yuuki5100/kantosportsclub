package com.example.servercommon.responseModel;

import com.example.servercommon.model.ReportMaster;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ReportResponse {
    private List<ReportMaster>  reportList;
}
