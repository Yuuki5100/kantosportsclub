package com.example.servercommon.utils;

import com.example.servercommon.enums.JobType;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.*;

class FileTypeResolverTest {

    @Test
    @DisplayName("✅ .csv 拡張子は CSV として認識される")
    void isCsv_shouldReturnTrueForCsvFiles() {
        assertThat(FileTypeResolver.isCsv("data.csv")).isTrue();
    }

    @Test
    @DisplayName("❌ .txt や null は CSV として認識されない")
    void isCsv_shouldReturnFalseForNonCsvFiles() {
        assertThat(FileTypeResolver.isCsv("data.txt")).isFalse();
        assertThat(FileTypeResolver.isCsv(null)).isFalse();
    }

    @Test
    @DisplayName("✅ .xlsx / .xls 拡張子は Excel として認識される")
    void isExcel_shouldReturnTrueForExcelFiles() {
        assertThat(FileTypeResolver.isExcel("book.xlsx")).isTrue();
        assertThat(FileTypeResolver.isExcel("book.xls")).isTrue();
    }

    @Test
    @DisplayName("❌ .csv や null は Excel として認識されない")
    void isExcel_shouldReturnFalseForNonExcelFiles() {
        assertThat(FileTypeResolver.isExcel("data.csv")).isFalse();
        assertThat(FileTypeResolver.isExcel(null)).isFalse();
    }

    @Test
    @DisplayName("✅ .csv や .xlsx ファイルは JobType.FILE_IMPORT を返す")
    void resolveJobType_shouldReturnFileImportForSupportedTypes() {
        assertThat(FileTypeResolver.resolveJobType("users.csv")).isEqualTo(JobType.FILE_IMPORT);
        assertThat(FileTypeResolver.resolveJobType("sheet.xlsx")).isEqualTo(JobType.FILE_IMPORT);
    }

    @Test
    @DisplayName("❌ 未対応の拡張子は例外になる")
    void resolveJobType_shouldThrowForUnsupportedTypes() {
        assertThatThrownBy(() -> FileTypeResolver.resolveJobType("image.png"))
            .isInstanceOf(IllegalArgumentException.class)
            .hasMessageContaining("未対応のファイル形式");

        assertThatThrownBy(() -> FileTypeResolver.resolveJobType(null))
            .isInstanceOf(IllegalArgumentException.class)
            .hasMessageContaining("未対応のファイル形式");
    }

//     @Test
//     @DisplayName("✅ .rrpt は REPORT_EXPORT を返す")
//     void resolveJobType_shouldReturnReportExportForRrpt() {
//     assertThat(FileTypeResolver.resolveJobType("report.rrpt"))
//         .isEqualTo(JobType.REPORT_EXPORT);
//     }
// }
}
