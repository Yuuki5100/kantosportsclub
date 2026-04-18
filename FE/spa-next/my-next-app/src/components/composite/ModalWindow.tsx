// components/composite/ModalWindows.tsx
import React, { ReactNode } from "react";
import { Modal } from "@/components/base";
import CloseIcon from "@mui/icons-material/Close";
import ButtonAction from "@/components/base/Button/ButtonAction";
import { Box, Font20 } from "@/components/base";
import IconButtonBase from "@/components/base/Button/IconButtonBase";

// 🎨 色の定義をインポート
import {
  modalBgColor,
  modalBorderColor,
  modalCloseIconColor,
} from "../color";

// モーダルのプロパティ定義
type ModalWithButtonsProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  buttons: {
    label: string;
    onClick: () => void;
    color?: "primary" | "secondary" | "error" | "success" | "info" | "warning";
  }[];
  footerChildren?: ReactNode;
  showCloseButton?: boolean;
  width?: string | number;
  height?: string | number;
};


/**
 * モーダルウィンドウコンポーネント
 *
 * @param {*} {
 *   open,
 *   onClose,
 *   title,
 *   children,
 *   buttons,
 *   showCloseButton = true,
 *   width = "600px",
 *   height = "400px",
 * }
 * @return {*}
 */
const ModalWithButtons: React.FC<ModalWithButtonsProps> = ({
  open,
  onClose,
  title,
  children,
  buttons,
  showCloseButton = false,
  width = "600px",
  height = "400px",
  footerChildren
}) => {
  return (
    <Modal
      open={open}
      onClose={onClose}
      slotProps={{
        backdrop: {
          onClick: onClose,
        },
      }}
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        p: 2, // パディングを追加
      }}
    >
      <Box
        sx={{
          bgcolor: modalBgColor,
          boxShadow: 24,
          width: width,
          minHeight: Math.min(parseInt(height?.toString() || "200"), 200), // heightとの最小値を使用、但し200px以下に制限
          maxWidth: "90vw", // ビューポート幅の90%を最大幅に
          maxHeight: "90vh", // ビューポート高さの90%を最大高さに
          borderRadius: 2,
          display: "flex",
          flexDirection: "column",
          overflowY: "auto", // モーダル全体でスクロールを有効に
        }}
      >
        {/* タイトルと × ボタンをモーダルの最上部に配置 */}
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

          <IconButtonBase
            aria-label="close"
            onClick={onClose}
            sx={{
              color: modalCloseIconColor,
            }}
          >
            <CloseIcon />
          </IconButtonBase>
        </Box>

        {/* モーダル本文 */}
        <Box
          sx={{
            padding: "16px",
          }}
        >
          {children}
        </Box>

        {/* ボタン部分 */}
        <Box
          sx={{
            display: "flex",
            flexDirection: "row",
            justifyContent: "space-between",
            padding: "16px",
            borderTop: `1px solid ${modalBorderColor}`,
          }}
        >
          {footerChildren ?? buttons.map((button) => (
            <ButtonAction
              key={button.label}
              label={button.label}
              onClick={button.onClick}
              color={button.color}
            />
          ))}
          {showCloseButton && (
            <ButtonAction label="閉じる" onClick={onClose} color="secondary" />
          )}
        </Box>
      </Box>
    </Modal>
  );
};

export default ModalWithButtons;


// 使用例
// import React, { useState } from "react";
// import ModalWithButtons from "@/components/ModalWithButtons"; // モーダルコンポーネントをインポート
// import { ButtonNext } from "@/components/button"; // ボタンコンポーネントをインポート

// const App: React.FC = () => {
//   const [openModal, setOpenModal] = useState(false);

//   const openModalHandler = () => {
//     setOpenModal(true);
//   };

//   const closeModalHandler = () => {
//     setOpenModal(false);
//   };

//   const handleButtonClick = (label: string) => {
//     console.log(`${label} ボタンがクリックされました`);
//   };

//   return (
//     <div style={{ padding: "20px" }}>
//       {/* モーダルを開くボタン */}
//       <ButtonNext onClick={openModalHandler} />

//       {/* モーダル */}
//       <ModalWithButtons
//         open={openModal}
//         onClose={closeModalHandler}
//         title="モーダルウィンドのタイトル"
//         buttons={[
//           {
//             label: "確認",
//             onClick: () => handleButtonClick("確認"),
//             color: "success",
//           },
//           {
//             label: "戻る",
//             onClick: () => handleButtonClick("戻る"),
//             color: "info",
//           },
//           {
//             label: "拒否",
//             onClick: () => handleButtonClick("拒否"),
//             color: "error",
//           },
//         ]}
//         showCloseButton={true} // 「閉じる」ボタンを表示
//       >
//         <div>この操作を実行しますか？</div>
//       </ModalWithButtons>
//     </div>
//   );
// };

// export default App;
