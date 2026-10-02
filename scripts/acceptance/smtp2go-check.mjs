// Explicit single-message smoke test; never drains the membership outbox.
import { readSmtp2goConfig, Smtp2goProvider } from '../../apps/api/dist/platform/smtp2go.js'
const config = readSmtp2goConfig(process.env.PROVIDER_CONFIG_PATH ?? 'env/config.txt')
const recipient = process.env.SMTP2GO_TEST_RECIPIENT
if (!process.argv.includes('--send')) {
  console.log(JSON.stringify({ apiKeyConfigured: Boolean(config.apiKey), senderConfigured: Boolean(config.sender), testRecipientConfigured: Boolean(recipient), mailSent: false }))
} else {
  try {
    if (!recipient) throw new Error('Set SMTP2GO_TEST_RECIPIENT to the explicitly approved test recipient.')
    await new Smtp2goProvider(config).send({ to: recipient, subject: 'DSOBA email integration test', text: 'This is a DSOBA integration test. No member account or payment has been created.' })
    console.log('SMTP2GO accepted the test message. Confirm receipt separately.')
  } catch (error) {
    console.error(error instanceof Error ? error.message : 'Email test failed.')
    process.exitCode = 1
  }
}
