export function slugify(input) {
  const base = String(input || '')
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
    .slice(0, 30)
    .replace(/^-+|-+$/g, '')
  return base || 'project'
}

export function uniqueSlug(base, existing) {
  let slug = base
  let n = 1
  const set = new Set(existing || [])
  while (set.has(slug)) {
    slug = `${base}-${n++}`
  }
  return slug
}


