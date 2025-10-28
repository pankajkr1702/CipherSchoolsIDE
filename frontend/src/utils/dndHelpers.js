export function canMove(nodePath, targetPath) {
  if (nodePath === '/' || targetPath == null) return false
  if (nodePath === targetPath) return false
  // prevent moving into own descendant
  if (targetPath.startsWith(nodePath + '/')) return false
  return true
}

export function moveNode(tree, nodePath, targetPath, position = 'into') {
  // position: 'into' (as child) or 'after' (reorder among siblings)
  const clone = structuredClone(tree)
  let removed = null
  function remove(node) {
    if (!node.children) return
    node.children = node.children.filter(c => {
      if (c.path === nodePath) { removed = c; return false }
      return true
    })
    node.children.forEach(remove)
  }
  remove(clone)
  if (!removed) return tree

  function insertInto(node) {
    if (node.path === targetPath) {
      node.children = node.children || []
      // adjust paths below
      const base = removed.name
      const newPath = node.path === '/' ? `/${base}` : `${node.path}/${base}`
      rebasePaths(removed, node.path === '/' ? '' : node.path)
      removed.path = newPath
      node.children.push(removed)
      return true
    }
    return (node.children || []).some(insertInto)
  }

  function insertAfter(node) {
    if (!node.children) return false
    const idx = node.children.findIndex(c => c.path === targetPath)
    if (idx !== -1) {
      // same parent; insert after target
      const parentPath = node.path
      rebasePaths(removed, parentPath === '/' ? '' : parentPath)
      node.children.splice(idx + 1, 0, removed)
      return true
    }
    return node.children.some(insertAfter)
  }

  function rebasePaths(node, parentPath) {
    const here = parentPath === '' || parentPath === '/' ? `/${node.name}` : `${parentPath}/${node.name}`
    node.path = here
    if (node.children) node.children.forEach(child => rebasePaths(child, here))
  }

  if (position === 'into') insertInto(clone)
  else insertAfter(clone)
  return clone
}


