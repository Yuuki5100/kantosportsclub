// src/components/SnackbarNotification.tsx
import React, { useEffect } from 'react';
import { useSnackbar } from '../../hooks/useSnackbar';
import ReactDOM from 'react-dom';
import CloseIcon from "@mui/icons-material/Close";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ErrorIcon from "@mui/icons-material/Error";
import WarningIcon from "@mui/icons-material/Warning";
import { OverridableComponent } from '@mui/material/OverridableComponent';
import { keyframes, SvgIconTypeMap } from '@mui/material';
import { Box } from '@/components/base';

/** Snackbarの表示時間を設定する */
const notificationTimeout: number = Number(process.env.NEXT_PUBLIC_SNACKBAR_TIMEOUT) || 5000;

/**
 * Snackbarで通知を表示するコンポーネント
 * 呼び出すときは`useSnackbar`の`showSnackbar()`を呼び出し、`message`と`type`を設定する
 * htmlのsnackbar-rootというIDを持つ要素にポータルとして表示される
 *
 * @return {*}
 */
const SnackbarNotification = () => {
  const { message, type, hideSnackbar } = useSnackbar();

  useEffect(() => {
    if (message && type === 'ERROR') {
      console.error('[Snackbar ERROR]', message);
    }
  }, [message, type]);

  useEffect(() => {
    if (type !== 'ERROR') {
      const timer = setTimeout(() => {
        hideSnackbar();
      }, notificationTimeout);
      return () => clearTimeout(timer);
    }
  }, [message, type, hideSnackbar]);

  if (!message) return null;

  const backgroundColor =
    type === 'SUCCESS' ? 'green' :
    type === 'ERROR' ? 'red' : 'orange';

  const IconComponent: OverridableComponent<SvgIconTypeMap<object, "svg">> =
    type === 'SUCCESS' ? CheckCircleIcon :
    type === 'ERROR' ? ErrorIcon : WarningIcon;

  const fadeInDown = keyframes([
    {
      from: {
        opacity: 0,
        transform: "translateY(-20px) translateX(-50%)"
      }
    },
    {
      to: {
        opacity: 1,
        transform: "translateY(0) translateX(-50%)"
      }
    }
  ]);

  const snackbarContent = (
    <Box
      className="snackbar-notification"
      data-testid="snackbar-container"
      sx={{
        backgroundColor,
        color: "white",
        padding: "10px 40px 10px 10px",
        position: "fixed",
        top: "80px", // ← AppBarの下にずらす（64px + 余白）
        left: "50%",
        transform: "translateX(-50%)",
        borderRadius: "4px",
        zIndex: (theme) => theme.zIndex.modal + 100,
        animation: `${fadeInDown} 0.5s ease-out`,
        boxShadow: "0 2px 8px rgba(0, 0, 0, 0.2)",
        display: "flex",
        flexDirection: "row",
        alignItems: "flex-start",
        maxWidth: "90vw",
        overflowWrap: "break-word",
        wordBreak: "break-word",
      }}
    >
      <IconComponent sx={{ marginRight: "10px", fontSize: "24px" }} />
      <span style={{ display: "inline-block", whiteSpace: "pre-wrap" }}>{message}</span>
      <button
        onClick={hideSnackbar}
        style={{
          background: "transparent",
          border: "none",
          color: "white",
          fontWeight: "bold",
          fontSize: "16px",
          cursor: "pointer",
          position: "absolute",
          right: "5px",
          top: "8px",
          paddingTop:'2px',
          display: "flex",
          alignItems: "center",
        }}
      >
        <CloseIcon />
      </button>
    </Box>
  );

  return typeof window !== 'undefined'
    ? ReactDOM.createPortal(snackbarContent, document.getElementById('snackbar-root')!)
    : null;
};

export default SnackbarNotification;
