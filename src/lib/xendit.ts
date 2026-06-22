// src/lib/xendit.ts
// File ini hanya diimport di server-side
import Xendit from 'xendit-node'

const xendit = new Xendit({
  secretKey: process.env.XENDIT_SECRET_KEY!,
})

export const { Invoice } = xendit

export const createXenditInvoice = async (params: any) => {
  try {
    const response = await Invoice.createInvoice({
      external_id: params.externalId,
      amount: params.amount,
      description: params.description,
      customer: params.customer,
      success_redirect_url: params.successRedirectUrl || `${process.env.NEXTAUTH_URL}/payment/success`,
      failure_redirect_url: params.failureRedirectUrl || `${process.env.NEXTAUTH_URL}/payment/failed`,
      currency: 'IDR',
      invoice_duration: 86400,
    } as any)
    return response
  } catch (error) {
    console.error('Xendit error:', error)
    throw error
  }
}