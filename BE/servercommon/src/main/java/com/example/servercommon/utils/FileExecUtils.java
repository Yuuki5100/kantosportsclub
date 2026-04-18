package com.example.servercommon.utils;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Map;
import java.util.function.Function;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

public class FileExecUtils {

    // スレッドセーフな共通インスタンス
    private static final PasswordEncoder encoder = new BCryptPasswordEncoder();
    private static final DateTimeFormatter DATE_TIME_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

    // 空行であるかを判断する（現行の設計だとこの仕様で動作する）
    public static boolean fileEmptyRowsSkip(Map<String, String> row) {
        // 取得したファイルの1行（すべてのデータ）が空行だったらInsert/Updateをスキップする
        if (row.values().stream().allMatch(v -> v.equals(""))) {
            return true;
        }
        return false;
    }


    // 実際の変換処理
    private static final Map<String, Function<Object, Object>> converters = Map.of(
        "password", val -> (val instanceof String) ? encoder.encode((String) val) : val,
        "starttime", val -> {
            if (val instanceof LocalDateTime) {
                return ((LocalDateTime) val).format(DATE_TIME_FORMATTER);
            }
            // LocalDateTimeでなければ元の値をそのまま返す
            return val;
        }
        // 他のカラム名と関数を必要に応じて追加可能
    );

    // 特別な入力加工が必要なカラムの値変換
    /**
     * パスワードをBCryptでエンコードします。
     *
     * @param columName カラム名
     * @param value パラメータ
     * @return 入力加工された値
     */
    public static Object valueConverter(String columnName, Object value) {
        Function<Object, Object> converter = converters.get(columnName);
        if (converter != null) {
            return converter.apply(value);
        }
        return value;
    }
}
