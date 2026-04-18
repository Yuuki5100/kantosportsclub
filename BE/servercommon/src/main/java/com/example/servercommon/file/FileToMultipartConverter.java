package com.example.servercommon.file;

import org.springframework.web.multipart.MultipartFile;

import java.io.*;

public class FileToMultipartConverter {

    /**
     * File から MultipartFile を生成（MockMultipartFile を使わず）
     *
     * @param file 変換する File
     * @return MultipartFile の独自実装
     */
    public static MultipartFile convert(File file) {
        return new MultipartFileAdapter(file);
    }

    // 独自 MultipartFile 実装クラス
    private static class MultipartFileAdapter implements MultipartFile {

        private final File file;

        public MultipartFileAdapter(File file) {
            this.file = file;
        }

        @Override
        public String getName() {
            return file.getName();
        }

        @Override
        public String getOriginalFilename() {
            return file.getName();
        }

        @Override
        public String getContentType() {
            return "application/octet-stream"; // 必要に応じて判定ロジック追加可
        }

        @Override
        public boolean isEmpty() {
            return file.length() == 0;
        }

        @Override
        public long getSize() {
            return file.length();
        }

        @Override
        public byte[] getBytes() throws IOException {
            try (InputStream is = new FileInputStream(file)) {
                return is.readAllBytes();
            }
        }

        @Override
        public InputStream getInputStream() throws IOException {
            return new FileInputStream(file);
        }

        @Override
        public void transferTo(File dest) throws IOException, IllegalStateException {
            try (InputStream is = getInputStream(); OutputStream os = new FileOutputStream(dest)) {
                is.transferTo(os);
            }
        }
    }
}
