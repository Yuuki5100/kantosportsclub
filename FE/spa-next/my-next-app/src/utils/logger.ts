// src/utils/logger.ts
import type { Logger as SafeLogger } from "@/types/logger";
import type { TransformableInfo } from "logform";
import winston from "winston";

// 初期は console.error にフォールバック
let logger: SafeLogger = {
  error: (...args: Parameters<typeof console.error>) => console.error(...args),
};

export const initLogger = async () => {
  if (typeof window !== "undefined") return;

  const winstonModule = await import("winston");
  const { default: DailyRotateFile } = await import("winston-daily-rotate-file");
  const { combine, timestamp, printf, errors } = winstonModule.format;

  const logFormat = printf(({ level, message, timestamp, stack }: TransformableInfo) => {
    return `${timestamp} ${level}: ${stack || message}`;
  });

  const transports: winston.transport[] = [
    new DailyRotateFile({
      filename: "logs/error-%DATE%.log",
      datePattern: "YYYY-MM-DD",
      level: "error",
      zippedArchive: true,
      maxSize: process.env.LOG_MAX_SIZE || "20m",
      maxFiles: process.env.LOG_MAX_FILES || "14d",
      frequency: process.env.LOG_ROTATION_FREQUENCY || "1d",
    }),
  ];

  if (process.env.NODE_ENV !== "production") {
    transports.push(
      new winstonModule.transports.Console({
        format: combine(timestamp(), errors({ stack: true }), logFormat),
      })
    );
  }

  const winstonLogger = winstonModule.createLogger({
    level: process.env.LOG_LEVEL || "debug",
    format: combine(timestamp(), errors({ stack: true }), logFormat),
    transports,
  });

  // 再代入OK（let定義）
  logger = {
    error: (...args: Parameters<typeof console.error>) => winstonLogger.error(...args),
  };
};

export const getLogger = (): SafeLogger => logger;

export const logError = (...args: Parameters<typeof console.error>) => {
  getLogger().error(...args);
};
