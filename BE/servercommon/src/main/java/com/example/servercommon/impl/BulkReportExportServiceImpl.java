package com.example.servercommon.impl;

import com.example.servercommon.request.report.BulkExportRequest;
import com.example.servercommon.service.BulkReportExportService;
import com.example.servercommon.components.report.ExcelGenerator;
import com.example.servercommon.components.report.PdfGenerator;
import com.example.servercommon.file.FileSaver;
import com.example.servercommon.helper.ReportDefinitionLoader;
import com.example.servercommon.message.BackendMessageCatalog;
import com.example.servercommon.model.ReportDefinition;
import com.example.servercommon.model.ReportLayout;
import com.example.servercommon.model.ReportMaster;
import com.example.servercommon.service.reports.FetchReportDataService;
import com.example.servercommon.service.reports.ReportEntityFetcher;
import com.example.servercommon.service.StorageService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.pdfbox.multipdf.PDFMergerUtility;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;

import java.io.*;
import java.net.URL;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;

@Service
@RequiredArgsConstructor
@Slf4j
public class BulkReportExportServiceImpl implements BulkReportExportService {

    // 必要なサービス・コンポーネントをDI
    private final ReportDefinitionLoader reportDefinitionLoader;
    private final FetchReportDataService fetchReportDataService;
    private final PdfGenerator pdfGenerator;
    private final ExcelGenerator excelGenerator;
    private final FileSaver fileSaver;
    private final StorageService storageService;
    private final List<ReportEntityFetcher> entityFetchers;

    @Override
    public String exportBulk(BulkExportRequest request) {
        // 出力形式（pdf or excel）と帳票IDリストを取得
        String format = request.getOutputFormat().toLowerCase();
        List<Long> reportIds = request.getReportIds();

        // ファイル名にタイムスタンプを追加
        String fileName = (request.getFileNamePrefix() != null ? request.getFileNamePrefix() : "report")
                + "_" + LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMddHHmmss"));

        try (ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            String objectKey;

            if (format.equals("pdf")) {
                // PDFを結合
                mergePdf(reportIds, out);
                objectKey = "bulk/pdf/" + fileName + ".pdf";
            } else if (format.equals("excel")) {
                // Excelを結合
                mergeExcel(reportIds, out);
                objectKey = "bulk/excel/" + fileName + ".xlsx";
            } else {
                // サポートされない形式の場合は例外
                throw new IllegalArgumentException(BackendMessageCatalog.format(
                        BackendMessageCatalog.EX_INVALID_OUTPUT_FORMAT, format));
            }

            // 結果ファイルを保存し、署名付きURLを返す
            fileSaver.save(objectKey, new ByteArrayInputStream(out.toByteArray()));
            URL url = storageService.generatePresignedUrl(objectKey);
            return url.toString();

        } catch (IllegalArgumentException e) {
            log.warn(BackendMessageCatalog.LOG_BULK_EXPORT_INVALID_FORMAT, e.getMessage(), e);
            throw new RuntimeException(BackendMessageCatalog.format(
                    BackendMessageCatalog.EX_BULK_REPORT_EXPORT_FAILED, e.getMessage()), e);

        } catch (Exception e) {
            log.error(BackendMessageCatalog.LOG_BULK_REPORT_EXPORT_FAILED, e.getMessage(), e);
            throw new RuntimeException(BackendMessageCatalog.format(
                    BackendMessageCatalog.EX_BULK_REPORT_EXPORT_FAILED, e.getMessage()), e);
        }
    }

    // PDF帳票を複数結合
private void mergePdf(List<Long> reportIds, OutputStream out) throws Exception {
    PDFMergerUtility merger = new PDFMergerUtility();
    merger.setDestinationStream(out);

    for (Long id : reportIds) {
        ReportDefinition def = reportDefinitionLoader.load(id);
        ReportMaster master = def.getReportMaster();
        List<ReportLayout> layout = def.getLayoutList();
        File template = storageService.getFileByPath(master.getTemplateFile());

        // ✅ 変更：エンティティ取得 + データ変換
        ReportEntityFetcher fetcher = resolveFetcher(id);
        List<?> entities = fetcher.fetchEntities(id);
        List<Map<String, Object>> data = fetchReportDataService.fetchReportData(entities, layout);

        ByteArrayOutputStream tempOut = new ByteArrayOutputStream();
        pdfGenerator.fillTemplate(template, layout, data, tempOut);
        merger.addSource(new ByteArrayInputStream(tempOut.toByteArray()));
    }

    merger.mergeDocuments(null);
}


    // Excel帳票を複数結合
private void mergeExcel(List<Long> reportIds, OutputStream out) throws Exception {
    try (XSSFWorkbook mergedWorkbook = new XSSFWorkbook()) {
        for (Long id : reportIds) {
            ReportDefinition def = reportDefinitionLoader.load(id);
            ReportMaster master = def.getReportMaster();
            List<ReportLayout> layout = def.getLayoutList();
            File template = storageService.getFileByPath(master.getTemplateFile());
            String sheetName = master.getReportName();

            // ✅ 変更：エンティティ取得 + データ変換
            ReportEntityFetcher fetcher = resolveFetcher(id);
            List<?> entities = fetcher.fetchEntities(id);
            List<Map<String, Object>> data = fetchReportDataService.fetchReportData(entities, layout);

            ByteArrayOutputStream tempOut = new ByteArrayOutputStream();
            excelGenerator.fillTemplate(template, layout, data, tempOut);

            try (InputStream in = new ByteArrayInputStream(tempOut.toByteArray());
                 XSSFWorkbook tempWorkbook = new XSSFWorkbook(in)) {

                Sheet sourceSheet = tempWorkbook.getSheetAt(0);
                Sheet targetSheet = mergedWorkbook.createSheet(sheetName);

                for (int r = 0; r <= sourceSheet.getLastRowNum(); r++) {
                    Row srcRow = sourceSheet.getRow(r);
                    Row tgtRow = targetSheet.createRow(r);
                    if (srcRow != null) {
                        for (int c = 0; c < srcRow.getLastCellNum(); c++) {
                            Cell srcCell = srcRow.getCell(c);
                            if (srcCell != null) {
                                Cell tgtCell = tgtRow.createCell(c);

                                // スタイルコピー
                                CellStyle newStyle = mergedWorkbook.createCellStyle();
                                newStyle.cloneStyleFrom(srcCell.getCellStyle());
                                tgtCell.setCellStyle(newStyle);

                                // 値コピー
                                switch (srcCell.getCellType()) {
                                    case STRING -> tgtCell.setCellValue(srcCell.getStringCellValue());
                                    case NUMERIC -> tgtCell.setCellValue(srcCell.getNumericCellValue());
                                    case BOOLEAN -> tgtCell.setCellValue(srcCell.getBooleanCellValue());
                                    case FORMULA -> tgtCell.setCellFormula(srcCell.getCellFormula());
                                    case BLANK -> tgtCell.setBlank();
                                    default -> tgtCell.setCellValue(srcCell.toString());
                                }
                            }
                        }
                    }
                }
            }
        }
        mergedWorkbook.write(out);
    }
}

private ReportEntityFetcher resolveFetcher(Long reportId) {
    return entityFetchers.stream()
        .filter(f -> f.supports(reportId))
        .findFirst()
        .orElseThrow(() -> new RuntimeException(BackendMessageCatalog.format(
                BackendMessageCatalog.EX_REPORT_FETCHER_NOT_DEFINED, reportId)));
}

}
