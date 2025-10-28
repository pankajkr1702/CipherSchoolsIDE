// Tree node shape
// { type: 'folder'|'file', name, path, children?, content? }

export function buildInitialTree() {
  return {
    type: 'folder', name: '/', path: '/', children: [
      { type: 'file', name: 'index.js', path: '/index.js', content: `import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.js'

const root = createRoot(document.getElementById('root'))
root.render(<App />)
` },
      { type: 'file', name: 'App.js', path: '/App.js', content: `import React from 'react'
import './styles.css'

export default function App() {
  return (
    <div className="app">
      <h1>CodeCraft</h1>
      <p>Edit files to see live updates.</p>
    </div>
  )
}
` },
      { type: 'file', name: 'styles.css', path: '/styles.css', content: `body{margin:0;background:#0b0d12;color:#e6e6e6;font-family:Inter,ui-sans-serif,system-ui,Segoe UI,Helvetica,Arial,sans-serif}` },
      { type: 'folder', name: 'public', path: '/public', children: [
        { type: 'file', name: 'index.html', path: '/public/index.html', content: `<!doctype html>
<html><head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width, initial-scale=1"/><title>CodeCraft</title></head><body style="margin:0;background:#0b0d12;color:#e6e6e6"><div id="root"></div></body></html>` },
      ] },
    ]
  }
}

export function treeToFilesMap(node, files = {}) {
  if (!node) return files
  if (node.type === 'file') files[node.path] = node.content || ''
  if (node.children) node.children.forEach(child => treeToFilesMap(child, files))
  return files
}

export function findFirstFilePath(node) {
  if (!node) return ''
  if (node.type === 'file') return node.path
  for (const child of node.children || []) {
    const f = findFirstFilePath(child)
    if (f) return f
  }
  return ''
}

export function upsertFileInTree(tree, path, content) {
  const parts = path.split('/').filter(Boolean)
  const clone = structuredClone(tree)
  let curr = clone
  let currPath = ''
  for (let i = 0; i < parts.length; i++) {
    const name = parts[i]
    currPath += '/' + name
    const isLast = i === parts.length - 1
    if (!curr.children) curr.children = []
    let next = curr.children.find(c => c.name === name)
    if (!next) {
      next = isLast ? { type: 'file', name, path: currPath, content: content || '' } : { type: 'folder', name, path: currPath, children: [] }
      curr.children.push(next)
    }
    if (isLast) {
      next.type = 'file'
      next.content = content != null ? content : (next.content || '')
    }
    curr = next
  }
  return clone
}

export function upsertFolderInTree(tree, path) {
  const parts = path.split('/').filter(Boolean)
  const clone = structuredClone(tree)
  let curr = clone
  let currPath = ''
  for (let i = 0; i < parts.length; i++) {
    const name = parts[i]
    currPath += '/' + name
    if (!curr.children) curr.children = []
    let next = curr.children.find(c => c.name === name)
    if (!next) {
      next = { type: 'folder', name, path: currPath, children: [] }
      curr.children.push(next)
    }
    curr = next
  }
  return clone
}

export function deleteNodeInTree(tree, targetPath) {
  const clone = structuredClone(tree)
  function walk(node, parent) {
    if (!node.children) return
    node.children = node.children.filter(child => child.path !== targetPath)
    node.children.forEach(child => walk(child, node))
  }
  walk(clone, null)
  return clone
}

export function flattenTreeToFiles(node, list = [], parentId = null) {
  const id = node.path
  if (node.path !== '/') {
    list.push({ fileId: id, name: node.name, type: node.type, parentId, content: node.content || '' })
  }
  if (node.children) node.children.forEach(child => flattenTreeToFiles(child, list, id))
  return list
}

export function buildTreeFromFiles(files) {
  const root = { type: 'folder', name: '/', path: '/', children: [] }
  const byId = { '/': root }
  // ensure folder entries exist for all parent paths
  function ensureFolder(path) {
    if (!path || path === '/') return root
    if (byId[path]) return byId[path]
    const parts = path.split('/').filter(Boolean)
    let currPath = ''
    let parent = root
    for (let i = 0; i < parts.length; i++) {
      currPath += '/' + parts[i]
      if (!byId[currPath]) {
        byId[currPath] = { type: 'folder', name: parts[i], path: currPath, children: [] }
        parent.children.push(byId[currPath])
      }
      parent = byId[currPath]
    }
    return byId[path]
  }

  files.forEach(f => {
    // Create file node
    byId[f.fileId] = { type: f.type, name: f.name, path: f.fileId, content: f.content, children: [] }
    // Ensure parent chain exists
    ensureFolder(f.parentId || '/')
  })
  files.forEach(f => {
    const parent = byId[f.parentId || '/'] || ensureFolder(f.parentId || '/')
    if (parent) parent.children.push(byId[f.fileId])
  })
  return root
}

export function joinPath(parentPath, nameWithOptionalSlash) {
  const a = (parentPath || '/').replace(/\/+$/,'') || '/'
  const b = String(nameWithOptionalSlash || '').replace(/^\/+/, '')
  if (a === '/') return '/' + b
  return a + '/' + b
}


