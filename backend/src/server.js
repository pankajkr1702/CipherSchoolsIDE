import express from 'express'
import cors from 'cors'
import morgan from 'morgan'
import dotenv from 'dotenv'
import mongoose from 'mongoose'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'

dotenv.config()

const app = express()
app.use(cors())
app.use(express.json({ limit: '2mb' }))
app.use(morgan('dev'))

const MONGO_URI = 'mongodb+srv://nandanupadhyay1234:pkPPznLjgogmQZkC@cluster0.5ltnqvy.mongodb.net/codekraft'
await mongoose.connect(MONGO_URI)
const JWT_SECRET = 'dev-secret'

const projectSchema = new mongoose.Schema({
  id: { type: String, unique: true, index: true },
  name: { type: String, required: true },
  ownerId: { type: String, index: true, required: true },
  createdAt: { type: Number, required: true },
  lastModified: { type: Number, required: true }
}, { versionKey: false })

const fileSchema = new mongoose.Schema({
  projectId: { type: String, index: true, required: true },
  fileId: { type: String, index: true, required: true },
  name: { type: String, required: true },
  type: { type: String, enum: ['file', 'folder'], required: true },
  parentId: { type: String, default: null },
  content: { type: String, default: '' }
}, { versionKey: false })

const Project = mongoose.model('Project', projectSchema)
const File = mongoose.model('File', fileSchema)

// Users
const userSchema = new mongoose.Schema({
  email: { type: String, unique: true, index: true },
  passwordHash: { type: String, required: true },
  createdAt: { type: Number, required: true }
}, { versionKey: false })
const User = mongoose.model('User', userSchema)

function signToken(user) {
  return jwt.sign({ sub: user._id.toString(), email: user.email }, JWT_SECRET, { expiresIn: '7d' })
}

function authMiddleware(req, res, next) {
  const h = req.headers.authorization || ''
  const token = h.startsWith('Bearer ') ? h.slice(7) : null
  if (!token) return res.status(401).json({ error: 'unauthorized' })
  try {
    const payload = jwt.verify(token, JWT_SECRET)
    req.user = payload
    next()
  } catch {
    return res.status(401).json({ error: 'unauthorized' })
  }
}

// health
app.get('/health', (req, res) => res.json({ ok: true }))

// Auth
app.post('/auth/register', async (req, res) => {
  const { email, password } = req.body
  if (!email || !password) return res.status(400).json({ error: 'missing_fields' })
  const exists = await User.findOne({ email })
  if (exists) return res.status(409).json({ error: 'exists' })
  const passwordHash = await bcrypt.hash(password, 10)
  const user = await User.create({ email, passwordHash, createdAt: Date.now() })
  const token = signToken(user)
  res.status(201).json({ token })
})

app.post('/auth/login', async (req, res) => {
  const { email, password } = req.body
  const user = await User.findOne({ email })
  if (!user) return res.status(401).json({ error: 'invalid_credentials' })
  const ok = await bcrypt.compare(password, user.passwordHash)
  if (!ok) return res.status(401).json({ error: 'invalid_credentials' })
  const token = signToken(user)
  res.json({ token })
})

// Projects CRUD
app.get('/api/projects', authMiddleware, async (req, res) => {
  const list = await Project.find({ ownerId: req.user.sub }).sort({ lastModified: -1 })
  res.json(list)
})

app.post('/api/projects', authMiddleware, async (req, res) => {
  const { id, name } = req.body
  const now = Date.now()
  const existing = await Project.findOne({ id })
  if (existing) return res.status(409).json({ error: 'exists' })
  const doc = await Project.create({ id, name: name || id, ownerId: req.user.sub, createdAt: now, lastModified: now })
  // seed starter files (root-level to match Sandpack and frontend)
  const seed = [
    { fileId: '/index.js', name: 'index.js', type: 'file', parentId: '/', content: `import React from 'react'\nimport { createRoot } from 'react-dom/client'\nimport App from './App.js'\n\nconst root = createRoot(document.getElementById('root'))\nroot.render(<App />)\n` },
    { fileId: '/App.js', name: 'App.js', type: 'file', parentId: '/', content: `import React from 'react'\nimport './styles.css'\n\nexport default function App() {\n  return (\n    <div className=\"app\">\n      <h1>CodeCraft</h1>\n      <p>Starter project ready. Edit files to see live updates.</p>\n    </div>\n  )\n}\n` },
    { fileId: '/styles.css', name: 'styles.css', type: 'file', parentId: '/', content: `body{margin:0;background:#0b0d12;color:#e6e6e6;font-family:Inter,ui-sans-serif,system-ui,Segoe UI,Helvetica,Arial,sans-serif}` },
    { fileId: '/public/index.html', name: 'index.html', type: 'file', parentId: '/public', content: `<!doctype html><html><head><meta charset=\"UTF-8\"/><meta name=\"viewport\" content=\"width=device-width, initial-scale=1\"/><title>CodeCraft</title></head><body style=\"margin:0;background:#0b0d12;color:#e6e6e6\"><div id=\"root\"></div></body></html>` },
  ]
  await File.insertMany(seed.map(f => ({ ...f, projectId: id })))
  await Project.updateOne({ id }, { $set: { lastModified: Date.now() } })
  res.status(201).json(doc)
})

app.get('/api/projects/:id', authMiddleware, async (req, res) => {
  const project = await Project.findOne({ id: req.params.id, ownerId: req.user.sub })
  if (!project) return res.status(404).json({ error: 'not_found' })
  const files = await File.find({ projectId: project.id })
  res.json({ project, files })
})

app.delete('/api/projects/:id', authMiddleware, async (req, res) => {
  const id = req.params.id
  const proj = await Project.findOne({ id, ownerId: req.user.sub })
  if (!proj) return res.status(404).json({ error: 'not_found' })
  await File.deleteMany({ projectId: id })
  await Project.deleteOne({ id })
  res.json({ ok: true })
})

// Files CRUD
app.post('/api/projects/:id/files', authMiddleware, async (req, res) => {
  const projectId = req.params.id
  const { fileId, name, type, parentId, content } = req.body
  const now = Date.now()
  const exists = await File.findOne({ projectId, fileId })
  if (exists) return res.status(409).json({ error: 'exists' })
  const file = await File.create({ projectId, fileId, name, type, parentId: parentId || null, content: content || '' })
  await Project.updateOne({ id: projectId }, { $set: { lastModified: now } })
  res.status(201).json(file)
})

app.put('/api/projects/:id/files/:fileId', authMiddleware, async (req, res) => {
  const projectId = req.params.id
  const fileId = req.params.fileId
  const update = req.body
  const now = Date.now()
  const file = await File.findOneAndUpdate({ projectId, fileId }, update, { new: true })
  if (!file) return res.status(404).json({ error: 'not_found' })
  await Project.updateOne({ id: projectId }, { $set: { lastModified: now } })
  res.json(file)
})

app.delete('/api/projects/:id/files/:fileId', authMiddleware, async (req, res) => {
  const projectId = req.params.id
  const fileId = req.params.fileId
  const now = Date.now()
  await File.deleteOne({ projectId, fileId })
  await Project.updateOne({ id: projectId }, { $set: { lastModified: now } })
  res.json({ ok: true })
})

const PORT = process.env.PORT || 4000
app.listen(PORT, () => console.log(`CodeCraft API running on :${PORT}`))

