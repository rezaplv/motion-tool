import type { LogLevel, SystemLog } from "../types";

let counter = 0;

export function createLog(level: LogLevel, message: string): SystemLog {
  counter += 1;
  return {
    id: `log_${Date.now()}_${counter}`,
    timestamp: Date.now(),
    level,
    message,
  };
}
