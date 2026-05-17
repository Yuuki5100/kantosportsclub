import { useCallback, useState } from "react";
import { Box, Button, Paper, Typography, TextField } from "@mui/material";
import { apiService } from "@/api/apiService";
import { API_ENDPOINTS } from "@/api/apiEndpoints";
import { useSnackbar } from "@/hooks/useSnackbar";
import { getMessage, MessageCodes } from "@/message";
import { useAuth } from "@/hooks/useAuth";
import { PracticeMenuSortableList, type PracticeMenuRowItem } from "@/components/practiceMenu/PracticeMenuSortableList";

type MenuItem = {
  id: string;
  name: string;
  time: string;
};

type PracticeMenuHeaderCreateResponse = {
  id: number;
  title: string | null;
  remarks: string | null;
  updater: string | null;
  created_at: string;
  updated_at: string;
};

type PracticeMenuDetailCreateRequest = {
  category: string | null;
  menuName: string;
  menuTime: number | null;
  sortNo: number;
  updater: string | null;
};

export default function PracticeMenuBuilder() {
  const { showSnackbar } = useSnackbar();
  const { name: loginUserName } = useAuth();
  const [menu, setMenu] = useState<MenuItem[]>([]);
  const [inputName, setInputName] = useState("");
  const [title, setTitle] = useState("");
  const [remarks, setRemarks] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const addMenu = () => {
    if (!inputName.trim()) return;
    setMenu((prev) => [
      ...prev,
      { id: `new-${Date.now()}-${prev.length}`, name: inputName.trim(), time: "" },
    ]);
    setInputName("");
  };

  const removeMenu = (index: number) => setMenu((prev) => prev.filter((_, i) => i !== index));

  const updateTime = (index: number, time: string) => {
    setMenu((prev) => prev.map((item, i) => (i === index ? { ...item, time } : item)));
  };

  const handleSave = useCallback(async () => {
    if (!title.trim() || menu.length === 0 || isSaving) return;

    setIsSaving(true);
    try {
      const details: PracticeMenuDetailCreateRequest[] = menu.map((item, index) => ({
        category: null,
        menuName: item.name.trim(),
        menuTime: item.time.trim() ? Number(item.time) : null,
        sortNo: index + 1,
        updater: loginUserName ?? null,
      }));

      await apiService.post<PracticeMenuHeaderCreateResponse>(API_ENDPOINTS.PRACTICE_MENU.HEADER_LIST, {
        title: title.trim(),
        remarks: remarks.trim() || null,
        updater: loginUserName ?? null,
        details,
      });

      showSnackbar(getMessage(MessageCodes.ACTION_SUCCESS, "練習メニューを追加"), "SUCCESS");
      setMenu([]);
      setInputName("");
      setTitle("");
      setRemarks("");
    } catch (error) {
      console.error("Failed to create practice menu header:", error);
      showSnackbar(getMessage(MessageCodes.ACTION_FAILED, "練習メニューの追加"), "ERROR");
    } finally {
      setIsSaving(false);
    }
  }, [isSaving, loginUserName, menu, remarks, showSnackbar, title]);

  return (
    <Box sx={{ maxWidth: 420, mx: "auto", p: 2 }}>
      <Typography variant="h6" fontWeight="bold" mb={2}>
        練習メニューを作る
      </Typography>

      <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mb: 3 }}>
        <TextField fullWidth size="small" label="タイトル" value={title} onChange={(e) => setTitle(e.target.value)} />
        <TextField fullWidth size="small" label="備考" value={remarks} onChange={(e) => setRemarks(e.target.value)} multiline minRows={3} />
      </Box>

      <Paper variant="outlined" sx={{ minHeight: 140, p: 2, mb: 3, borderRadius: 3 }}>
        <Typography fontWeight="bold" mb={1}>
          今日のメニュー
        </Typography>
        <PracticeMenuSortableList
          items={menu as PracticeMenuRowItem[]}
          onChange={(nextItems) => setMenu(nextItems)}
          onRemove={removeMenu}
          onNameChange={(index, value) =>
            setMenu((prev) => prev.map((item, i) => (i === index ? { ...item, name: value } : item)))
          }
          onTimeChange={updateTime}
          emptyMessage="下の入力欄からメニューを追加してください"
        />
      </Paper>

      <Typography fontWeight="bold" mb={1}>メニューを追加</Typography>
      <Box sx={{ display: "flex", gap: 1, mb: 3 }}>
        <TextField fullWidth size="small" value={inputName} onChange={(e) => setInputName(e.target.value)} placeholder="例：レイアップシュート" />
        <Button variant="contained" onClick={addMenu} disabled={!inputName.trim()} sx={{ fontSize: 14, whiteSpace: "nowrap" }}>
          追加
        </Button>
      </Box>

      <Box sx={{ display: "flex", gap: 1 }}>
        <Button fullWidth variant="outlined" onClick={() => setMenu([])} sx={{ fontSize: 14 }}>
          リセット
        </Button>
        <Button fullWidth variant="contained" onClick={() => void handleSave()} disabled={menu.length === 0 || !title.trim() || isSaving} sx={{ fontSize: 14 }}>
          追加する
        </Button>
      </Box>
    </Box>
  );
}
