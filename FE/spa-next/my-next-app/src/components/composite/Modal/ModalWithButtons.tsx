import { Modal } from "@/components/base";
import { Box } from "@/components/base";
import ModalHeader from '@/components/composite/Modal/ModalHeader';
import ModalBody from '@/components/composite/Modal/ModalBody';
import ModalFooter from '@/components/composite/Modal/ModalFooter';
import { modalBgColor } from "@/components/color";

type ModalButton = {
  label: string;
  onClick: () => void;
  color?: "primary" | "secondary" | "error" | "success" | "info" | "warning";
};

type Props = {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  buttons?: ModalButton[];
  showCloseButton?: boolean;
  width?: string | number;
  height?: string | number;
};

export const ModalWithButtons: React.FC<Props> = ({
  open,
  onClose,
  title,
  children,
  buttons = [],
  showCloseButton = true,
  width = "600px",
  height = "400px",
}) => {
  // ✅ 「閉じる」ボタン追加時の型エラーを回避
  const allButtons: ModalButton[] = showCloseButton
    ? [...buttons, { label: "閉じる", onClick: onClose, color: "secondary" as const }]
    : buttons;

  return (
    <Modal open={open} onClose={onClose}>
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          bgcolor: modalBgColor,
          boxShadow: 24,
          width,
          height,
          borderRadius: 2,
          display: "flex",
          flexDirection: "column",
        }}
      >
        <ModalHeader title={title} onClose={onClose} />
        <ModalBody>{children}</ModalBody>
        <ModalFooter buttons={allButtons} />
      </Box>
    </Modal>
  );
};

export default ModalWithButtons;
