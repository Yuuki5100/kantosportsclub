package com.example.servercommon.validationtemplate.reader;

import java.io.InputStream;
import java.util.List;
import java.util.Map;

/**
 * ファイルから行単位のレコードを読み取る汎用インターフェース。
 * 出力は List<Map<String, String>> 形式でヘッダ名をキーとする。
 */
public interface FileRecordReader {
    List<Map<String, String>> read(InputStream inputStream);
}
