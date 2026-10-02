param(
  [string]$ApiBase = 'http://localhost:4000/api/v1'
)

$ErrorActionPreference = 'Stop'
if (-not $env:INTERNAL_API_TOKEN) { throw 'Set INTERNAL_API_TOKEN to the same credential used by the local API.' }
$adminHeaders = @{ Authorization = "Bearer $env:INTERNAL_API_TOKEN" }

$draftBody = @{
  firstName = 'Acceptance'
  lastName = 'Applicant'
  dateOfBirth = '2004-01-01'
} | ConvertTo-Json

$draft = Invoke-RestMethod -Method Post -Uri "$ApiBase/applications/draft" -ContentType 'application/json' -Body $draftBody

$submitBody = @{
  firstName = 'Acceptance'
  lastName = 'Applicant'
  dateOfBirth = '2004-01-01'
  profilePictureKey = 's3://acceptance/profile.jpg'
  mobile = '91234567'
  email = "acceptance-$([guid]::NewGuid().ToString('N'))@example.test"
  classYear = 2028
  yearJoiningSchool = 2020
  yearLeavingSchool = 2028
  house = 'Blue'
  membershipType = 'Trial'
  consent = $true
  rulesAccepted = $true
} | ConvertTo-Json

$pending = Invoke-RestMethod -Method Post -Uri "$ApiBase/applications/$($draft.id)/submit" -Headers @{ 'x-resume-token' = $draft.resumeToken } -ContentType 'application/json' -Body $submitBody
if ($pending.status -ne 'Pending') { throw "Expected Pending, got $($pending.status)" }

$unauthorisedRejected = $false
try {
  Invoke-RestMethod -Method Post -Uri "$ApiBase/internal/applications/$($draft.id)/approve" -Headers @{ 'x-actor' = 'unauthorised-user'; 'x-role' = 'member' } | Out-Null
} catch { if ([int]$_.Exception.Response.StatusCode -ne 401) { throw }; $unauthorisedRejected = $true }
if (-not $unauthorisedRejected) { throw 'Expected non-admin approval to be rejected' }

$approved = Invoke-RestMethod -Method Post -Uri "$ApiBase/internal/applications/$($draft.id)/approve" -Headers $adminHeaders
if ($approved.application.status -ne 'Approved') { throw "Expected Approved, got $($approved.application.status)" }

$repeat = Invoke-RestMethod -Method Post -Uri "$ApiBase/internal/applications/$($draft.id)/approve" -Headers $adminHeaders
if ($repeat.member.id -ne $approved.member.id) { throw 'Repeated approval created a duplicate member' }

$member = Invoke-RestMethod -Method Get -Uri "$ApiBase/members/$($approved.member.id)" -Headers $adminHeaders
if ($member.membershipType -ne 'Trial' -or $member.membershipStatus -ne 'Active') { throw 'Expected active Trial member' }

[pscustomobject]@{
  application = $pending.status
  approval = $approved.application.status
  unauthorisedApprovalRejected = $unauthorisedRejected
  repeatedApprovalIdempotent = ($repeat.member.id -eq $approved.member.id)
  membershipType = $member.membershipType
  membershipStatus = $member.membershipStatus
  trialExpiryDate = $member.trialExpiryDate
} | ConvertTo-Json
