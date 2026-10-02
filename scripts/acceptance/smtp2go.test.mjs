import { test } from 'node:test'
import assert from 'node:assert/strict'
import { Smtp2goProvider } from '../../apps/api/dist/platform/smtp2go.js'

test('SMTP2GO sends only to the fixed official endpoint and checks acceptance', async () => {
  const provider = new Smtp2goProvider({ apiKey: 'synthetic-key', sender: 'sender@example.test' }, async (url, request) => {
    assert.equal(url, 'https://api.smtp2go.com/v3/email/send')
    assert.equal(request.redirect, 'error')
    assert.equal(request.headers['X-Smtp2go-Api-Key'], 'synthetic-key')
    assert.deepEqual(JSON.parse(request.body), { sender: 'sender@example.test', to: ['recipient@example.test'], subject: 'Test', text_body: 'Synthetic content' })
    return Response.json({ data: { succeeded: 1, failed: 0, email_id: 'synthetic-delivery' } })
  })
  assert.deepEqual(await provider.send({ to: 'recipient@example.test', subject: 'Test', text: 'Synthetic content' }), { providerId: 'synthetic-delivery' })
})

test('SMTP2GO rejects missing config, HTTP-200 failures and ambiguous delivery without retry or secret disclosure', async () => {
  const message = { to: 'recipient@example.test', subject: 'Test', text: 'Synthetic content' }
  await assert.rejects(() => new Smtp2goProvider({ apiKey: '', sender: '' }).send(message), /required/)
  for (const transport of [async () => Response.json({ data: { succeeded: 0, failed: 1, error: 'private-provider-detail' } }), async () => { throw new Error('synthetic-secret') }]) {
    let calls = 0
    const provider = new Smtp2goProvider({ apiKey: 'synthetic-secret', sender: 'sender@example.test' }, async (...args) => { calls++; return transport(...args) })
    await assert.rejects(() => provider.send(message), error => !/synthetic-secret|private-provider-detail/.test(error.message))
    assert.equal(calls, 1)
  }
})
