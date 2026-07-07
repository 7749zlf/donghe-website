import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.VUE_APP_SUPABASE_URL
const SUPABASE_ANON_KEY = process.env.VUE_APP_SUPABASE_ANON_KEY
const CASES_TABLE = process.env.VUE_APP_SUPABASE_CASES_TABLE || 'design_cases'
const AWARDS_TABLE = process.env.VUE_APP_SUPABASE_AWARDS_TABLE || 'design_awards'
const CASE_IMAGES_BUCKET = process.env.VUE_APP_SUPABASE_CASE_IMAGES_BUCKET || 'case-images'

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

function safePathPart(value) {
  return String(value || 'case')
    .normalize('NFKD')
    .replace(/[^\w.-]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'case'
}

export async function uploadCaseImage(file, caseId = 'case') {
  if (!client) {
    throw new Error('Supabase is not configured.')
  }

  const fileName = safePathPart(file.name || 'image')
  const folder = safePathPart(caseId)
  const path = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}-${fileName}`
  const { error } = await client.storage
    .from(CASE_IMAGES_BUCKET)
    .upload(path, file, {
      cacheControl: '31536000',
      contentType: file.type || 'application/octet-stream',
      upsert: true
    })

  if (error) {
    throw error
  }

  const { data } = client.storage.from(CASE_IMAGES_BUCKET).getPublicUrl(path)
  return data.publicUrl
}

export function uploadAwardImage(file, awardId = 'award') {
  return uploadCaseImage(file, `awards-${awardId}`)
}

export async function getManagerSession() {
  if (!client) {
    return null
  }

  const { data, error } = await client.auth.getSession()
  if (error) {
    throw error
  }

  return data.session
}

export function onManagerAuthChange(callback) {
  if (!client) {
    return () => {}
  }

  const { data } = client.auth.onAuthStateChange((_event, session) => {
    callback(session)
  })

  return () => data.subscription.unsubscribe()
}

function normalizeManagerPhone(value) {
  const text = String(value || '').trim()
  if (text.startsWith('+')) {
    return text.replace(/\s+/g, '')
  }

  const digits = text.replace(/\D/g, '')
  if (/^1\d{10}$/.test(digits)) {
    return `+86${digits}`
  }

  return text
}

export async function signInManager(account, password) {
  if (!client) {
    throw new Error('Supabase is not configured.')
  }

  const trimmedAccount = String(account || '').trim()
  const credentials = trimmedAccount.includes('@')
    ? { email: trimmedAccount, password }
    : { phone: normalizeManagerPhone(trimmedAccount), password }

  const { data, error } = await client.auth.signInWithPassword(credentials)

  if (error) {
    throw error
  }

  return data.session
}

export async function signOutManager() {
  if (!client) {
    return
  }

  const { error } = await client.auth.signOut()
  if (error) {
    throw error
  }
}

export async function isManagerAdmin() {
  if (!client) {
    return false
  }

  const { data, error } = await client.rpc('is_design_admin')

  if (error) {
    throw error
  }

  return Boolean(data)
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

export function rowToAward(row) {
  return {
    id: String(row.id),
    title: row.title || '',
    desc: row.desc || '',
    year: row.year || '',
    image: row.image || '',
    imageAlt: row.image_alt || row.title || '',
    source: 'cloud',
    hidden: Boolean(row.hidden),
    createdAt: row.created_at ? new Date(row.created_at).getTime() : Date.now()
  }
}

function awardToRow(awardItem) {
  return {
    id: String(awardItem.id || `award-${Date.now()}`),
    title: String(awardItem.title || '').trim(),
    desc: String(awardItem.desc || ''),
    year: String(awardItem.year || ''),
    image: String(awardItem.image || ''),
    image_alt: String(awardItem.imageAlt || awardItem.image_alt || awardItem.title || ''),
    hidden: Boolean(awardItem.hidden)
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

export async function fetchCloudAwards() {
  if (!client) {
    return []
  }

  const { data, error } = await client
    .from(AWARDS_TABLE)
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    throw error
  }

  return (data || []).map(rowToAward)
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

export async function upsertCloudAward(awardItem) {
  if (!client) {
    throw new Error('Supabase is not configured.')
  }

  const row = awardToRow(awardItem)
  const { data, error } = await client
    .from(AWARDS_TABLE)
    .upsert(row, { onConflict: 'id' })
    .select()
    .single()

  if (error) {
    throw error
  }

  return rowToAward(data)
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

export async function deleteCloudAward(id) {
  if (!client) {
    throw new Error('Supabase is not configured.')
  }

  const { error } = await client
    .from(AWARDS_TABLE)
    .delete()
    .eq('id', String(id))

  if (error) {
    throw error
  }
}
