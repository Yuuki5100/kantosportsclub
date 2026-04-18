// components/composite/loadingSpinner.tsx
import React from "react";
import { Backdrop, CircularProgress } from "@/components/base";

// 🎨 色設定のみ color.ts から取得
import {
  loadingBackdropColor,
  loadingSpinnerColor,
} from "../color";

type LoadingSpinnerProps = {
  open: boolean;         // ローディングの表示・非表示
  size?: number;         // スピナーのサイズ（任意）
};

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ open, size = 120 }) => {
  return (
    <Backdrop sx={{ color: loadingBackdropColor, zIndex: 1300 }} open={open}>
      <CircularProgress color={loadingSpinnerColor} size={size} />
    </Backdrop>
  );
};

export default LoadingSpinner;



// 使用例
// import React, { useState, useEffect } from "react";
// import ButtonAction from "@/components/base/Button/ButtonAction";
// import BackdropLoading from "../../components/LoadingSpinner";


// const App: React.FC = () => {
//   const [loading, setLoading] = useState(false);

//   const handleLoad = () => {
//     setLoading(true);
//     setTimeout(() => setLoading(false), 3000);
//   };

//   return (
//     <div>
//       <ButtonAction label="ローディング開始" onClick={handleLoad} />
//       <BackdropLoading open={loading} />
//     </div>
//   );
// };

// export default App;
