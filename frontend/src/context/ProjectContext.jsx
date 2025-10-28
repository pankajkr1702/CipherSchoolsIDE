import React, { createContext, useCallback, useEffect, useMemo, useState } from 'react'
import { loadProjectState, saveProjectState, getProjectId } from '../utils/storage.js'
import { buildInitialTree, treeToFilesMap, upsertFileInTree, upsertFolderInTree, deleteNodeInTree, findFirstFilePath, flattenTreeToFiles, buildTreeFromFiles, joinPath } from '../utils/fileHelpers.js'
import { apiListProjects, apiCreateProject, apiGetProject, apiDeleteProject, apiUpsertFile, apiDeleteFile } from '../utils/api.js'

export const ProjectContext = createContext(null)

export function ProjectProvider({ children }) {
  const [projectId, setProjectId] = useState(() => getProjectId())
  const [tree, setTree] = useState(null)
  const [openTabs, setOpenTabs] = useState([])
  const [activeFile, setActiveFile] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  // Listen for project changes
  useEffect(() => {
    const handleProjectChange = (event) => {
      const newProjectId = event.detail?.projectId || getProjectId()
      if (newProjectId !== projectId) {
        setProjectId(newProjectId)
      }
    }
    const handleStorageChange = () => {
      const newProjectId = getProjectId()
      if (newProjectId !== projectId) {
        setProjectId(newProjectId)
      }
    }
    window.addEventListener('projectChanged', handleProjectChange)
    window.addEventListener('storage', handleStorageChange)
    return () => {
      window.removeEventListener('projectChanged', handleProjectChange)
      window.removeEventListener('storage', handleStorageChange)
    }
  }, [projectId])

  useEffect(() => {
    setLoading(true)
    ;(async () => {
      try {
        const remote = await apiGetProject(projectId)
        if (remote && remote.files) {
          const tree = buildTreeFromFiles(remote.files)
          setTree(tree)
          const first = findFirstFilePath(tree)
          setOpenTabs([first].filter(Boolean))
          setActiveFile(first || '')
          setLoading(false)
          return
        }
      } catch {}
      const loaded = loadProjectState(projectId)
      if (loaded) {
        setTree(loaded.tree)
        setOpenTabs(loaded.openTabs || [])
        setActiveFile(loaded.activeFile || findFirstFilePath(loaded.tree) || '/src/App.js')
      } else {
        const initialTree = buildInitialTree()
        setTree(initialTree)
        const first = findFirstFilePath(initialTree)
        setOpenTabs(first ? [first] : [])
        setActiveFile(first || '')
      }
      setLoading(false)
    })()
  }, [projectId])

  useEffect(() => {
    if (!tree) return
    saveProjectState(projectId, { tree, openTabs, activeFile })
  }, [projectId, tree, openTabs, activeFile])

  // Separate effect for backend sync with better debouncing
  useEffect(() => {
    if (!tree) return
    setSaving(true)
    const id = setTimeout(() => {
      ;(async () => {
        try {
          // Ensure a project document exists before syncing files
          const token = localStorage.getItem('codecraft_jwt')
          if (token) {
            const existing = await apiGetProject(projectId)
            if (!existing) {
              try { await apiCreateProject(projectId, projectId) } catch {}
            }
          }
          const files = flattenTreeToFiles(tree)
          const promises = files.map(f => 
            apiUpsertFile(projectId, { 
              fileId: f.fileId, 
              name: f.name, 
              type: f.type, 
              parentId: f.parentId || null, 
              content: f.content || '' 
            })
          )
          await Promise.all(promises)
          console.log(`Synced ${files.length} files to backend`)
        } catch (error) {
          console.error('Backend sync failed:', error)
        } finally {
          setSaving(false)
        }
      })()
    }, 1000) // Increased debounce time for better performance
    return () => clearTimeout(id)
  }, [projectId, tree])

  const filesMap = useMemo(() => tree ? treeToFilesMap(tree) : {}, [tree, activeFile])

  const openFile = useCallback((path) => {
    setActiveFile(path)
    setOpenTabs((tabs) => tabs.includes(path) ? tabs : [...tabs, path])
  }, [])

  const closeTab = useCallback((path) => {
    setOpenTabs((tabs) => {
      const next = tabs.filter(t => t !== path)
      if (path === activeFile) {
        const fallback = next[next.length - 1] || findFirstFilePath(tree) || ''
        setActiveFile(fallback)
      }
      return next
    })
  }, [activeFile, tree])

  const updateFileContent = useCallback((path, code) => {
    setTree((t) => upsertFileInTree(t, path, code))
  }, [])

  const createFile = useCallback((parentPath) => {
    const target = joinPath(parentPath, 'untitled.js')
    setTree((t) => upsertFileInTree(t, target, '// new file'))
  }, [])

  const createFolder = useCallback((parentPath) => {
    const target = joinPath(parentPath, 'NewFolder')
    setTree((t) => upsertFolderInTree(t, target))
  }, [])

  const deleteNode = useCallback((path) => {
    setTree((t) => deleteNodeInTree(t, path))
    setOpenTabs((tabs) => tabs.filter(t => !t.startsWith(path)))
    if (activeFile.startsWith(path)) setActiveFile(findFirstFilePath(tree) || '')
  }, [activeFile, tree])

  const value = {
    projectId,
    tree,
    filesMap,
    openTabs,
    activeFile,
    loading,
    saving,
    setTree,
    setActiveFile,
    openFile,
    closeTab,
    updateFileContent,
    createFile,
    createFolder,
    deleteNode,
  }

  return (
    <ProjectContext.Provider value={value}>{children}</ProjectContext.Provider>
  )
}


