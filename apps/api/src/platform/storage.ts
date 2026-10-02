export interface PutPrivateObjectInput {key:string;contentType:'image/jpeg'|'image/png';body:Uint8Array}
export interface PrivateObjectStorage {
  putPrivateObject(input:PutPrivateObjectInput):Promise<{key:string;etag?:string}>
  createSignedGetUrl(key:string,expiresInSeconds:number):Promise<{url:string;expiresAt:Date}>
}
/** Provider-neutral S3-compatible boundary for private applicant objects. */
export class S3CompatibleStorage implements PrivateObjectStorage {
  constructor(private readonly bucket:string,private readonly endpoint:string){}
  async putPrivateObject(_input:PutPrivateObjectInput):Promise<{key:string;etag?:string}>{
    if(!this.bucket||!this.endpoint) throw new Error('Object storage is not configured.')
    throw new Error('S3-compatible adapter requires provider credentials.')
  }
  async createSignedGetUrl(_key:string,expiresInSeconds:number):Promise<{url:string;expiresAt:Date}>{
    if(expiresInSeconds<=0) throw new Error('Signed URL expiry must be positive.')
    throw new Error('S3-compatible adapter requires provider credentials.')
  }
}
