import React, { useContext, useMemo } from 'react'
import { SandpackCodeEditor } from '@codesandbox/sandpack-react'
import { ProjectContext } from '../context/ProjectContext.jsx'
import FileTabs from './FileTabs.jsx'

export default function Editor() {
  const { tree, filesMap, activeFile, updateFileContent } = useContext(ProjectContext)
  const files = useMemo(() => filesMap, [filesMap])
  if (!tree) return null
  return (
    <div className="column" style={{ borderRight: '1px solid var(--border)' }}>
      <div className="pane-title">Editor</div>
      <FileTabs />
      <div className="column-content">
        <SandpackCodeEditor
          key={activeFile}
          showTabs={false}
          showLineNumbers
          wrapContent
          onChange={(code) => updateFileContent(activeFile, code)}
        />
      </div>
    </div>
  )
}


