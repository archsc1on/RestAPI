const isProd = process.env.NODE_ENV === 'production'

export const logger = {
  info: (...args: any[]) => console.log('[INFO]', ...args),
  warn: (...args: any[]) => console.warn('[WARN]', ...args),
  error: (...args: any[]) => console.error('[ERROR]', ...args),
  debug: (...args: any[]) => { if (!isProd) console.debug('[DEBUG]', ...args) },
}

export function logError(error: Error, context?: any) {
  console.error('[ERROR]', error.message, error.stack, context ?? '')
}
