const KEY_PREFIX = 'codecraft:'
const INDEX_KEY = 'codecraft_projects_index'

export function getProjectsIndex() {
  try { return JSON.parse(localStorage.getItem(INDEX_KEY)) || [] } catch { return [] }
}

export function saveProjectsIndex(list) {
  try { localStorage.setItem(INDEX_KEY, JSON.stringify(list)) } catch {}
}

export function getProjectId() {
  const id = sessionStorage.getItem('codecraft_active_project')
  return id || 'demo-project'
}

export function loadProjectState(projectId) {
  try {
    const raw = localStorage.getItem(KEY_PREFIX + 'project_' + projectId)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function saveProjectState(projectId, state) {
  try {
    localStorage.setItem(KEY_PREFIX + 'project_' + projectId, JSON.stringify(state))
    const idx = getProjectsIndex()
    const now = Date.now()
    const existing = idx.find(p => p.id === projectId)
    if (existing) existing.lastModified = now
    else idx.push({ id: projectId, name: state.name || projectId, createdAt: now, lastModified: now })
    saveProjectsIndex(idx)
  } catch {}
}

export function setActiveProjectId(projectId) {
  try { sessionStorage.setItem('codecraft_active_project', projectId) } catch {}
}

export function deleteProject(projectId) {
  try {
    localStorage.removeItem(KEY_PREFIX + 'project_' + projectId)
    const idx = getProjectsIndex().filter(p => p.id !== projectId)
    saveProjectsIndex(idx)
  } catch {}
}

export function createProjectRecord(id, name) {
  const now = Date.now()
  const idx = getProjectsIndex()
  idx.push({ id, name, createdAt: now, lastModified: now })
  saveProjectsIndex(idx)
}

export function listProjects() {
  return getProjectsIndex().sort((a,b)=> (b.lastModified||0)-(a.lastModified||0))
}


