import { ProjectProvider } from './context/ProjectContext.jsx'
import Header from './components/Header.jsx'
import Explorer from './components/Explorer.jsx'
import Editor from './components/Editor.jsx'
import Preview from './components/Preview.jsx'
import ProjectSelector from './components/ProjectSelector.jsx'
import AuthPanel from './components/AuthPanel.jsx'
import React, { useEffect, useState } from 'react'
import { SandpackProvider, SandpackLayout } from '@codesandbox/sandpack-react'
import { ProjectContext } from './context/ProjectContext.jsx'

export default function App() {
  const [authed, setAuthed] = useState(false)
  useEffect(()=>{ setAuthed(!!localStorage.getItem('codecraft_jwt')) }, [])
  if (!authed) return <AuthPanel onAuthed={()=> setAuthed(true)} />
  return (
    <ProjectProvider>
      <SandpackRoot />
    </ProjectProvider>
  )
}

function SandpackRoot() {
  const { filesMap, activeFile, loading } = React.useContext(ProjectContext) || { filesMap: {}, activeFile: '', loading: true }
  const files = React.useMemo(() => {
    const f = { ...(filesMap || {}) }
    // Ensure required React template files exist
    if (!f['/index.js']) {
      f['/index.js'] = "import React from 'react'\nimport { createRoot } from 'react-dom/client'\nimport App from './App.js'\nconst root = createRoot(document.getElementById('root'))\nroot.render(<App />)\n"
    }
    if (!f['/App.js']) {
      f['/App.js'] = "import React from 'react'\nexport default function App(){return <div style={{padding:20}}>Hello</div>}\n"
    }
    if (!f['/public/index.html']) {
      f['/public/index.html'] = "<!doctype html><html><head><meta charset=\"UTF-8\"/><meta name=\"viewport\" content=\"width=device-width, initial-scale=1\"/><title>CodeCraft</title></head><body><div id=\"root\"></div></body></html>"
    }
    return f
  }, [filesMap])
  
  const active = React.useMemo(() => {
    if (files && files[activeFile]) return activeFile
    if (files && files['/App.js']) return '/App.js'
    const keys = Object.keys(files || {})
    return keys[0] || '/App.js'
  }, [files, activeFile])
  
  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
        <Header />
        <div style={{ padding:'6px 12px', borderBottom:'1px solid var(--border)', background:'var(--bg-elev)' }}>
          <ProjectSelector />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 1 }}>
          <div style={{ color: 'var(--muted)' }}>Loading project...</div>
        </div>
      </div>
    )
  }
  
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      <Header />
      <div style={{ padding:'6px 12px', borderBottom:'1px solid var(--border)', background:'var(--bg-elev)' }}>
        <ProjectSelector />
      </div>
      <SandpackProvider files={files} template="react" options={{ visibleFiles: Object.keys(files || {}), activeFile: active, recompileMode: 'immediate' }}>
        <SandpackLayout>
          <div className="ide-grid">
            <aside className="column" style={{ borderRight: '1px solid var(--border)' }}>
              <div className="pane-title">Explorer</div>
              <Explorer />
            </aside>
            <Editor />
            <Preview />
          </div>
        </SandpackLayout>
      </SandpackProvider>
    </div>
  )
}


