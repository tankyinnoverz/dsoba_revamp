import { createHash, randomUUID } from 'node:crypto'
import type { PaymentProvider, PaymentCheckoutRequest, PaymentCheckoutResponse } from './qfpay.js'
import type { PrivateObjectStorage, PutPrivateObjectInput } from './storage.js'
import type { PaymentProviderCallback } from '@dsoba/types'

/** Deterministic local adapters for Sprint 1 acceptance. They never contact a provider. */
export class LocalObjectStorage implements PrivateObjectStorage {
  private readonly objects = new Map<string, PutPrivateObjectInput>()
  async putPrivateObject(input: PutPrivateObjectInput) {
    if (!/^image\/(?:jpeg|png)$/.test(input.contentType)) throw new Error('Only JPEG and PNG objects are accepted.')
    if (!input.key || input.key.includes('..') || input.key.startsWith('/')) throw new Error('Object key is invalid.')
    this.objects.set(input.key, structuredClone(input))
    return { key: input.key, etag: createHash('sha256').update(input.body).digest('hex') }
  }
  async createSignedGetUrl(key: string, expiresInSeconds: number) {
    if (!this.objects.has(key)) throw new Error('Private object not found.')
    if (!Number.isInteger(expiresInSeconds) || expiresInSeconds < 1 || expiresInSeconds > 3600) throw new Error('Signed URL expiry must be between 1 and 3600 seconds.')
    const expiresAt = new Date(Date.now() + expiresInSeconds * 1000)
    return { url: `local-private://${encodeURIComponent(key)}?expires=${expiresAt.getTime()}`, expiresAt }
  }
}

export class LocalPaymentProvider implements PaymentProvider {
  private readonly callbacks = new Set<string>()
  async createCheckout(request: PaymentCheckoutRequest): Promise<PaymentCheckoutResponse> {
    if (!request.applicationId || request.amountHkd !== 2000 || !/^https?:\/\//.test(request.returnUrl)) throw new Error('Local checkout requires a Life application, HKD 2,000 and a return URL.')
    const reference = `local_${randomUUID()}`
    return { providerReference: reference, checkoutUrl: `${request.returnUrl}${request.returnUrl.includes('?') ? '&' : '?'}payment=local&reference=${reference}` }
  }
  async parseCallback(payload: unknown, signature?: string): Promise<PaymentProviderCallback> {
    const value = payload as { providerReference?: string; status?: string; amountHkd?: number; idempotencyKey?: string; occurredAt?: string }
    if (signature !== 'local-test-signature' || !value.providerReference || value.amountHkd !== 2000 || value.status !== 'PAID' || !value.idempotencyKey || !value.occurredAt) throw new Error('Invalid local payment callback.')
    if (this.callbacks.has(value.idempotencyKey)) return { providerReference: value.providerReference, idempotencyKey: value.idempotencyKey, status: 'PAID', amountHkd: value.amountHkd, occurredAt: value.occurredAt }
    this.callbacks.add(value.idempotencyKey)
    return { providerReference: value.providerReference, idempotencyKey: value.idempotencyKey, status: 'PAID', amountHkd: value.amountHkd, occurredAt: value.occurredAt }
  }
}
