import { supabase } from '../lib/supabase'
import { generateStoragePath } from '../utils/helpers'

// ── Auth ──────────────────────────────────────────────────────────────────

export async function signUp({ email, password, fullName, phone, role = 'student' }) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: fullName, phone, role },
    },
  })
  if (error) throw error
  return data
}

export async function signIn({ email, password }) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) throw error
  return data
}

export async function signOut() {
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}

export async function getSession() {
  const { data, error } = await supabase.auth.getSession()
  if (error) throw error
  return data.session
}

// ── Profiles ─────────────────────────────────────────────────────────────

export async function getProfile(userId) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()
  if (error) throw error
  return data
}

export async function updateProfile(userId, updates) {
  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function getAllProfiles() {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) throw error
  return data
}

// ── Items ─────────────────────────────────────────────────────────────────

export async function getItems({ type, category, location, status, search, limit = 20, offset = 0 } = {}) {
  let query = supabase
    .from('items')
    .select('*, profiles(full_name, email, avatar_url)', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (type)     query = query.eq('type', type)
  if (category) query = query.eq('category', category)
  if (location) query = query.eq('location', location)
  if (status)   query = query.eq('status', status)
  if (search)   query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`)

  const { data, error, count } = await query
  if (error) throw error
  return { data, count }
}

export async function getItemById(id) {
  const { data, error } = await supabase
    .from('items')
    .select('*, profiles(full_name, email, avatar_url, phone)')
    .eq('id', id)
    .single()
  if (error) throw error
  return data
}

export async function getMyItems(userId) {
  const { data, error } = await supabase
    .from('items')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
  if (error) throw error
  return data
}

export async function createItem(itemData) {
  const { data, error } = await supabase
    .from('items')
    .insert(itemData)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function updateItem(id, updates) {
  const { data, error } = await supabase
    .from('items')
    .update(updates)
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function deleteItem(id) {
  const { error } = await supabase.from('items').delete().eq('id', id)
  if (error) throw error
}

export async function getRecentItems(limit = 8) {
  const { data, error } = await supabase
    .from('items')
    .select('*')
    .eq('status', 'active')
    .order('created_at', { ascending: false })
    .limit(limit)
  if (error) throw error
  return data
}

// ── Claims ────────────────────────────────────────────────────────────────

export async function getMyClaims(userId) {
  const { data, error } = await supabase
    .from('claims')
    .select('*, items(title, type, category, image_url, status)')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
  if (error) throw error
  return data
}

export async function getAllClaims() {
  const { data, error } = await supabase
    .from('claims')
    .select('*, items(title, type, category, image_url), profiles(full_name, email)')
    .order('created_at', { ascending: false })
  if (error) throw error
  return data
}

export async function getClaimsForItem(itemId) {
  const { data, error } = await supabase
    .from('claims')
    .select('*, profiles(full_name, email, phone)')
    .eq('item_id', itemId)
    .order('created_at', { ascending: false })
  if (error) throw error
  return data
}

export async function createClaim(claimData) {
  const { data, error } = await supabase
    .from('claims')
    .insert(claimData)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function updateClaimStatus(id, status) {
  const { data, error } = await supabase
    .from('claims')
    .update({ status })
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data
}

// ── Storage ───────────────────────────────────────────────────────────────

export async function uploadItemImage(userId, file) {
  const path = generateStoragePath(userId, file)
  const { data, error } = await supabase.storage
    .from('item-images')
    .upload(path, file, { cacheControl: '3600', upsert: false })
  if (error) throw error

  const { data: urlData } = supabase.storage.from('item-images').getPublicUrl(path)
  return urlData.publicUrl
}

// ── Statistics ────────────────────────────────────────────────────────────

export async function getDashboardStats() {
  const [itemsRes, claimsRes, profilesRes] = await Promise.all([
    supabase.from('items').select('type, status'),
    supabase.from('claims').select('status'),
    supabase.from('profiles').select('id', { count: 'exact', head: true }),
  ])

  if (itemsRes.error) throw itemsRes.error
  if (claimsRes.error) throw claimsRes.error

  const items = itemsRes.data || []
  const claims = claimsRes.data || []

  return {
    totalUsers:     profilesRes.count || 0,
    totalItems:     items.length,
    lostItems:      items.filter(i => i.type === 'lost').length,
    foundItems:     items.filter(i => i.type === 'found').length,
    recoveredItems: items.filter(i => i.status === 'recovered').length,
    pendingClaims:  claims.filter(c => c.status === 'pending').length,
    totalClaims:    claims.length,
  }
}
