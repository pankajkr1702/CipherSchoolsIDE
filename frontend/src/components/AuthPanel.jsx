import React, { useState } from 'react'
import { apiLogin, apiRegister } from '../utils/api.js'

export default function AuthPanel({ onAuthed }) {
  const [mode, setMode] = useState('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    try {
      const res = mode === 'login' ? await apiLogin(email, password) : await apiRegister(email, password)
      localStorage.setItem('codecraft_jwt', res.token)
      onAuthed && onAuthed()
    } catch (err) {
      setError('Authentication failed')
    }
  }

  return (
    <div style={{ height:'100vh', display:'grid', placeItems:'center', background:'var(--bg)' }}>
      <form onSubmit={submit} style={{ width: 340, background:'var(--bg-elev)', border:'1px solid var(--border)', padding:20 }}>
        <div style={{ fontWeight:800, marginBottom:12 }}>CodeCraft</div>
        <div className="pane-title" style={{ boxShadow:'none', marginBottom:12 }}>{mode === 'login' ? 'Login' : 'Register'}</div>
        <div style={{ display:'grid', gap:10 }}>
          <input value={email} onChange={e=>setEmail(e.target.value)} placeholder="Email" type="email" required style={{ background:'var(--bg)', color:'var(--text)', border:'1px solid var(--accent)', padding:'8px' }} />
          <input value={password} onChange={e=>setPassword(e.target.value)} placeholder="Password" type="password" required style={{ background:'var(--bg)', color:'var(--text)', border:'1px solid var(--accent)', padding:'8px' }} />
          {error && <div style={{ color:'#ff6b6b', fontSize:12 }}>{error}</div>}
          <button type="submit" style={{ background:'var(--accent)', color:'#00141a', border:'none', padding:'10px', cursor:'pointer' }}>{mode==='login'?'Login':'Create account'}</button>
          <button type="button" onClick={()=> setMode(mode==='login'?'register':'login')} style={{ background:'transparent', color:'var(--muted)', border:'1px solid var(--border)', padding:'8px' }}>
            {mode==='login'?'Need an account? Register':'Have an account? Login'}
          </button>
        </div>
      </form>
    </div>
  )
}


