import React, { useContext, useMemo } from 'react'
import { SandpackPreview, SandpackConsole } from '@codesandbox/sandpack-react'
import { ProjectContext } from '../context/ProjectContext.jsx'

export default function Preview() {
  const { filesMap, activeFile } = useContext(ProjectContext)
  const files = useMemo(() => filesMap, [filesMap])
  return (
    <div className="column">
      <div className="pane-title">Preview</div>
      <div className="column-content">
        <div style={{ display:'flex', height:'100%' }}>
          <div style={{ flex: 2, minWidth: 0 }}>
            <SandpackPreview />
          </div>
          <div style={{ flex: 1, minWidth: 0, borderLeft:'1px solid var(--border)' }}>
            <SandpackConsole showHeader />
          </div>
        </div>
      </div>
    </div>
  )
}


