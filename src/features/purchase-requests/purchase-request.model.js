import { serverTimestamp } from 'firebase/firestore'

export function createPurchaseRequestDocument(input) {
  return {
    conversationResult: String(input.conversationResult ?? '').trim(),
    contactInfo: String(input.contactInfo ?? '').trim(),
    customerName: String(input.customerName ?? '').trim(),
    instagramUsername: String(input.instagramUsername ?? '').trim(),
    items: Array.isArray(input.items) ? input.items : [],
    notes: String(input.notes ?? '').trim(),
    orderSummary: String(input.orderSummary ?? '').trim(),
    status: String(input.status ?? 'new').trim(),
    totalItems: Number(input.totalItems ?? 0),
    totalPrice: Number(input.totalPrice ?? 0),
    createdAt: serverTimestamp(),
  }
}
