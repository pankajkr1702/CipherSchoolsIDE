export function isAuthed() {
  return !!localStorage.getItem('codecraft_jwt')
}

export function logout(message = 'Logged out') {
  try {
    localStorage.removeItem('codecraft_jwt')
    sessionStorage.removeItem('codecraft_active_project')
  } catch {}
  // naive toast
  try {
    const el = document.createElement('div')
    el.textContent = message
    el.style.cssText = 'position:fixed;top:12px;right:12px;background:var(--bg-elev);color:var(--text);border:1px solid var(--border);padding:8px 12px;z-index:9999'
    document.body.appendChild(el)
    setTimeout(()=> el.remove(), 1500)
  } catch {}
  window.location.reload()
}

