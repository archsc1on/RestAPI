// src/lib/validators.ts
import { z } from 'zod'

export const registerSchema = z.object({
  email: z.string().email('Email tidak valid'),
  name: z.string().min(2, 'Nama minimal 2 karakter'),
  password: z.string().min(6, 'Password minimal 6 karakter')
})

export const loginSchema = z.object({
  email: z.string().email('Email tidak valid'),
  password: z.string().min(1, 'Password required')
})

export const sendMessageSchema = z.object({
  platform: z.enum(['whatsapp', 'telegram', 'discord']),
  phoneNumber: z.string().optional(),
  chatId: z.string().optional(),
  channelId: z.string().optional(),
  message: z.string().min(1, 'Pesan tidak boleh kosong').max(1600, 'Pesan maksimal 1600 karakter')
}).refine(
  (data) => {
    if (data.platform === 'whatsapp') return !!data.phoneNumber
    if (data.platform === 'telegram') return !!data.chatId
    if (data.platform === 'discord') return !!data.channelId
    return false
  },
  { message: 'Recipient required for selected platform' }
)

export const createKeySchema = z.object({
  name: z.string().min(1, 'Nama API Key required'),
  description: z.string().optional()
})

export const ipLookupSchema = z.object({
  ip: z.string().optional()
})

export const ytSearchSchema = z.object({
  q: z.string().min(1, 'Search query required'),
  limit: z.number().int().min(1).max(50).default(10)
})
