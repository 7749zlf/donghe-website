import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.VUE_APP_SUPABASE_URL
const SUPABASE_ANON_KEY = process.env.VUE_APP_SUPABASE_ANON_KEY
const CASES_TABLE = process.env.VUE_APP_SUPABASE_CASES_TABLE || 'design_cases'

const enabled = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY)
const client = enabled ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY) : null

function normalizeImages(value) {
  if (Array.isArray(value)) {
    return value.map((item) => String(item).trim()).filter(Boolean)
  }

  return String(value || '')
    .split(/\r?\n|，|,/)
    .map((item) => item.trim())
    .filter(Boolean)
}

export function isCloudCasesEnabled() {
  return enabled
}

export function rowToCase(row) {
  const list = normalizeImages(row.images)

  return {
    id: String(row.id),
    name: row.name || '',
    category: row.category || '商业空间',
    type: row.type || '',
    year: row.year || '',
    url: row.url || '',
    list,
    image: row.image || list[0] || '',
    note: row.note || '',
    source: 'cloud',
    hidden: Boolean(row.hidden),
    createdAt: row.created_at ? new Date(row.created_at).getTime() : Date.now()
  }
}

function caseToRow(caseItem) {
  const images = normalizeImages(caseItem.list || caseItem.images)

  return {
    id: String(caseItem.id || `case-${Date.now()}`),
    name: String(caseItem.name || '').trim(),
    category: String(caseItem.category || '商业空间'),
    type: String(caseItem.type || ''),
    year: String(caseItem.year || ''),
    url: String(caseItem.url || ''),
    images,
    image: String(caseItem.image || images[0] || ''),
    note: String(caseItem.note || ''),
    hidden: Boolean(caseItem.hidden)
  }
}

export async function fetchCloudCases() {
  if (!client) {
    return []
  }

  const { data, error } = await client
    .from(CASES_TABLE)
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    throw error
  }

  return (data || []).map(rowToCase)
}

export async function upsertCloudCase(caseItem) {
  if (!client) {
    throw new Error('Supabase is not configured.')
  }

  const row = caseToRow(caseItem)
  const { data, error } = await client
    .from(CASES_TABLE)
    .upsert(row, { onConflict: 'id' })
    .select()
    .single()

  if (error) {
    throw error
  }

  return rowToCase(data)
}

export async function deleteCloudCase(id) {
  if (!client) {
    throw new Error('Supabase is not configured.')
  }

  const { error } = await client
    .from(CASES_TABLE)
    .delete()
    .eq('id', String(id))

  if (error) {
    throw error
  }
}
