import React, { useContext } from 'react'
import { ProjectContext } from '../context/ProjectContext.jsx'

export default function FileTabs() {
  const { openTabs, activeFile, setActiveFile, closeTab } = useContext(ProjectContext)
  if (!openTabs.length) return null
  return (
    <div style={{ display:'flex', gap: 2, borderBottom: '1px solid var(--border)', background: 'var(--bg-elev)' }}>
      {openTabs.map(path => {
        const active = path === activeFile
        return (
          <div key={path} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 10px', cursor: 'pointer', color: active ? 'var(--text)' : 'var(--muted)', borderBottom: `2px solid ${active ? 'var(--accent)' : 'transparent'}`, transition:'opacity .15s' }} onClick={() => setActiveFile(path)}>
            <span style={{ fontSize: 12, opacity: .9 }}>{path.split('/').pop()}</span>
            <button onClick={(e)=>{e.stopPropagation(); closeTab(path)}} style={{ background: 'transparent', color: 'inherit' }}>✕</button>
          </div>
        )
      })}
    </div>
  )
}


