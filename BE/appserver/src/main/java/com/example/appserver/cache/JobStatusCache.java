package com.example.appserver.cache;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

public class JobStatusCache {

    public static class JobStatus {
        private String status;
        private String url;

        public JobStatus(String status, String url) {
            this.status = status;
            this.url = url;
        }

        public String getStatus() { return status; }
        public String getUrl() { return url; }

        public void setStatus(String status) { this.status = status; }
        public void setUrl(String url) { this.url = url; }
    }

    // ジョブごとのステータスを保持するキャッシュ
    private static final Map<String, JobStatus> statusMap = new ConcurrentHashMap<>();

    public static void updateStatus(String jobName, String status, String url) {
        statusMap.put(jobName, new JobStatus(status, url));
    }

    public static JobStatus getStatus(String jobName) {
        return statusMap.get(jobName);
    }

    public static void clearStatus(String jobName) {
        statusMap.remove(jobName);
    }
}
