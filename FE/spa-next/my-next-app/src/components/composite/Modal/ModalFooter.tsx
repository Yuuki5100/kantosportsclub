import { Box } from "@/components/base";
import ButtonAction from "@/components/base/Button/ButtonAction";
import { modalBorderColor } from "@/components/color";

type FooterButton = {
  label: string;
  onClick: () => void;
  color?: "primary" | "secondary" | "error" | "success" | "info" | "warning";
};


/**
 * モーダルのフッター部分を表示するコンポーネント
 *
 * @param {{ buttons: FooterButton[] }} { buttons }
 */
export const ModalFooter = ({ buttons }: { buttons: FooterButton[] }) => (
  <Box
    sx={{
      display: "flex",
      flexDirection: "row",
      justifyContent: "space-between",
      padding: "16px",
      borderTop: `1px solid ${modalBorderColor}`,
    }}
  >
    {buttons.map((btn) => (
      <ButtonAction key={btn.label} label={btn.label} onClick={btn.onClick} color={btn.color} />
    ))}
  </Box>
);

export default ModalFooter;
