import React, { useContext, useMemo, useState, useRef } from 'react'
import { ProjectContext } from '../context/ProjectContext.jsx'
import { canMove, moveNode } from '../utils/dndHelpers.js'

function FolderIcon({ open }) {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
      <path d="M3 6h6l2 2h10v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6z" stroke="var(--accent)" strokeWidth="1.5" fill={open ? 'rgba(0,229,255,0.08)' : 'transparent'} />
    </svg>
  )
}

function FileIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
      <path d="M6 2h7l5 5v15a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2z" stroke="var(--accent)" strokeWidth="1.5" fill="transparent" />
    </svg>
  )
}

function Node({ node, depth, expanded, toggle, onOpen, onCreateFile, onCreateFolder, onDelete, activeFile, startRename, dragging, onDragStart, onDragOverItem, onDropItem }) {
  const pad = 10 + depth * 14
  if (node.type === 'folder') {
    const isOpen = expanded.has(node.path)
    return (
      <div onDragOver={(e)=> onDragOverItem(e, node)} onDrop={(e)=> onDropItem(e, node, 'into')}>
        <div className="explorer-item" draggable onDragStart={(e)=> onDragStart(e, node)} style={{ paddingLeft: pad }} onClick={() => toggle(node.path)}>
          <span className="icon" style={{ color: 'var(--accent)' }}>{isOpen ? '▾' : '▸'}</span>
          <FolderIcon open={isOpen} />
          <span style={{ fontWeight: 600 }}>{node.name}</span>
          <div style={{ marginLeft: 'auto', display: 'flex', gap: 6 }}>
            <button onClick={(e)=>{e.stopPropagation(); onCreateFile(node.path)}} title="New file" style={{ background: 'transparent', color: 'var(--muted)' }}>＋F</button>
            <button onClick={(e)=>{e.stopPropagation(); onCreateFolder(node.path + '/') }} title="New folder" style={{ background: 'transparent', color: 'var(--muted)' }}>＋D</button>
            {node.path !== '/' && <button onClick={(e)=>{e.stopPropagation(); onDelete(node.path)}} title="Delete" style={{ background: 'transparent', color: 'var(--muted)' }}>✕</button>}
          </div>
        </div>
        {isOpen && (node.children || []).map(child => (
          <Node key={child.path} node={child} depth={depth+1} expanded={expanded} toggle={toggle} onOpen={onOpen} onCreateFile={onCreateFile} onCreateFolder={onCreateFolder} onDelete={onDelete} activeFile={activeFile} startRename={startRename} dragging={dragging} onDragStart={onDragStart} onDragOverItem={onDragOverItem} onDropItem={onDropItem} />
        ))}
      </div>
    )
  }
  const isActive = node.path === activeFile
  return (
    <div className="explorer-item" draggable onDragStart={(e)=> onDragStart(e, node)} onDragOver={(e)=> onDragOverItem(e, node)} onDrop={(e)=> onDropItem(e, node, 'after')} style={{ paddingLeft: pad, borderLeftColor: isActive ? 'var(--accent)' : 'transparent', background: isActive ? 'rgba(0,229,255,0.06)' : 'transparent', position:'relative' }} onClick={() => onOpen(node.path)}>
      <FileIcon />
      <span onDoubleClick={()=> startRename(node)}>{node.name}</span>
      <button onClick={(e)=>{e.stopPropagation(); onDelete(node.path)}} title="Delete" style={{ background: 'transparent', marginLeft: 'auto', color: 'var(--muted)' }}>✕</button>
    </div>
  )
}

export default function Explorer() {
  const { tree, openFile, createFile, createFolder, deleteNode, activeFile, setTree } = useContext(ProjectContext)
  const [expanded, setExpanded] = useState(() => new Set(['/','/src','/public']))
  const toggle = (path) => setExpanded(prev => { const next = new Set(prev); next.has(path) ? next.delete(path) : next.add(path); return next })
  const [renaming, setRenaming] = useState(null)
  const [renameVal, setRenameVal] = useState('')
  const [renameErr, setRenameErr] = useState('')
  const dragRef = useRef(null)
  const [hoverPath, setHoverPath] = useState(null)
  const [hoverKind, setHoverKind] = useState(null) // 'into' | 'after'

  const startRename = (node) => { setRenaming(node.path); setRenameVal(node.name); setRenameErr('') }
  const commitRename = () => {
    if (!renaming) return
    const parts = renaming.split('/')
    const parentPath = parts.slice(0,-1).join('/') || '/'
    const newName = renameVal.trim()
    if (!newName) { setRenameErr('Name required'); return }
    // uniqueness among siblings
    const parent = findNode(tree, parentPath)
    if (parent && parent.children?.some(c => c.name === newName)) { setRenameErr('Duplicate name'); return }
    const updated = renameNode(tree, renaming, newName)
    setRenaming(null); setTree(updated)
  }
  const cancelRename = () => { setRenaming(null); setRenameErr('') }

  function findNode(node, path) {
    if (node.path === path) return node
    for (const c of node.children || []) { const f = findNode(c, path); if (f) return f }
    return null
  }
  function renameNode(root, targetPath, newName) {
    const clone = structuredClone(root)
    function walk(node) {
      for (const c of node.children || []) {
        if (c.path === targetPath) {
          c.name = newName
          rebase(c, node.path === '/' ? '' : node.path)
        } else {
          walk(c)
        }
      }
    }
    function rebase(node, parentPath) {
      node.path = (parentPath ? parentPath : '') + '/' + node.name
      if (node.children) node.children.forEach(ch => rebase(ch, node.path))
    }
    walk(clone)
    return clone
  }

  const onDragStart = (e, node) => { dragRef.current = node; e.dataTransfer.effectAllowed = 'move' }
  const onDragOverItem = (e, node) => { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; setHoverPath(node.path); }
  const onDropItem = (e, node, position) => {
    e.preventDefault()
    const from = dragRef.current
    if (!from) return
    const targetPath = node.path
    if (!canMove(from.path, targetPath)) return
    const updated = moveNode(tree, from.path, targetPath, position)
    setTree(updated)
    dragRef.current = null
    setHoverPath(null); setHoverKind(null)
  }

  const onDragLeave = () => { setHoverPath(null); setHoverKind(null) }

  const onKeyDown = (e) => {
    if (e.key === 'Enter') {
      // start rename on active file
      const node = findNode(tree, activeFile)
      if (node) startRename(node)
    }
    if (e.key === 'Escape' && renaming) cancelRename()
  }
  if (!tree) return null
  return (
    <div className="column-content explorer" tabIndex={0} onKeyDown={onKeyDown}>
      <div className="section">project</div>
      <Node node={tree} depth={0} expanded={expanded} toggle={toggle} onOpen={openFile} onCreateFile={createFile} onCreateFolder={createFolder} onDelete={deleteNode} activeFile={activeFile} startRename={startRename} dragging={dragRef} onDragStart={onDragStart} onDragOverItem={(e,n)=>{ setHoverKind('into'); onDragOverItem(e,n) }} onDropItem={(e,n,pos)=>{ setHoverKind(pos); onDropItem(e,n,pos) }} onDragLeave={onDragLeave} />

      {renaming && (
        <div style={{ position:'fixed', inset:'auto auto 16px 16px', background:'var(--bg-elev)', border:'1px solid var(--accent)', padding:8 }}>
          <div style={{ fontSize:12, marginBottom:6, color:'var(--muted)' }}>Rename</div>
          <input autoFocus value={renameVal} onChange={e=>{ setRenameVal(e.target.value); setRenameErr('') }} onKeyDown={(e)=>{ if(e.key==='Enter') commitRename(); if(e.key==='Escape') cancelRename() }} style={{ background:'var(--bg)', color:'var(--text)', border:'1px solid var(--accent)', outline:'none', padding:'4px 8px', minWidth:200 }} />
          {renameErr && <div style={{ color:'#ff6b6b', fontSize:12, marginTop:6 }}>{renameErr}</div>}
        </div>
      )}
    </div>
  )
}
