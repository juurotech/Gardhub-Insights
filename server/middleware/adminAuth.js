const { timingSafeEqual } = require('node:crypto')

function requireAdmin(req, res, next) {
  const configuredKey = process.env.ADMIN_KEY
  const suppliedKey = req.get('x-admin-key') || ''

  if (!configuredKey) {
    return res.status(503).json({ success: false, message: 'Maamulka lama hawlgelin. Deji ADMIN_KEY.' })
  }

  const supplied = Buffer.from(suppliedKey)
  const expected = Buffer.from(configuredKey)
  if (supplied.length !== expected.length || !timingSafeEqual(supplied, expected)) {
    return res.status(401).json({ success: false, message: 'Furaha tifaftiraha waa khalad.' })
  }

  next()
}

module.exports = requireAdmin