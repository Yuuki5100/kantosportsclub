// src/components/ErrorNotification.tsx
import React, { useEffect } from "react";
import { useError } from "@/hooks/useError";

const ErrorNotification = () => {
  const { errorMessage, clearError } = useError();
  const notificationTimeout = Number(process.env.NEXT_PUBLIC_ERROR_NOTIFICATION_TIMEOUT) || 5000;

  useEffect(() => {
    if (errorMessage) {
      const timer = setTimeout(() => {
        clearError();
      }, notificationTimeout);
      return () => clearTimeout(timer);
    }
  }, [errorMessage, clearError, notificationTimeout]);

  if (!errorMessage) return null;

  return (
    <div className="error-notification">
      <span>{errorMessage}</span>
      <button onClick={clearError}>×</button>
      <style jsx>{`
        .error-notification {
          background-color: red;
          color: white;
          padding: 10px 40px 10px 10px;
          position: fixed;
          top: 20px;
          left: 50%;
          transform: translateX(-50%);
          border-radius: 4px;
          z-index: 1000;
          animation: fadeInDown 0.5s ease-out;
        }
        .error-notification button {
          background: transparent;
          border: none;
          color: white;
          font-weight: bold;
          font-size: 16px;
          cursor: pointer;
          position: absolute;
          top: 5px;
          right: 5px;
        }
        @keyframes fadeInDown {
          from {
            opacity: 0;
            transform: translateY(-20px) translateX(-50%);
          }
          to {
            opacity: 1;
            transform: translateY(0) translateX(-50%);
          }
        }
      `}</style>
    </div>
  );
};

export default ErrorNotification;
