package com.example.servercommon.components.report;

import jp.co.systembase.report.renderer.pdf.PdfRenderer;
import java.io.OutputStream;

public interface PdfRendererFactory {
    PdfRenderer create(OutputStream out);
}
