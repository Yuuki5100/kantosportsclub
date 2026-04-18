package com.example.servercommon.impl;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.lang.reflect.Field;
import java.net.URL;
import java.util.ArrayList;
import java.util.Base64;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;
import org.springframework.context.ApplicationContext;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Service;

import com.example.servercommon.components.report.ExcelGenerator;
import com.example.servercommon.components.report.PdfGenerator;
import com.example.servercommon.exception.ReportGenerationException;
import com.example.servercommon.file.FileSaver;
import com.example.servercommon.helper.ReportDefinitionLoader;
import com.example.servercommon.message.BackendMessageCatalog;
import com.example.servercommon.mapper.ReportTemplateMapper;
import com.example.servercommon.model.ReportDefinition;
import com.example.servercommon.model.ReportFieldSchema;
import com.example.servercommon.model.ReportLayout;
import com.example.servercommon.model.ReportMaster;
import com.example.servercommon.model.ReportSchema;
import com.example.servercommon.repository.ReportLayoutRepository;
import com.example.servercommon.repository.ReportMasterRepository;
import com.example.servercommon.service.ReportService;
import com.example.servercommon.service.StorageService;
import com.example.servercommon.service.reports.FetchReportDataService;
import com.example.servercommon.service.reports.ReportEntityFetcher;
import com.example.servercommon.utils.FileTypeResolver;
import com.example.servercommon.validationtemplate.reader.GenericEntityReader;

import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@AllArgsConstructor
@Slf4j
public class ReportServiceImpl implements ReportService {

    private final ReportDefinitionLoader reportDefinitionLoader;
    private final StorageService storageService;
    private final ExcelGenerator excelGenerator;
    private final PdfGenerator pdfGenerator;
    private final FileSaver fileSaver;
    private final FetchReportDataService fetchReportDataService;
    private final ReportMasterRepository reportMasterRepository;
    private final ReportLayoutRepository reportLayoutRepository;
    private final List<ReportEntityFetcher> entityFetchers;
    private final GenericEntityReader genericEntityReader;
    private final ApplicationContext applicationContext;
    private final ReportTemplateMapper reportTemplateMapper;

    @Override
    public String generateReportBase64(Long reportId) {
        return generateBase64(reportId, this::generateReportExcel, BackendMessageCatalog.EX_EXCEL_TEMPLATE_FETCH_FAILED);
    }

    @Override
    public String generateReportPDFBase64(Long reportId) {
        return generateBase64(reportId, this::generateReportPDF, BackendMessageCatalog.EX_PDF_TEMPLATE_FETCH_FAILED);
    }

    @Override
    public String generateReportDownloadUrl(Long reportId, String fileName) {
        return generateDownloadUrlCommon(
                reportId,
                fileName,
                "excel",
                "xlsx",
                this::generateReportExcel,
                BackendMessageCatalog.EX_EXCEL_REPORT_UPLOAD_FAILED);
    }

    @Override
    public String generateReportPDFDownloadUrl(Long reportId, String fileName) {
        return generateDownloadUrlCommon(
                reportId,
                fileName,
                "pdf",
                "pdf",
                this::generateReportPDF,
                BackendMessageCatalog.EX_PDF_REPORT_UPLOAD_FAILED);
    }

    @Override
    public String generatePresignedUrlByJobName(String exportTarget, String jobName) {
        String prefix;
        String extension;
        switch (exportTarget) {
            case "excelUrl":
                prefix = "excel";
                extension = "xlsx";
                break;
            case "pdfUrl":
                prefix = "pdf";
                extension = "pdf";
                break;
            case "csvUrl":
                // 現行実装に合わせて PDF 形式で生成しているため、PDF と同じ取り扱いとする
                prefix = "pdf";
                extension = "pdf";
                break;
            default:
                throw new IllegalArgumentException(BackendMessageCatalog.format(
                        BackendMessageCatalog.EX_INVALID_EXPORT_TARGET, exportTarget));
        }

        String objectKey = prefix + "/" + jobName + "." + extension;
        URL presignedUrl = storageService.generatePresignedUrl(objectKey);
        if (presignedUrl == null) {
            throw new RuntimeException(BackendMessageCatalog.EX_PRESIGNED_URL_GENERATION_FAILED);
        }
        return presignedUrl.toString();
    }

    @Override
    public List<ReportMaster> getAllReports() {
        return reportMasterRepository.findAll();
    }

    @Override
    public List<ReportLayout> getReportLayoutByReportId(Long reportId) {
        return reportLayoutRepository.findByReportId(reportId);
    }

    private CommonReportContext generateReportCommon(Long reportId, String expectedType) {
        try {
            ReportDefinition def = reportDefinitionLoader.load(reportId);
            ReportMaster master = def.getReportMaster();

            // Validate template type
            String templateFile = master.getTemplateFile();
            if ("excel".equalsIgnoreCase(expectedType)) {
                if (!FileTypeResolver.isExcel(templateFile)) {
                    String msg = "テンプレートファイルが Excel 形式ではありません: " + templateFile;
                    log.error(msg);
                    throw new ReportGenerationException(msg);
                }
            } else if ("pdf".equalsIgnoreCase(expectedType)) {
                if (!FileTypeResolver.isRRPT(templateFile)) {
                    String msg = "テンプレートファイルが RRPT 形式ではありません: " + templateFile;
                    log.error(msg);
                    throw new ReportGenerationException(msg);
                }
            }

            File file = storageService.getFileByPath(templateFile);
            if (file == null || !file.exists()) {
                String msg = String.format("%sテンプレートファイルが見つかりません: %s", expectedType.toUpperCase(), templateFile);
                log.error(msg);
                throw new ReportGenerationException(msg);
            }

            return new CommonReportContext(file, def.getLayoutList());

        } catch (Exception e) {
            String msg = String.format("帳票ID: %d の%s帳票生成中にエラーが発生しました", reportId, expectedType.toUpperCase());
            log.error(msg, e);
            throw new ReportGenerationException(msg, e);
        }
    }

    private String generateBase64(Long reportId, ReportInputStreamProvider provider, String errorMessage) {
        try (InputStream inputStream = provider.provide(reportId);
                ByteArrayOutputStream outputStream = new ByteArrayOutputStream()) {

            if (inputStream == null) {
                throw new RuntimeException(errorMessage);
            }

            byte[] buffer = new byte[8192];
            int bytesRead;
            while ((bytesRead = inputStream.read(buffer)) != -1) {
                outputStream.write(buffer, 0, bytesRead);
            }

            return Base64.getEncoder().encodeToString(outputStream.toByteArray());

        } catch (IOException e) {
            log.error(BackendMessageCatalog.LOG_BASE64_ENCODING_FAILED, e);
            throw new RuntimeException(BackendMessageCatalog.EX_BASE64_CONVERSION_FAILED, e);
        }
    }

    public byte[] generateReportBytes(Long reportId, ReportInputStreamProvider provider, String errorMessage) {
        try (InputStream inputStream = provider.provide(reportId);
                ByteArrayOutputStream outputStream = new ByteArrayOutputStream()) {

            if (inputStream == null) {
                throw new RuntimeException(errorMessage);
            }

            byte[] buffer = new byte[8192];
            int bytesRead;
            while ((bytesRead = inputStream.read(buffer)) != -1) {
                outputStream.write(buffer, 0, bytesRead);
            }

            return outputStream.toByteArray();

        } catch (IOException e) {
            log.error(BackendMessageCatalog.LOG_BINARY_CONVERSION_FAILED, e);
            throw new RuntimeException(BackendMessageCatalog.EX_REPORT_BINARY_CONVERSION_FAILED, e);
        }
    }

    private String generateDownloadUrlCommon(
            Long reportId,
            String fileName,
            String prefix,
            String extension,
            Function<Long, InputStream> reportGenerator,
            String errorMessage) {
        try (InputStream inputStream = reportGenerator.apply(reportId)) {
            String objectKey = prefix + "/" + fileName + "." + extension;
            fileSaver.save(objectKey, inputStream);
            URL presignedUrl = storageService.generatePresignedUrl(objectKey);
            if (presignedUrl == null) {
                throw new RuntimeException(errorMessage);
            }
            return presignedUrl.toString();
        } catch (IOException | RuntimeException e) {
            log.error(errorMessage, e);
            throw new RuntimeException(errorMessage, e);
        }
    }

    private static class CommonReportContext {
        private final File templateFile;
        private final List<ReportLayout> layout;

        public CommonReportContext(File templateFile, List<ReportLayout> layout) {
            this.templateFile = templateFile;
            this.layout = layout;
        }

        public File getTemplateFile() {
            return templateFile;
        }

        public List<ReportLayout> getLayout() {
            return layout;
        }
    }

    @FunctionalInterface
    public interface ReportInputStreamProvider {
        InputStream provide(Long reportId);
    }

    @Override
    public InputStream generateReportExcel(Long reportId) {
        CommonReportContext context = generateReportCommon(reportId, "excel");

        try {
            ByteArrayOutputStream out = new ByteArrayOutputStream();
            excelGenerator.fillTemplate(context.getTemplateFile(), context.getLayout(), out);
            return new ByteArrayInputStream(out.toByteArray());

        } catch (Exception e) {
            String msg = "帳票ID: " + reportId + "のExcel帳票生成中にエラーが発生しました";
            log.error(msg, e);
            throw new ReportGenerationException(msg, e);
        }
    }

    @Override
    public InputStream generateReportPDF(Long reportId) {
        CommonReportContext context = generateReportCommon(reportId, "pdf");

        try {
            // 対応するフェッチャーを選定
            ReportEntityFetcher fetcher = entityFetchers.stream()
                    .filter(f -> f.supports(reportId))
                    .findFirst()
                    .orElseThrow(() -> new ReportGenerationException(
                            BackendMessageCatalog.EX_REPORT_FETCHER_NOT_DEFINED_SIMPLE));

            // エンティティを取得
            List<?> entities = fetcher.fetchEntities(reportId);

            // Map化して帳票データに変換
            List<Map<String, Object>> fillData = fetchReportDataService.fetchReportData(entities, context.getLayout());

            // PDF生成
            ByteArrayOutputStream out = new ByteArrayOutputStream();
            pdfGenerator.fillTemplate(context.getTemplateFile(), context.getLayout(), fillData, out);
            return new ByteArrayInputStream(out.toByteArray());

        } catch (Exception e) {
            String msg = "帳票ID: " + reportId + "のPDF帳票生成中にエラーが発生しました";
            log.error(msg, e);
            throw new ReportGenerationException(msg, e);
        }
    }

    // 現在、DBのテーブルに存在しているレコードを全取得し、帳票に出力している
    // 単一帳票 or 複数帳票どちらなのかは、RapidReportの「.rrpt」ファイルで制御すること
    @Override
    public InputStream generateReportPDF(Long reportId, String fileName, String extension) {
        try {
            // 1. report_masterからテンプレートファイルパス取得
            ReportMaster reportMaster = reportMasterRepository.findById(reportId)
                    .orElseThrow(() -> new ReportGenerationException(
                            BackendMessageCatalog.format(BackendMessageCatalog.EX_REPORT_RECORD_NOT_FOUND, reportId)));

            String templateFilePath = reportMaster.getTemplateFile();
            validateFilePath(templateFilePath, "テンプレートファイルパスが空です: " + reportId);

            // 2. MinIOからテンプレートファイル取得
            File templateFile = storageService.getFileByPath(templateFilePath);
            validateFileExists(templateFile, "テンプレートPDFファイルが見つかりません: " + templateFilePath);

            // 3. 帳票共通コンテキスト取得
            CommonReportContext context = generateReportCommon(reportId, "pdf");

            // 4. YAMLのテンプレートファイルを取得して、entityとrepositoryを特定する
            ReportSchema reportSchema = reportTemplateMapper.loadReportTemplate(fileName + "_report");
            List<ReportFieldSchema> map = reportSchema.getMappings();
            // repository名ごとにグルーピング
            Map<String, List<ReportFieldSchema>> groupedByRepository = map.stream()
                    .collect(Collectors.groupingBy(ReportFieldSchema::getRepository));

            List<Map<String, Object>> mappedData = new ArrayList<>();

            for (Map.Entry<String, List<ReportFieldSchema>> entry : groupedByRepository.entrySet()) {
                String repositoryName = entry.getKey(); // e.g. "userRepository"
                JpaRepository<?, ?> repository = (JpaRepository<?, ?>) applicationContext.getBean(repositoryName);
                List<Object> results = (List<Object>) genericEntityReader.findAllEntities(repository);
                List<ReportFieldSchema> fields = entry.getValue(); // YAMLで定義されたフィールド

                for (Object entity : results) {
                    Map<String, Object> rowData = new LinkedHashMap<>();

                    for (ReportFieldSchema schema : fields) {
                        String fieldId = schema.getField(); // YAMLのfieldIdをkeyに使う
                        Object value = extractFieldValue(entity, fieldId);
                        rowData.put(fieldId, value);
                    }

                    mappedData.add(rowData);
                }
            }

            // 7. RapidReportを使って帳票を生成
            ByteArrayOutputStream out = new ByteArrayOutputStream();
            pdfGenerator.fillTemplate(context.getTemplateFile(), context.getLayout(), mappedData, out);
            new ByteArrayInputStream(out.toByteArray());
            return new ByteArrayInputStream(out.toByteArray());

        } catch (Exception e) {
            String msg = String.format("帳票ID: %d のPDF帳票生成中にエラーが発生しました", reportId);
            log.error(msg, e);
            throw new ReportGenerationException(msg, e);
        }
    }

    private Object extractFieldValue(Object entity, String fieldName) {
        try {
            Field field = entity.getClass().getDeclaredField(fieldName);
            field.setAccessible(true);
            return field.get(entity);
        } catch (Exception e) {
            log.warn(BackendMessageCatalog.LOG_FIELD_ACCESS_FAILED, entity.getClass().getName(), fieldName,
                    e.getMessage());
            return null;
        }
    }

    private void validateFilePath(String path, String errorMessage) {
        if (path == null || path.isBlank()) {
            throw new ReportGenerationException(errorMessage);
        }
    }

    private void validateFileExists(File file, String errorMessage) {
        if (file == null || !file.exists()) {
            throw new ReportGenerationException(errorMessage);
        }
    }
}
