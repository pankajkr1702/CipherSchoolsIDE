const API_BASE = (import.meta && import.meta.env && import.meta.env.VITE_API_BASE) || 'http://localhost:4000'

function authHeaders() {
  const token = localStorage.getItem('codecraft_jwt')
  return token ? { Authorization: `Bearer ${token}` } : {}
}

async function request(path, opts = {}) {
  try {
    const res = await fetch(API_BASE + path, { headers: { 'Content-Type': 'application/json', ...authHeaders() }, ...opts })
    if (res.status === 401) { try { localStorage.removeItem('codecraft_jwt') } catch {}; throw new Error('HTTP 401') }
    if (!res.ok) throw new Error('HTTP ' + res.status)
    return await res.json()
  } catch (e) {
    throw e
  }
}

async function requestGetOrNull(path) {
  try {
    const res = await fetch(API_BASE + path, { headers: { 'Content-Type': 'application/json', ...authHeaders() } })
    if (res.status === 401) { try { localStorage.removeItem('codecraft_jwt') } catch {}; return null }
    if (res.status === 404) return null
    if (!res.ok) throw new Error('HTTP ' + res.status)
    return await res.json()
  } catch {
    return null
  }
}

export async function apiListProjects() {
  return await request('/api/projects')
}

export async function apiCreateProject(id, name) {
  return await request('/api/projects', { method: 'POST', body: JSON.stringify({ id, name }) })
}

export async function apiGetProject(id) {
  return await requestGetOrNull(`/api/projects/${id}`)
}

export async function apiDeleteProject(id) {
  return await request(`/api/projects/${id}`, { method: 'DELETE' })
}

export async function apiUpsertFile(projectId, file) {
  // PUT-first upsert; if not found then POST
  try {
    return await request(`/api/projects/${projectId}/files/${encodeURIComponent(file.fileId)}`, { method: 'PUT', body: JSON.stringify(file) })
  } catch (e) {
    return await request(`/api/projects/${projectId}/files`, { method: 'POST', body: JSON.stringify(file) })
  }
}

export async function apiDeleteFile(projectId, fileId) {
  return await request(`/api/projects/${projectId}/files/${encodeURIComponent(fileId)}`, { method: 'DELETE' })
}

// Auth
export async function apiRegister(email, password) {
  return await request('/auth/register', { method: 'POST', body: JSON.stringify({ email, password }) })
}
export async function apiLogin(email, password) {
  return await request('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) })
}


