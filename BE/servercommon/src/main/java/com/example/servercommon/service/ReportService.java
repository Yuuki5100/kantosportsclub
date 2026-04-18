package com.example.servercommon.service;

import com.example.servercommon.impl.ReportServiceImpl.ReportInputStreamProvider;
import com.example.servercommon.model.ReportLayout;
import com.example.servercommon.model.ReportMaster;

import java.io.InputStream;
import java.util.List;

public interface ReportService {
    //  全レポートの取得
    List<ReportMaster> getAllReports();

    // Excel 帳票を作成し、base64でエンコードして返却する
    public String generateReportBase64(Long reportId);

    // Excel 帳票を作成し、S3 にアップロードして、ダウンロード URL として返却する
    public String generateReportDownloadUrl(Long reportId, String fileName);

    // PDF 帳票を作成し、base64でエンコードして返却する
    public String generateReportPDFBase64(Long reportId);

    // PDF 帳票を作成し、S3 にアップロードして、ダウンロード URL として返却する
    public String generateReportPDFDownloadUrl(Long reportId, String fileName);

    // 既存ジョブのファイルから署名付きURLを再生成
    public String generatePresignedUrlByJobName(String exportTarget, String jobName);

    // レポート番号からレイアウト情報を取得する
    public List<ReportLayout> getReportLayoutByReportId(Long reportId);

    // excelをバイナリとして作成する。
    public InputStream generateReportExcel(Long reportId);

    // PDFをバイナリとして作成する。
    public InputStream generateReportPDF(Long reportId);

    // 帳票をバイナリ（byte配列）として生成する汎用メソッド。
    public byte[] generateReportBytes(Long reportId, ReportInputStreamProvider provider, String errorMessage);

    public InputStream generateReportPDF(Long reportId, String fileName, String extension);
}
