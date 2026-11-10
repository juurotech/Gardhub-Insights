require('dotenv').config({ path: require('node:path').resolve(__dirname, '../.env') })
const app = require('./app')
const connectDatabase = require('./config/database')

const port = Number(process.env.PORT) || 5000

app.listen(port, () => console.log(`Gardhub Insights API listening on http://localhost:${port}`))
connectDatabase().catch(() => {
  console.error('MongoDB is unavailable; article requests will retry the connection.')
})