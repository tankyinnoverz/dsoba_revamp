import { test } from 'node:test'
import assert from 'node:assert/strict'
import { LocalObjectStorage, LocalPaymentProvider } from '../../apps/api/dist/platform/local-providers.js'

test('local object storage keeps objects private and signs bounded URLs', async () => {
  const storage = new LocalObjectStorage()
  await assert.rejects(() => storage.putPrivateObject({ key: 'photo.gif', contentType: 'image/gif', body: new Uint8Array([1]) }))
  await storage.putPrivateObject({ key: 'applications/a/photo.png', contentType: 'image/png', body: new Uint8Array([1, 2]) })
  const signed = await storage.createSignedGetUrl('applications/a/photo.png', 300)
  assert.match(signed.url, /^local-private:/)
  await assert.rejects(() => storage.createSignedGetUrl('applications/a/photo.png', 0))
  await assert.rejects(() => storage.createSignedGetUrl('applications/a/photo.png', 3601))
})

test('local payment checkout and callback are idempotent', async () => {
  const provider = new LocalPaymentProvider()
  const checkout = await provider.createCheckout({ applicationId: 'app_test', amountHkd: 2000, returnUrl: 'http://localhost:3000/membership/apply' })
  const callback = { providerReference: checkout.providerReference, idempotencyKey: 'local-event-1', amountHkd: 2000, status: 'PAID', occurredAt: new Date().toISOString() }
  assert.deepEqual(await provider.parseCallback(callback, 'local-test-signature'), await provider.parseCallback(callback, 'local-test-signature'))
  await assert.rejects(() => provider.parseCallback(callback, 'wrong'))
})
