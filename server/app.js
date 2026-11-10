const express = require('express')
const cors = require('cors')
const helmet = require('helmet')
const rateLimit = require('express-rate-limit')
const path = require('node:path')
const articlesRouter = require('./routes/articles')
const requireAdmin = require('./middleware/adminAuth')
const mongoose = require('mongoose')
const connectDatabase = require('./config/database')
const { AUTHOR_NAME } = require('./config/identity')

const app = express()
const contentSecurityPolicyDirectives = helmet.contentSecurityPolicy.getDefaultDirectives()
contentSecurityPolicyDirectives['img-src'] = ["'self'", 'data:', 'https:']
contentSecurityPolicyDirectives['style-src'] = ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com']
contentSecurityPolicyDirectives['font-src'] = ["'self'", 'https://fonts.gstatic.com', 'data:']
contentSecurityPolicyDirectives['frame-src'] = ["'self'", 'https://www.youtube-nocookie.com']

app.disable('x-powered-by')
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  contentSecurityPolicy: {
    directives: contentSecurityPolicyDirectives,
  },
}))
app.use(cors({ origin: process.env.CLIENT_ORIGIN ? process.env.CLIENT_ORIGIN.split(',').map((origin) => origin.trim()) : true }))
app.use(express.json({ limit: '120kb' }))
app.use('/api', rateLimit({ windowMs: 15 * 60 * 1000, limit: 300, standardHeaders: 'draft-7', legacyHeaders: false }))

app.get('/api/health', (req, res) => {
  const readyState = mongoose.connection.readyState
  res.status(readyState === 1 ? 200 : 503).json({
    success: readyState === 1,
    database: readyState === 1 ? 'connected' : 'disconnected',
  })
})
app.post('/api/admin/verify', requireAdmin, (req, res) => {
  res.json({ success: true, data: { author: AUTHOR_NAME } })
})
app.use('/api/articles', async (req, res, next) => {
  try {
    await connectDatabase()
    next()
  } catch {
    res.status(503).json({ success: false, message: 'Database lama heli karo. Hubi in MongoDB shaqaynayo.' })
  }
})
app.use('/api/articles', articlesRouter)

if (process.env.NODE_ENV === 'production') {
  const clientDist = path.resolve(__dirname, '../client/dist')
  app.use(express.static(clientDist))
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api/')) return next()
    res.sendFile(path.join(clientDist, 'index.html'))
  })
}

app.use((req, res) => res.status(404).json({ success: false, message: 'Waddada la codsaday lama helin.' }))
app.use((error, req, res, next) => {
  if (res.headersSent) return next(error)
  const status = error.status || (error.type === 'entity.parse.failed' ? 400 : 500)
  if (status >= 500) console.error(error)
  res.status(status).json({ success: false, message: status === 500 ? 'Cilad server ayaa dhacday.' : error.message })
})

module.exports = app