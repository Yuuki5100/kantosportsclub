import CloseIcon from "@mui/icons-material/Close";
import { modalBorderColor, modalCloseIconColor } from "@/components/color";
import { Box, Font20 } from "@/components/base";
import IconButtonBase from "@/components/base/Button/IconButtonBase";

type Props = {
  title: string;
  onClose: () => void;
};


/**
 * モーダルのヘッダー部分を表示するコンポーネント
 *
 * @param {string} title
 * ヘッダーに表示するタイトル
 * @param {string} onClose
 * 閉じるときの処理
 */
const ModalHeader: React.FC<Props> = ({ title, onClose }) => (
  <Box
    sx={{
      display: "flex",
      flexDirection: "row",
      alignItems: "flex-start",
      justifyContent: "space-between",
      padding: "8px 16px",
      borderBottom: `1px solid ${modalBorderColor}`,
    }}
  >
    <Font20
      sx={{
        color: "primary.main",
        marginTop: "4px",
      }}
    >
      {title}
    </Font20>

    <IconButtonBase aria-label="close" onClick={onClose} sx={{ color: modalCloseIconColor }}>
      <CloseIcon />
    </IconButtonBase>
  </Box>
);

export default ModalHeader;
