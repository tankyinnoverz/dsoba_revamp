import { UnauthorizedException } from '@nestjs/common'
import { timingSafeEqual } from 'node:crypto'

/** Controlled local integration credential, supplied by the operator, never by a role header. */
export function requireInternalAccess(authorization?: string): string {
  const expected = process.env.INTERNAL_API_TOKEN
  const supplied = authorization?.startsWith('Bearer ') ? authorization.slice(7) : ''
  if (!expected || expected.length < 32 || !supplied) throw new UnauthorizedException('Internal authentication required.')
  const left = Buffer.from(expected)
  const right = Buffer.from(supplied)
  if (left.length !== right.length || !timingSafeEqual(left, right)) throw new UnauthorizedException('Internal authentication required.')
  return 'internal-service'
}
