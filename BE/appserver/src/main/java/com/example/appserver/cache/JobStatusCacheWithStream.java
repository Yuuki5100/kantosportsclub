package com.example.appserver.cache;

import java.io.InputStream;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

public class JobStatusCacheWithStream {

    public static class JobStatus {
        private String status;
        private InputStream inputStream;

        public JobStatus(String status, InputStream inputStream) {
            this.status = status;
            this.inputStream = inputStream;
        }

        public String getStatus() {
            return status;
        }

        public InputStream getInputStream() {
            return inputStream;
        }

        public void setStatus(String status) {
            this.status = status;
        }

        public void setInputStream(InputStream inputStream) {
            this.inputStream = inputStream;
        }
    }

    // ジョブごとのステータスを保持するキャッシュ
    private static final Map<String, JobStatus> statusMap = new ConcurrentHashMap<>();

    public static void updateStatus(String jobName, String status, InputStream inputStream) {
        statusMap.put(jobName, new JobStatus(status, inputStream));
    }

    public static JobStatus getStatus(String jobName) {
        return statusMap.get(jobName);
    }

    public static void clearStatus(String jobName) {
        JobStatus jobStatus = statusMap.remove(jobName);
        if (jobStatus != null) {
            try {
                InputStream is = jobStatus.getInputStream();
                if (is != null) {
                    is.close();  // InputStreamを閉じてリソース解放
                }
            } catch (Exception e) {
                // ログなどで例外処理するのが望ましい
                e.printStackTrace();
            }
        }
    }
}
