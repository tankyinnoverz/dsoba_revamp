import { readFileSync } from 'node:fs'

export interface EmailMessage { to: string; subject: string; text: string }
export interface EmailProvider { send(message: EmailMessage): Promise<{ providerId: string }> }
export interface Smtp2goConfig { apiKey: string; sender: string }

/** Explicit file loading only; never expose the file or credential through public config. */
export function readSmtp2goConfig(path: string): Smtp2goConfig {
  const values: Record<string, string> = {}
  for (const line of readFileSync(path, 'utf8').split(/\r?\n/)) {
    const match = line.match(/^\s*([A-Za-z][A-Za-z0-9_ .-]*)\s*[:=]\s*(.*?)\s*$/)
    if (match) values[match[1].trim().toUpperCase().replaceAll(' ', '_')] = match[2]
  }
  return {
    apiKey: process.env.SMTP2GO_API_KEY ?? values.SMTP2GO_API_KEY ?? values.API_KEY ?? '',
    sender: process.env.SMTP2GO_SENDER ?? values.SMTP2GO_SENDER ?? values.SENDER ?? ''
  }
}

const email = /^[^\s<>@]+@[^\s<>@]+\.[^\s<>@]+$/

export class Smtp2goProvider implements EmailProvider {
  constructor(private readonly config: Smtp2goConfig, private readonly transport: typeof fetch = fetch) {}

  async send(message: EmailMessage): Promise<{ providerId: string }> {
    if (!this.config.apiKey || !email.test(this.config.sender)) throw new Error('SMTP2GO API key and verified sender address are required.')
    if (!email.test(message.to) || !message.subject.trim() || /[\r\n]/.test(message.subject) || !message.text.trim()) throw new Error('A valid recipient, subject and text body are required.')
    let response: Response
    try {
      // Fixed official HTTPS destination prevents a config typo leaking the API key.
      response = await this.transport('https://api.smtp2go.com/v3/email/send', {
        method: 'POST', redirect: 'error', signal: AbortSignal.timeout(15000),
        headers: { 'Content-Type': 'application/json', 'X-Smtp2go-Api-Key': this.config.apiKey },
        body: JSON.stringify({ sender: this.config.sender, to: [message.to], subject: message.subject, text_body: message.text })
      })
    } catch {
      // Do not blindly retry: a timeout may occur after the provider accepted mail.
      throw new Error('SMTP2GO delivery outcome is unknown; inspect provider activity before retrying.')
    }
    if (!response.ok) throw new Error(`SMTP2GO rejected the request (HTTP ${response.status}).`)
    let result: { data?: { succeeded?: number; failed?: number; email_id?: string; error?: unknown; failures?: unknown[] } }
    try { result = await response.json() as typeof result } catch { throw new Error('SMTP2GO returned an unreadable response; verify delivery before retrying.') }
    const data = result.data
    if (data?.succeeded !== 1 || data.failed !== 0 || data.error || data.failures?.length || !data.email_id) throw new Error('SMTP2GO did not confirm acceptance; inspect provider activity before retrying.')
    return { providerId: data.email_id }
  }
}
