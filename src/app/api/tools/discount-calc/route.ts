import { createPlugin } from '@/lib/plugin'

export const GET = createPlugin(
  { name: 'discount-calc', endpoint: '/api/tools/discount-calc', costCredits: 1 },
  async (req, { searchParams }) => {
    const price = parseFloat(searchParams.get('price') || '')
    const discount = parseFloat(searchParams.get('discount') || '')
    if (isNaN(price) || isNaN(discount)) throw new Error('price and discount are required')

    const savings = price * discount / 100
    const finalPrice = price - savings

    return { price, discount, savings: Math.round(savings * 100) / 100, finalPrice: Math.round(finalPrice * 100) / 100 }
  }
)
