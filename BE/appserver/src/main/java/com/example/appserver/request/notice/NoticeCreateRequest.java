package com.example.appserver.request.notice;

import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.time.LocalDate;
import java.util.List;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class NoticeCreateRequest {

    @NotBlank
    @Size(max = 255)
    private String noticeTitle;

    @NotNull
    @JsonFormat(pattern = "yyyy/MM/dd")
    private LocalDate startDate;

    @NotNull
    @JsonFormat(pattern = "yyyy/MM/dd")
    private LocalDate endDate;

    @Size(max = 250)
    private String contents;

    private List<String> docIds;
}
