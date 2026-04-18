package com.example.servercommon.utils;

import com.example.servercommon.enums.JobType;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.*;

class FileTypeTest {

    @Test
    @DisplayName("✅ .csvファイルはCSVとして判定される（大文字小文字問わず）")
    void isCsv_returnsTrueForCsvFiles() {
        assertThat(FileTypeResolver.isCsv("users.csv")).isTrue();
        assertThat(FileTypeResolver.isCsv("data.CSV")).isTrue(); // ✅ 修正済み
    }

    @Test
    @DisplayName("✅ .xls/.xlsxファイルはExcelとして判定される")
    void isExcel_returnsTrueForExcelFiles() {
        assertThat(FileTypeResolver.isExcel("users.xls")).isTrue();
        assertThat(FileTypeResolver.isExcel("users.xlsx")).isTrue();
    }

    @Test
    @DisplayName("❌ .txtなど未対応の拡張子はExcelでもCSVでもない")
    void isExcelOrCsv_returnsFalseForUnsupportedFiles() {
        assertThat(FileTypeResolver.isCsv("notes.txt")).isFalse();
        assertThat(FileTypeResolver.isExcel("notes.txt")).isFalse();
    }

    @Test
    @DisplayName("✅ CSVまたはExcelファイルの場合は FILE_IMPORT を返す")
    void resolveJobType_returnsFileImportForSupportedTypes() {
        assertThat(FileTypeResolver.resolveJobType("users.csv")).isEqualTo(JobType.FILE_IMPORT);
        assertThat(FileTypeResolver.resolveJobType("data.xlsx")).isEqualTo(JobType.FILE_IMPORT);
    }

    @Test
    @DisplayName("❌ サポートされていない拡張子は例外をスロー")
    void resolveJobType_throwsExceptionForUnsupportedTypes() {
        assertThatThrownBy(() -> FileTypeResolver.resolveJobType("image.png"))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("未対応のファイル形式");
    }

    @Test
    @DisplayName("❌ null や空文字でも false を返す")
    void nullOrEmptyFileName_returnsFalse() {
        assertThat(FileTypeResolver.isCsv(null)).isFalse();
        assertThat(FileTypeResolver.isCsv("")).isFalse();
        assertThat(FileTypeResolver.isExcel(null)).isFalse();
        assertThat(FileTypeResolver.isExcel("")).isFalse();
    }
}
