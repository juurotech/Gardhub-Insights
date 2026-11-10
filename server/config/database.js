const mongoose = require('mongoose')

let cached = global.gardhubMongoose
if (!cached) {
  cached = global.gardhubMongoose = { connection: null, promise: null }
}

async function connectDatabase() {
  const readyState = mongoose.connection.readyState
  if (readyState === 1) {
    cached.connection = mongoose.connection
    return cached.connection
  }
  if (readyState === 2 && cached.promise) return cached.promise

  cached.connection = null
  cached.promise = null

  if (!cached.promise) {
    const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/gardhub_insights'
    cached.promise = mongoose.connect(uri, { serverSelectionTimeoutMS: 10000 })
  }

  const connectionPromise = cached.promise
  try {
    cached.connection = await connectionPromise
    return cached.connection
  } catch (error) {
    if (cached.promise === connectionPromise) cached.promise = null
    throw error
  }
}

module.exports = connectDatabase