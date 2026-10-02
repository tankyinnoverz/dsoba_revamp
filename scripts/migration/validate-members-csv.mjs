import fs from 'node:fs'
import path from 'node:path'

const input = process.argv[2] ?? 'resources/Old_Data/Members.csv'
const reportPath = process.argv[3] ?? 'resources/Old_Data/Members.validation.json'

function parseCsv(text) {
  const rows = []
  let row = []
  let value = ''
  let quoted = false
  for (let i = 0; i < text.length; i += 1) {
    const char = text[i]
    const next = text[i + 1]
    if (quoted) {
      if (char === '"' && next === '"') { value += '"'; i += 1 }
      else if (char === '"') quoted = false
      else value += char
    } else if (char === '"') quoted = true
    else if (char === ',') { row.push(value); value = '' }
    else if (char === '\n') { row.push(value.replace(/\r$/, '')); rows.push(row); row = []; value = '' }
    else value += char
  }
  if (value.length || row.length) { row.push(value); rows.push(row) }
  return rows.filter((candidate) => candidate.some((cell) => cell.trim() !== ''))
}

const source = fs.readFileSync(input, 'utf8')
const rows = parseCsv(source)
const rawHeaders = rows.shift() ?? []
const seen = new Map()
const headers = rawHeaders.map((header) => {
  const count = (seen.get(header) ?? 0) + 1
  seen.set(header, count)
  return count === 1 ? header : `${header} [${count}]`
})
const index = (name) => headers.indexOf(name)
const get = (row, name) => {
  const position = index(name)
  return position < 0 ? '' : String(row[position] ?? '').trim()
}
const countValues = (values) => Object.fromEntries([...values.entries()].sort((a, b) => b[1] - a[1]))
const increment = (map, key) => map.set(key, (map.get(key) ?? 0) + 1)
const knownStatuses = new Set(['Active', 'Suspended', 'Pending', 'Trial Expired', 'Terminated', 'Deceased'])
const knownTypes = new Set(['Youth', 'Trial', 'Trial Member', 'Life', 'Life Member', 'Guest'])
const emails = new Map()
const memberNumbers = new Map()
const statusCounts = new Map()
const typeCounts = new Map()
const unknownStatusCounts = new Map()
const unknownTypeCounts = new Map()
let missingId = 0
let missingName = 0
let invalidBirthdate = 0
let rowsWithUnexpectedWidth = 0

for (const row of rows) {
  if (row.length !== headers.length) rowsWithUnexpectedWidth += 1
  const id = get(row, 'ID')
  const firstName = get(row, 'First Name')
  const lastName = get(row, 'Last Name')
  const email = get(row, 'Email Address').toLowerCase()
  const memberNumber = get(row, 'Member Number')
  const birthdate = get(row, 'Birthdate')
  const status = get(row, 'Member Status')
  const type = get(row, 'Membership Type  (cancel)')
  if (!id) missingId += 1
  if (!firstName && !lastName) missingName += 1
  if (birthdate && Number.isNaN(Date.parse(birthdate))) invalidBirthdate += 1
  if (email) increment(emails, email)
  if (memberNumber) increment(memberNumbers, memberNumber)
  if (status) {
    increment(statusCounts, status)
    if (!knownStatuses.has(status)) increment(unknownStatusCounts, status)
  }
  if (type) {
    increment(typeCounts, type)
    if (!knownTypes.has(type)) increment(unknownTypeCounts, type)
  }
}

const duplicateCount = (map) => [...map.values()].filter((count) => count > 1).length
const report = {
  source: path.normalize(input),
  rows: rows.length,
  columns: headers.length,
  duplicateHeaders: [...seen.entries()].filter(([, count]) => count > 1).map(([name, count]) => ({ name, count })),
  quality: {
    missingId,
    missingName,
    invalidBirthdate,
    rowsWithUnexpectedWidth,
    duplicateEmailValues: duplicateCount(emails),
    duplicateMemberNumberValues: duplicateCount(memberNumbers)
  },
  statusCounts: countValues(statusCounts),
  unmappedStatusCounts: countValues(unknownStatusCounts),
  membershipTypeCounts: countValues(typeCounts),
  unmappedMembershipTypeCounts: countValues(unknownTypeCounts),
  generatedAt: new Date().toISOString()
}

fs.mkdirSync(path.dirname(reportPath), { recursive: true })
fs.writeFileSync(reportPath, `${JSON.stringify(report, null, 2)}\n`, 'utf8')
console.log(JSON.stringify({ source: report.source, rows: report.rows, columns: report.columns, quality: report.quality, statusCounts: report.statusCounts, unmappedStatusCounts: report.unmappedStatusCounts }, null, 2))
