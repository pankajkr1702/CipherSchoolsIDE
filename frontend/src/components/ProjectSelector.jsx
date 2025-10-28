import React, { useEffect, useMemo, useState } from 'react'
import { listProjects, createProjectRecord, setActiveProjectId, deleteProject, saveProjectState } from '../utils/storage.js'
import { apiListProjects, apiCreateProject, apiDeleteProject } from '../utils/api.js'
import { slugify, uniqueSlug } from '../utils/slugify.js'
import { buildInitialTree } from '../utils/fileHelpers.js'

export default function ProjectSelector({ onSwitch }) {
  const [refresh, setRefresh] = useState(0)
  const [cloud, setCloud] = useState([])
  const authed = !!localStorage.getItem('codecraft_jwt')
  const projects = useMemo(() => authed && cloud.length ? cloud : listProjects(), [refresh, authed, cloud])
  const [creating, setCreating] = useState(false)
  const [name, setName] = useState('')
  const [confirmDel, setConfirmDel] = useState('')
  const [toDelete, setToDelete] = useState(null)

  useEffect(() => {
    (async () => {
      if (!authed) { setCloud([]); return }
      try {
        const remote = await apiListProjects()
        setCloud(remote || [])
      } catch { setCloud([]) }
    })()
  }, [refresh, authed])

  const doCreate = async () => {
    const base = slugify(name)
    const id = uniqueSlug(base, projects.map(p=>p.id))
    try { 
      await apiCreateProject(id, name || id) 
      // Backend will seed the files automatically
      createProjectRecord(id, name || id)
      setActiveProjectId(id)
      setCreating(false); setName(''); setRefresh(x=>x+1)
      // Trigger project change event - this will load the seeded files from backend
      window.dispatchEvent(new CustomEvent('projectChanged', { detail: { projectId: id } }))
    } catch {
      // Fallback to local seeding if backend fails
      createProjectRecord(id, name || id)
      const tree = buildInitialTree()
      saveProjectState(id, { id, name: name || id, tree, openTabs: [], activeFile: '' })
      setActiveProjectId(id)
      setCreating(false); setName(''); setRefresh(x=>x+1)
      window.dispatchEvent(new CustomEvent('projectChanged', { detail: { projectId: id } }))
    }
  }

  const doDelete = async () => {
    if (!toDelete || confirmDel !== toDelete) return
    try { await apiDeleteProject(toDelete) } catch {}
    deleteProject(toDelete)
    setToDelete(null); setConfirmDel(''); setRefresh(x=>x+1)
    const next = listProjects()[0]
    if (next) { setActiveProjectId(next.id); onSwitch && onSwitch(next.id) }
  }

  return (
    <div style={{ display:'flex', alignItems:'center', gap:8 }}>
      <select onChange={(e)=>{ setActiveProjectId(e.target.value); window.dispatchEvent(new CustomEvent('projectChanged', { detail: { projectId: e.target.value } })) }} value={(sessionStorage.getItem('codecraft_active_project') || projects[0]?.id || '')} style={{ background:'var(--bg-elev)', color:'var(--text)', border:'1px solid var(--border)', padding:'4px 8px' }}>
        {projects.map(p => <option key={p.id} value={p.id}>▣ {p.name} ({p.id})</option>)}
      </select>
      <span style={{ marginLeft:8, fontSize:12, color: authed ? 'var(--accent)' : 'var(--muted)' }}>
        {authed ? 'Cloud Sync Enabled' : 'Offline Mode (Local Only)'}
      </span>
      <button onClick={()=>setCreating(v=>!v)} style={{ background:'transparent', color:'var(--accent)', border:'1px solid var(--border)', padding:'4px 8px' }}>+ New</button>
      <button onClick={()=> setToDelete(projects[0]?.id || null)} style={{ background:'transparent', color:'#ff6b6b', border:'1px solid var(--border)', padding:'4px 8px' }}>Delete</button>

      {creating && (
        <div style={{ display:'flex', gap:6, alignItems:'center' }}>
          <input value={name} onChange={e=>setName(e.target.value)} placeholder="Project name" style={{ background:'var(--bg)', color:'var(--text)', border:'1px solid var(--accent)', outline:'none', padding:'4px 8px' }} />
          <button onClick={doCreate} style={{ background:'var(--accent)', color:'#00141a', border:'none', padding:'4px 8px' }}>Create</button>
        </div>
      )}

      {toDelete && (
        <div style={{ display:'flex', gap:6, alignItems:'center' }}>
          <span style={{ color:'#ff6b6b' }}>Type slug to confirm:</span>
          <input value={confirmDel} onChange={e=>setConfirmDel(e.target.value)} placeholder={toDelete} style={{ background:'var(--bg)', color:'var(--text)', border:'1px solid var(--border)', outline:'none', padding:'4px 8px' }} />
          <button disabled={confirmDel!==toDelete} onClick={doDelete} style={{ background: confirmDel===toDelete?'#ff6b6b':'#3a2020', color:'#fff', border:'none', padding:'4px 8px' }}>Confirm</button>
          <button onClick={()=>{ setToDelete(null); setConfirmDel('') }} style={{ background:'transparent', color:'var(--muted)', border:'1px solid var(--border)', padding:'4px 8px' }}>Cancel</button>
        </div>
      )}
    </div>
  )
}


