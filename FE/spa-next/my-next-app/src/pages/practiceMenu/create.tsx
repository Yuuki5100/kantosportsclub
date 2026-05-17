import { useCallback, useState } from "react";
import {
  Box,
  Button,
  Paper,
  Typography,
  IconButton,
  TextField,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import { apiService } from "@/api/apiService";
import { API_ENDPOINTS } from "@/api/apiEndpoints";
import { useSnackbar } from "@/hooks/useSnackbar";
import { getMessage, MessageCodes } from "@/message";
import { useAuth } from "@/hooks/useAuth";

type MenuItem = {
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
      {
        name: inputName.trim(),
        time: "",
      },
    ]);

    setInputName("");
  };

  const removeMenu = (index: number) => {
    setMenu((prev) => prev.filter((_, i) => i !== index));
  };

  const resetMenu = () => {
    setMenu([]);
  };

  const updateTime = (index: number, time: string) => {
    setMenu((prev) =>
      prev.map((item, i) =>
        i === index ? { ...item, time } : item
      )
    );
  };

  const handleSave = useCallback(async () => {
    if (!title.trim() || menu.length === 0 || isSaving) {
      return;
    }

    setIsSaving(true);
    try {
      const details: PracticeMenuDetailCreateRequest[] = menu.map((item, index) => ({
        category: null,
        menuName: item.name,
        menuTime: item.time.trim() ? Number(item.time) : null,
        sortNo: index + 1,
        updater: loginUserName ?? null,
      }));

      const created = await apiService.post<PracticeMenuHeaderCreateResponse>(
        API_ENDPOINTS.PRACTICE_MENU.HEADER_LIST,
        {
          title: title.trim(),
          remarks: remarks.trim() || null,
          updater: loginUserName ?? null,
          details,
        }
      );

      showSnackbar(getMessage(MessageCodes.ACTION_SUCCESS, "練習メニューを追加"), "SUCCESS");
      setMenu([]);
      setInputName("");
      setTitle("");
      setRemarks("");
      void created;
    } catch (error) {
      console.error("Failed to create practice menu header:", error);
      showSnackbar(getMessage(MessageCodes.ACTION_FAILED, "練習メニューの追加"), "ERROR");
    } finally {
      setIsSaving(false);
    }
  }, [isSaving, loginUserName, menu.length, remarks, showSnackbar, title]);

  return (
    <Box sx={{ maxWidth: 420, mx: "auto", p: 2 }}>
      <Typography variant="h6" fontWeight="bold" mb={2}>
        練習メニューを作る
      </Typography>

      <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mb: 3 }}>
        <TextField
          fullWidth
          size="small"
          label="タイトル"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="例：2026年5月の練習メニュー"
          sx={{
            "& .MuiInputBase-input": {
              fontSize: 14,
            },
          }}
        />

        <TextField
          fullWidth
          size="small"
          label="備考"
          value={remarks}
          onChange={(e) => setRemarks(e.target.value)}
          placeholder="例：試合前なのでシュート多め"
          multiline
          minRows={3}
          sx={{
            "& .MuiInputBase-input": {
              fontSize: 14,
            },
          }}
        />
      </Box>

      <Paper
        variant="outlined"
        sx={{
          minHeight: 140,
          p: 2,
          mb: 3,
          borderRadius: 3,
        }}
      >
        <Typography fontWeight="bold" mb={1}>
          今日のメニュー
        </Typography>

        {menu.length === 0 ? (
          <Typography sx={{ fontSize: 14 }} color="text.secondary">
            下の入力欄からメニューを追加してください
          </Typography>
        ) : (
          menu.map((item, index) => (
            <Box
              key={`${item.name}-${index}`}
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                p: 1,
                mb: 1,
                borderRadius: 2,
                bgcolor: "grey.100",
              }}
            >
              <Typography sx={{ fontSize: 14 }}>
                {index + 1}. {item.name}
              </Typography>

              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <TextField
                  size="small"
                  value={item.time}
                  onChange={(e) => updateTime(index, e.target.value)}
                  placeholder="時間"
                  sx={{
                    width: 72,
                    "& .MuiInputBase-input": {
                      fontSize: 14,
                      py: 0.75,
                    },
                  }}
                />

                <Typography sx={{ fontSize: 14 }}>分</Typography>

                <IconButton size="small" onClick={() => removeMenu(index)}>
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Box>
            </Box>
          ))
        )}
      </Paper>

      <Typography fontWeight="bold" mb={1}>
        メニューを追加
      </Typography>

      <Box sx={{ display: "flex", gap: 1, mb: 3 }}>
        <TextField
          fullWidth
          size="small"
          value={inputName}
          onChange={(e) => setInputName(e.target.value)}
          placeholder="例：レイアップシュート"
          sx={{
            "& .MuiInputBase-input": {
              fontSize: 14,
            },
          }}
        />

        <Button
          variant="contained"
          onClick={addMenu}
          disabled={!inputName.trim()}
          sx={{ fontSize: 14, whiteSpace: "nowrap" }}
        >
          追加
        </Button>
      </Box>

      <Box sx={{ display: "flex", gap: 1 }}>
        <Button
          fullWidth
          variant="outlined"
          onClick={resetMenu}
          sx={{ fontSize: 14 }}
        >
          リセット
        </Button>

        <Button
          fullWidth
          variant="contained"
          onClick={handleSave}
          disabled={menu.length === 0 || !title.trim() || isSaving}
          sx={{ fontSize: 14 }}
        >
          追加する
        </Button>
      </Box>
    </Box>
  );
}
