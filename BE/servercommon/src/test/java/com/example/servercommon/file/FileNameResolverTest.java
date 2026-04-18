package com.example.servercommon.file;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.time.LocalDate;

import static org.assertj.core.api.Assertions.assertThat;

class FileNameResolverTest {

    @Test
    @DisplayName("✅ 通常のファイル名に日付が付加される（拡張子あり）")
    void resolveWithDate_appendsDateWithExtension() {
        String result = FileNameResolver.resolveWithDate("users.csv");
        String today = LocalDate.now().toString().replace("-", "");

        assertThat(result).isEqualTo("users_" + today + ".csv");
    }

    @Test
    @DisplayName("✅ 拡張子なしのファイル名でも日付が付加される")
    void resolveWithDate_appendsDateWithoutExtension() {
        String result = FileNameResolver.resolveWithDate("orders");
        String today = LocalDate.now().toString().replace("-", "");

        assertThat(result).isEqualTo("orders_" + today);
    }

    @Test
    @DisplayName("❌ ファイル名がnullや空文字の場合、unknown_日付.txtになる")
    void resolveWithDate_handlesNullOrBlankFilename() {
        String today = LocalDate.now().toString().replace("-", "");

        assertThat(FileNameResolver.resolveWithDate(null)).isEqualTo("unknown_" + today + ".txt");
        assertThat(FileNameResolver.resolveWithDate("")).isEqualTo("unknown_" + today + ".txt");
        assertThat(FileNameResolver.resolveWithDate("   ")).isEqualTo("unknown_" + today + ".txt");
    }
}
