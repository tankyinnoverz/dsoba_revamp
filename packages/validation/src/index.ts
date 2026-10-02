export type ValidationResult={valid:true}|{valid:false;message:string}
export const isNonEmptyString=(value:unknown):ValidationResult=>typeof value==='string'&&value.trim().length>0?{valid:true}:{valid:false,message:'A non-empty value is required.'}
export const isEmail=(value:unknown):ValidationResult=>typeof value==='string'&&/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)?{valid:true}:{valid:false,message:'Enter a valid email address.'}

export const isIsoDate=(value:unknown):ValidationResult=>{
  if(typeof value!=='string'||!/^\d{4}-\d{2}-\d{2}$/.test(value)) return {valid:false,message:'Enter a valid date.'}
  const date=new Date(value+'T00:00:00.000Z')
  return Number.isNaN(date.getTime())||date.toISOString().slice(0,10)!==value?{valid:false,message:'Enter a valid date.'}:{valid:true}
}
export const isCommentWithinLimit=(value:unknown,max=300):ValidationResult=>typeof value!=='string'||value.length<=max?{valid:true}:{valid:false,message:'Comments must be '+max+' characters or fewer.'}
export const isAllowedUpload=(contentType:unknown,sizeBytes:unknown):ValidationResult=>{
  const allowed=['image/jpeg','image/png']
  return typeof contentType==='string'&&allowed.includes(contentType)&&typeof sizeBytes==='number'&&sizeBytes>0&&sizeBytes<=5*1024*1024
    ?{valid:true}:{valid:false,message:'Upload must be a JPG or PNG image up to 5 MB.'}
}
export const deriveMembershipType=(dateOfBirth:string,today=new Date()):'YOUTH'|'TRIAL'|'LIFE'=>{
  const dob=new Date(dateOfBirth+'T00:00:00.000Z')
  let age=today.getUTCFullYear()-dob.getUTCFullYear()
  const beforeBirthday=today.getUTCMonth()<dob.getUTCMonth()||(today.getUTCMonth()===dob.getUTCMonth()&&today.getUTCDate()<dob.getUTCDate())
  if(beforeBirthday) age--
  if(age<18) return 'YOUTH'
  if(age<28) return 'TRIAL'
  return 'LIFE'
}
