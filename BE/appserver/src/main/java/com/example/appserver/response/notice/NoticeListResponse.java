package com.example.appserver.response.notice;

import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class NoticeListResponse {
    private List<NoticeListItem> noticeList;
}
