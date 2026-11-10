require('dotenv').config({ path: require('node:path').resolve(__dirname, '../.env') })
const app = require('../server/app')
const connectDatabase = require('../server/config/database')

module.exports = async (req, res) => {
  try {
    await connectDatabase()
    return app(req, res)
  } catch (error) {
    console.error('MongoDB connection failed:', error.message)
    return res.status(503).json({ success: false, message: 'Database lama heli karo.' })
  }
}