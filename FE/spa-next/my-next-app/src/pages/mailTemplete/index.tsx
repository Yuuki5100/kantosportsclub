// pages/mail-template/index.tsx
import React, { useEffect, useRef, useState } from "react";
import { useMailTemplateList } from "@/api/services/v1/mailTemplateService";
import cacheReloadUtils from "@/utils/cacheReloadUtils";
import { Box, DropBox, Font14, Font16, Font20, TextBox } from "@/components/base";
import ButtonAction from "@/components/base/Button/ButtonAction";
import { updateMailTemplateApi } from "@/api/services/v1/mailTemplateService";
import { useSnackbar } from "@/hooks/useSnackbar";
import { getMessage, MessageCodes } from "@/message";

interface MailTemplate {
  templateName: string;
  locale: string;
  subject: string;
  body: string;
}

const initialMailTemplate: MailTemplate = {
  templateName: '',
  locale: '',
  subject: '',
  body: ''
};

const localeList = ["ja", "en"];

const MailTemplateEditor: React.FC = () => {
  const { showSnackbar } = useSnackbar();
  const [selectedTemplate, setSelectedTemplate] = useState("");
  const [selectedLocale, setSelectedLocale] = useState("ja");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [showPreview, setShowPreview] = useState(false);
  const bodyPreviewRef = useRef<HTMLDivElement>(null);

  const saveTemplate = async () => {
    try {
      await updateMailTemplateApi(selectedTemplate, {
        body,
        locale: selectedLocale,
        subject,
        templateName: selectedTemplate,
      });
      showSnackbar(getMessage(MessageCodes.ACTION_SUCCESS, "保存"), "SUCCESS");
    } catch (error) {
      const errMessage = error instanceof Error ? error.message : getMessage(MessageCodes.ACTION_FAILED, "保存");
      showSnackbar(errMessage, "ERROR");
    }
  };

  const reloadTemplates = () => {
    cacheReloadUtils('mailTemplate');
  };

  const previewTemplate = async () => {
    setShowPreview(true);
    if (bodyPreviewRef.current) {
      const parser = new DOMParser();
      const doc = parser.parseFromString(body, 'text/html');
      const parsedBody = doc.body;
      bodyPreviewRef.current.innerHTML = '';
      Array.from(parsedBody.childNodes).forEach((node) => {
        bodyPreviewRef.current?.appendChild(node.cloneNode(true));
      });
    }
  };

  const handleChange = (e: React.ChangeEvent<{ value: string }>) => {
    const selectedTemplateName = e.target.value;
    setSelectedTemplate(selectedTemplateName);

    if (!MailTemplateResponse?.data) {
      console.warn("メールテンプレートデータが未取得です。");
      return;
    }

    const mailTemplateObj = MailTemplateResponse.data.find(t => t.templateName === selectedTemplateName) ?? initialMailTemplate;
    setSubject(mailTemplateObj.subject ?? "パラメータなし");
    setBody(mailTemplateObj.body ?? "パラメータなし");
    setSelectedLocale(mailTemplateObj.locale ?? "");
  };

  const { data: MailTemplateResponse, isLoading, error } = useMailTemplateList();
  const templateOptions = (MailTemplateResponse?.data ?? []).map((tpl) => ({
    value: tpl.templateName,
    label: tpl.templateName,
  }));
  const localeOptions = localeList.map((loc) => ({
    value: loc,
    label: loc,
  }));

  useEffect(() => {
    const first = MailTemplateResponse?.data?.[0];
    if (first && !selectedTemplate) {
      setSelectedTemplate(first.templateName);
      setSelectedLocale(first.locale);
      setSubject(first.subject);
      setBody(first.body);
    }
  }, [MailTemplateResponse]);

  if (isLoading) return <Box>読み込み中...</Box>;
  if (error) return <Box>{getMessage(MessageCodes.FETCH_FAILED, 'データ')}</Box>;
  if (!MailTemplateResponse?.data?.length) return <Box>テンプレートが存在しません</Box>;

  return (
    <Box
      sx={{
        p: 6,
        maxWidth: '64rem',
        mx: 'auto',
        bgcolor: 'white',
        borderRadius: 2,
        boxShadow: 3,
        display: 'flex',
        flexDirection: 'column',
        gap: 4,
      }}
    >
      <Font20 sx={{ fontSize: 24, fontWeight: 'bold' }}>メールテンプレート編集画面</Font20>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <Box>
          <Font14 sx={{ fontWeight: 600, mb: 1, display: 'block' }}>テンプレート選択:</Font14>
          <DropBox
            name="template-select"
            selectedValue={selectedTemplate}
            options={templateOptions}
            onChange={handleChange}
            customStyle={{ width: '100%' }}
          />
        </Box>

        <Box>
          <Font14 sx={{ fontWeight: 600, mb: 1, display: 'block' }}>ロケール:</Font14>
          <DropBox
            name="locale-select"
            selectedValue={selectedLocale}
            options={localeOptions}
            onChange={(e) => setSelectedLocale(e.target.value)}
            disabled
            customStyle={{ width: '100%' }}
          />
        </Box>
      </Box>

      <Box>
        <Font14 sx={{ fontWeight: 600, mb: 1, display: 'block' }}>件名:</Font14>
        <TextBox name="mailsSubject" value={subject} onChange={(e) => setSubject(e.target.value)} />
      </Box>

      <Box>
        <Font14 sx={{ fontWeight: 600, mb: 1, display: 'block' }}>本文埋め込み:</Font14>
        <TextBox name="mailBody" value={body} onChange={(e) => setBody(e.target.value)} />
      </Box>

      <Box sx={{ display: 'flex', flexDirection: 'row', gap: 2, pt: 2 }}>
        <ButtonAction label="保存" onClick={saveTemplate} />
        <ButtonAction label="キャッシュ再読み込み" onClick={reloadTemplates} />
        <ButtonAction label="プレビュー ▶" onClick={previewTemplate} />
      </Box>

      {showPreview && (
        <Box
          sx={{
            mt: 4,
            border: '1px solid #ccc',
            p: 2,
            bgcolor: '#fafafa',
          }}
        >
          <Font16 sx={{ mb: 1 }}>プレビュー</Font16>
          <Box component="p" sx={{ fontWeight: 600 }}>件名: {subject}</Box>
          <Box>
            <Box sx={{ fontWeight: 600, mb: 1 }}>本文:</Box>
            <Box
              ref={bodyPreviewRef}
              sx={{
                mt: 1,
                p: 2,
                border: '1px dashed #aaa',
                bgcolor: '#fff',
                minHeight: '100px',
              }}
            />
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default MailTemplateEditor;
