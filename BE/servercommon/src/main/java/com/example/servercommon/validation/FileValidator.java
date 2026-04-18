package com.example.servercommon.validation;

import java.io.InputStream;
import java.util.List;

/**
 * 汎用的なファイルバリデーションインターフェース。
 * T は1行分のデータ型を示す。
 */
public interface FileValidator<T> {
    List<ValidationResult<T>> validate(InputStream inputStream);
}
