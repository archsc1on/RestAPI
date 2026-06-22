// src/lib/logger.ts
import winston from 'winston'

const { combine, timestamp, printf, colorize, json } = winston.format

const logFormat = printf(({ level, message, timestamp, ...metadata }) => {
  return `${timestamp} [${level}]: ${message} ${Object.keys(metadata).length ? JSON.stringify(metadata) : ''}`
})

export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: combine(
    timestamp(),
    process.env.NODE_ENV === 'production' ? json() : logFormat
  ),
  transports: [
    new winston.transports.Console({
      format: combine(
        colorize(),
        timestamp(),
        logFormat
      )
    })
  ]
})

export function logError(error: Error, context?: any) {
  logger.error({
    message: error.message,
    stack: error.stack,
    context
  })
}