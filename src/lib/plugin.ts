// src/lib/plugin.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from './prisma'
import { getApiKeyRecord, checkRateLimit, updateKeyStats, deductCredits, hasEnoughCredits } from './api-key'

export interface PluginConfig {
  name: string
  endpoint: string
  costCredits?: number
}

export interface PluginContext {
  keyRecord: NonNullable<Awaited<ReturnType<typeof getApiKeyRecord>>>
  searchParams: URLSearchParams
}

type PluginHandler = (
  req: NextRequest,
  ctx: PluginContext
) => Promise<Record<string, any>>

export function createPlugin(config: PluginConfig, handler: PluginHandler) {
  const cost = config.costCredits || 1

  return async function GET(request: NextRequest) {
    try {
      const apiKey = request.headers.get('x-api-key')
      if (!apiKey) {
        return NextResponse.json({ status: false, message: 'API key required' }, { status: 401 })
      }

      const keyRecord = await getApiKeyRecord(apiKey)
      if (!keyRecord) {
        return NextResponse.json({ status: false, message: 'Invalid API key' }, { status: 401 })
      }

      const withinLimit = await checkRateLimit(keyRecord.id)
      if (!withinLimit) {
        await updateKeyStats(keyRecord.id, false)
        return NextResponse.json({ status: false, message: 'Rate limit exceeded' }, { status: 429 })
      }

      const creditCheck = await hasEnoughCredits(keyRecord.userId, cost)
      if (!creditCheck.enough) {
        await updateKeyStats(keyRecord.id, false)
        return NextResponse.json(
          { status: false, message: 'Insufficient credits', remaining: creditCheck.available },
          { status: 402 }
        )
      }

      const { searchParams } = new URL(request.url)
      const result = await handler(request, { keyRecord, searchParams })

      await prisma.apiLog.create({
        data: {
          keyId: keyRecord.id,
          userId: keyRecord.userId,
          endpoint: config.endpoint,
          method: 'GET',
          statusCode: 200,
          costCredits: cost,
          ip: request.headers.get('x-forwarded-for') || '',
          userAgent: request.headers.get('user-agent') || ''
        }
      })

      await deductCredits(keyRecord.userId, cost)
      await updateKeyStats(keyRecord.id, true)

      const user = await prisma.user.findUnique({
        where: { id: keyRecord.userId },
        select: { credits: true }
      })

      return NextResponse.json({
        status: true,
        data: {
          ...result,
          costCredits: cost,
          remaining: user?.credits || 0
        }
      })
    } catch (error: any) {
      console.error(`[${config.name}] error:`, error)
      return NextResponse.json(
        { status: false, message: error?.message || 'Internal server error' },
        { status: 500 }
      )
    }
  }
}
