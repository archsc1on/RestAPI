'use client'

import { motion } from 'framer-motion'

interface UsageChartProps {
  data: { date: string; used: number }[]
}

export function UsageChart({ data }: UsageChartProps) {
  const max = Math.max(...data.map((d) => d.used), 1)

  return (
    <div className="flex items-end gap-[2px] h-10 mt-3">
      {data.map((d, i) => {
        const height = (d.used / max) * 100
        return (
          <motion.div
            key={d.date}
            className="flex-1 rounded-t-sm bg-primary/40 hover:bg-primary/70 transition-colors relative group"
            style={{ height: `${Math.max(height, 2)}%` }}
            initial={{ height: 0 }}
            animate={{ height: `${Math.max(height, 2)}%` }}
            transition={{ duration: 0.3, delay: i * 0.01 }}
          >
            <div className="absolute -top-8 left-1/2 -translate-x-1/2 hidden group-hover:block z-10">
              <div className="bg-foreground text-background text-[9px] px-1.5 py-0.5 rounded whitespace-nowrap">
                {d.used}
              </div>
            </div>
          </motion.div>
        )
      })}
    </div>
  )
}
