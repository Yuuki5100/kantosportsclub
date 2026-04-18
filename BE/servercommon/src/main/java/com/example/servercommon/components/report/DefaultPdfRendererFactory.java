package com.example.servercommon.components.report;

import com.example.servercommon.message.BackendMessageCatalog;
import jp.co.systembase.report.renderer.pdf.PdfRenderer;
import org.springframework.stereotype.Component;

import java.io.OutputStream;
import java.io.IOException;

@Component
public class DefaultPdfRendererFactory implements PdfRendererFactory {
    @Override
    public PdfRenderer create(OutputStream out) {
        try {
            return new PdfRenderer(out);
        } catch (IOException e) {
            throw new RuntimeException(BackendMessageCatalog.EX_PDF_RENDERER_INITIALIZATION_FAILED, e);
        }
    }
}
