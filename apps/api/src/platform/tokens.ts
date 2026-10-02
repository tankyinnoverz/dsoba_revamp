import { createHash, randomBytes, timingSafeEqual, scrypt as scryptCallback } from 'node:crypto'
import { promisify } from 'node:util'

const scrypt=promisify(scryptCallback)
export type OneTimeTokenType='EMAIL_VERIFICATION'|'PASSWORD_RESET'|'PASSWORD_SETUP'|'APPLICATION_RESUME'
export function createOpaqueToken(bytes=32):string{return randomBytes(bytes).toString('base64url')}
export function hashOpaqueToken(token:string):string{return createHash('sha256').update(token).digest('hex')}
export async function hashPassword(password:string):Promise<string>{
  if(password.length<12) throw new Error('Password must be at least 12 characters.')
  const salt=randomBytes(16)
  const derived=await scrypt(password,salt,64) as Buffer
  return 'scrypt$'+salt.toString('base64url')+'$'+derived.toString('base64url')
}
export async function verifyPassword(password:string,encoded:string):Promise<boolean>{
  const [,saltValue,hashValue]=encoded.split('$')
  if(!saltValue||!hashValue) return false
  const derived=await scrypt(password,Buffer.from(saltValue,'base64url'),64) as Buffer
  const expected=Buffer.from(hashValue,'base64url')
  return derived.length===expected.length && timingSafeEqual(derived,expected)
}
