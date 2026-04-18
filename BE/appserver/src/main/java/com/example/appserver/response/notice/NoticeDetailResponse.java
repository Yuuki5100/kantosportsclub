package com.example.appserver.response.notice;

import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class NoticeDetailResponse {
    private Long noticeId;

    private String noticeTitle;

    private String startDate;

    private String endDate;

    private String contents;

    private List<String> docIds;

    private String creatorUserName;

    private String createdAt;

    private String editorUserName;

    private String updatedAt;
}
