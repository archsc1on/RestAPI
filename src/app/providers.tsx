'use client'

import { SessionProvider } from 'next-auth/react'
import { Toaster } from 'react-hot-toast'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      {children}
      <Toaster
        position="top-right"
        gutter={8}
        toastOptions={{
          duration: 2000,
          style: {
            background: '#1e293b',
            color: '#f1f5f9',
            border: '1px solid #334155',
            borderRadius: '8px',
            fontSize: '13px',
            padding: '8px 14px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
            maxWidth: '280px'
          },
          success: {
            iconTheme: {
              primary: '#22c55e',
              secondary: '#1e293b'
            }
          },
          error: {
            iconTheme: {
              primary: '#ef4444',
              secondary: '#1e293b'
            }
          }
        }}
      />
    </SessionProvider>
  )
}
