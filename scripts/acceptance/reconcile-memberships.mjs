import { SqliteStore } from '../../apps/api/dist/platform/sqlite-store.js'
const store = new SqliteStore()
let checked = 0, changed = 0
for (const row of store.query('SELECT id,payload FROM members')) {
  const result = store.refreshLifecycle(String(row.id))
  checked++
  if (JSON.stringify(JSON.parse(String(row.payload))) !== JSON.stringify(result)) changed++
}
console.log(JSON.stringify({ checked, changed }))
