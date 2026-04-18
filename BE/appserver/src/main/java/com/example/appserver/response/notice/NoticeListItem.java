package com.example.appserver.response.notice;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class NoticeListItem {
    private Long noticeId;

    private String noticeTitle;

    private String startDate;

    private String endDate;

    private String creatorUserName;

    private String createdAt;
}
