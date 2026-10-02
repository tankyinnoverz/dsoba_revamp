import type { PaymentProviderCallback } from '@dsoba/types'
export interface PaymentCheckoutRequest {applicationId:string;amountHkd:number;returnUrl:string}
export interface PaymentCheckoutResponse {providerReference:string;checkoutUrl:string}
export interface PaymentProvider {
  createCheckout(request:PaymentCheckoutRequest):Promise<PaymentCheckoutResponse>
  parseCallback(payload:unknown,signature:string|undefined):Promise<PaymentProviderCallback>
}
/** QFPay boundary; idempotency must be persisted before state transition. */
export class QfPayProvider implements PaymentProvider {
  constructor(private readonly endpoint:string,private readonly merchantId:string){}
  async createCheckout(_request:PaymentCheckoutRequest):Promise<PaymentCheckoutResponse>{
    if(!this.endpoint||!this.merchantId) throw new Error('QFPay is not configured.')
    throw new Error('QFPay adapter requires provider credentials.')
  }
  async parseCallback(_payload:unknown,_signature:string|undefined):Promise<PaymentProviderCallback>{
    throw new Error('QFPay callback verification is not configured.')
  }
}
