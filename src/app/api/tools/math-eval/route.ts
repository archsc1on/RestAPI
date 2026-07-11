import { createPlugin } from '@/lib/plugin'

export const GET = createPlugin(
  { name: 'math-eval', endpoint: '/api/tools/math-eval', costCredits: 1 },
  async (req, { searchParams }) => {
    const expression = searchParams.get('expression')

    if (!expression) throw new Error('expression parameter required')

    const sanitized = expression.replace(/[^0-9+\-*/().%\s^]/g, '')
    if (sanitized !== expression.replace(/\s/g, '').replace(/[0-9+\-*/().%\^]/g, '').trim() && /[a-zA-Z]/.test(expression)) {
      throw new Error('Invalid characters in expression')
    }

    try {
      const safeExpr = sanitized.replace(/\^/g, '**')
      const result = new Function(`return (${safeExpr})`)()

      if (typeof result !== 'number' || !isFinite(result)) {
        throw new Error('Invalid result')
      }

      return {
        expression,
        result: Math.round(result * 1000000000) / 1000000000
      }
    } catch {
      throw new Error(`Failed to evaluate: ${expression}`)
    }
  }
)
