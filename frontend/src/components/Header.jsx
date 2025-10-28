import React, { useContext } from 'react'
import { isAuthed, logout } from '../utils/auth.js'
import { ProjectContext } from '../context/ProjectContext.jsx'

export default function Header() {
  const { saving } = useContext(ProjectContext) || { saving: false }
  
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 12px', borderBottom: '1px solid var(--border)', background: 'var(--bg-elev)' }}>
      <div style={{ fontWeight: 800, letterSpacing: .4 }}>CodeCraft</div>
      <div style={{ opacity: .7, fontSize: 12 }}>React IDE</div>
      <div style={{ marginLeft: 'auto', display: 'flex', gap: 8, alignItems: 'center' }}>
        {saving && (
          <div style={{ fontSize: 12, color: 'var(--accent)', display: 'flex', alignItems: 'center', gap: 4 }}>
            <div style={{ width: 12, height: 12, border: '2px solid var(--accent)', borderTop: '2px solid transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
            Saving...
          </div>
        )}
        {isAuthed() && (
          <button onClick={()=> logout('Logged out')} title="Logout" style={{ background:'transparent', color:'var(--accent)', border:'1px solid var(--border)', padding:'6px 10px', display:'flex', alignItems:'center', gap:6, cursor:'pointer' }}>
            <span>⇦</span>
            <span>Logout</span>
          </button>
        )}
      </div>
    </div>
  )
}


