package com.example.servercommon.components.report;

import com.example.servercommon.message.BackendMessageCatalog;
import com.example.servercommon.model.ReportLayout;
import com.example.servercommon.utils.ReadPDF;
import java.io.File;
import java.io.OutputStream;
import java.util.List;
import java.util.Map;
import jp.co.systembase.report.Report;
import jp.co.systembase.report.ReportPages;
import jp.co.systembase.report.data.ReportDataSource;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;


@Slf4j
@Component
public class PdfGenerator {

        /**
     * テンプレートファイルから PDF 帳票を作成し、出力ストリームに書き込む
     * @param templateFile テンプレートファイル
     * @param layoutData レイアウトデータ(配列)
     * @param fillData 埋め込むデータ(配列)
     * @param OutputStream 出力先ストリーム
     */

    private final ReportFactory reportFactory;
    private final PdfRendererFactory pdfRendererFactory;

    public PdfGenerator(ReportFactory reportFactory, PdfRendererFactory pdfRendererFactory) {
        this.reportFactory = reportFactory;
        this.pdfRendererFactory = pdfRendererFactory;
    }

    public void fillTemplate(File templateFile, List<ReportLayout> layoutData, List<Map<String, Object>> fillData, OutputStream out) {
        try {
            @SuppressWarnings("unchecked")
            Map<String, Object> templateJson = (Map<String, Object>) ReadPDF.readJson(templateFile.getAbsolutePath());

            Report report = reportFactory.create(templateJson);
            report.fill(new ReportDataSource(fillData));
            report.getPages().render(pdfRendererFactory.create(out));
        } catch (Exception e) {
            throw new RuntimeException(BackendMessageCatalog.PDF_GENERATION_FAILED, e);
        }
    }
}
