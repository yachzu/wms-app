import { Injectable, LoggerService } from '@nestjs/common';
import * as winston from 'winston';

/**
 * CUSTOM LOGGER SERVICE
 * Winston-based logger untuk production-grade logging
 *
 * Features:
 * - Structured JSON logging
 * - Multiple log levels
 * - File rotation support
 * - Console output untuk development
 */
@Injectable()
export class CustomLogger implements LoggerService {
  private logger: winston.Logger;

  constructor() {
    // Configure Winston logger
    this.logger = winston.createLogger({
      level: process.env.LOG_LEVEL || 'info',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.errors({ stack: true }),
        winston.format.json(),
      ),
      defaultMeta: { service: 'wms-api' },
      transports: [
        // Console output untuk development
        new winston.transports.Console({
          format: winston.format.combine(
            winston.format.colorize(),
            winston.format.simple(),
          ),
        }),
        // File output untuk production
        new winston.transports.File({
          filename: 'logs/error.log',
          level: 'error',
        }),
        new winston.transports.File({
          filename: 'logs/combined.log',
        }),
      ],
    });
  }

  /**
   * Log informational messages
   */
  log(message: string, context?: string) {
    this.logger.info(message, { context });
  }

  /**
   * Log error messages
   */
  error(message: string, trace?: string, context?: string) {
    this.logger.error(message, { trace, context });
  }

  /**
   * Log warning messages
   */
  warn(message: string, context?: string) {
    this.logger.warn(message, { context });
  }

  /**
   * Log debug messages
   */
  debug(message: string, context?: string) {
    this.logger.debug(message, { context });
  }

  /**
   * Log verbose messages
   */
  verbose(message: string, context?: string) {
    this.logger.verbose(message, { context });
  }
}
