// src/app/api/health/route.ts
import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { logger } from '@/lib/logger'

export async function GET() {
  try {
    // Check database
    await prisma.$queryRaw`SELECT 1`
    
    return NextResponse.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: {
        used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
        total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024)
      },
      version: process.version,
      environment: process.env.NODE_ENV
    })
  } catch (error) {
    logger.error('Health check failed:', error)
    return NextResponse.json({
      status: 'unhealthy',
      error: 'Database connection failed'
    }, { status: 503 })
  }
}