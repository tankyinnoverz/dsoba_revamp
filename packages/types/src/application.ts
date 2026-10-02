export type ApplicationStatus = 'Draft' | 'Pending' | 'More Information Required' | 'Approved' | 'Rejected' | 'Withdrawn' | 'Expired'
export type PaymentStatus = 'Not Required' | 'Unpaid' | 'Online Payment Pending' | 'Proof Uploaded' | 'Verifying' | 'Paid' | 'Failed' | 'Refunded'
export type MembershipType = 'Youth' | 'Trial' | 'Life'
export interface ApplicationContact { position?: string }
export interface ApplicationEducation { enteredDbsMonth?: string; leftDbsMonth?: string; certificateType?: string; certificateClass?: string; certificateYearProjected?: boolean; dpsOnly?: boolean; enteredDpsYear?: string; leftDpsYear?: string; otherClubs?: string }
export interface ApplicationConfirmation { joiningSource?: string; introducerCertificateYear?: string; signatureName?: string }
export interface ApplicationProfile { firstName: string; lastName: string; middleName: string; chineseName: string; dateOfBirth: string; maritalStatus: string; profilePictureName: string }
export interface ApplicationContact { addressLine1: string; addressLine2: string; city: string; region: string; postalCode: string; country: string; homePhone: string; mobile: string; email: string; companyName: string; industry: string; occupation: string; officePhone: string }
export interface ApplicationEducation { classYear: string; yearJoined: string; yearLeft: string; house: string; studiedTwoYears: boolean; hobbies: string; college: string; degree: string; graduationYear: string }
export interface ApplicationConfirmation { reason: string; introducedBy: string; comments: string; membershipType: MembershipType; rulesAccepted: boolean; consentAccepted: boolean }
export interface MembershipApplication { id: string; status: ApplicationStatus; paymentStatus: PaymentStatus; profile: ApplicationProfile; contact: ApplicationContact; education: ApplicationEducation; confirmation: ApplicationConfirmation; updatedAt: string }
