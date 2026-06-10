// ============================================================================
// server/src/utils/logger.ts
// Lightweight structured logger.
// Prefixes messages with timestamps and log levels for easy debugging.
// ============================================================================

type LogLevel = 'INFO' | 'WARN' | 'ERROR' | 'DEBUG';

function formatTimestamp(): string {
  return new Date().toISOString();
}

function log(level: LogLevel, message: string, data?: Record<string, unknown>): void {
  const timestamp = formatTimestamp();
  const prefix = `[${timestamp}] [${level}]`;

  if (data) {
    console.log(`${prefix} ${message}`, JSON.stringify(data, null, 0));
  } else {
    console.log(`${prefix} ${message}`);
  }
}

export const logger = {
  info: (message: string, data?: Record<string, unknown>) => log('INFO', message, data),
  warn: (message: string, data?: Record<string, unknown>) => log('WARN', message, data),
  error: (message: string, data?: Record<string, unknown>) => log('ERROR', message, data),
  debug: (message: string, data?: Record<string, unknown>) => log('DEBUG', message, data),
};
