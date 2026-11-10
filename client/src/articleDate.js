const articleDateFormatter = new Intl.DateTimeFormat('so-SO', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
  hourCycle: 'h23',
  timeZone: 'UTC',
})

const relativeUnits = [
  { unit: 'year', seconds: 31536000, singular: 'sano', plural: 'sano' },
  { unit: 'month', seconds: 2592000, singular: 'bil', plural: 'bilood' },
  { unit: 'day', seconds: 86400, singular: 'maalin', plural: 'maalmood' },
  { unit: 'hour', seconds: 3600, singular: 'saac', plural: 'saac' },
  { unit: 'minute', seconds: 60, singular: 'daqiiqo', plural: 'daqiiqo' },
  { unit: 'second', seconds: 1, singular: 'ilbiriqsi', plural: 'ilbiriqsi' },
]

export function formatArticleDate(value) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  return `${articleDateFormatter.format(date)} UTC`
}

export function formatRelativeArticleDate(value, now = Date.now()) {
  const timestamp = new Date(value).getTime()
  if (!Number.isFinite(timestamp)) return ''

  const differenceSeconds = (now - timestamp) / 1000
  if (Math.abs(differenceSeconds) < 5) return 'Hadda'

  const absoluteSeconds = Math.abs(differenceSeconds)
  const relativeUnit = relativeUnits.find(({ seconds }) => absoluteSeconds >= seconds) || relativeUnits[relativeUnits.length - 1]
  const count = Math.max(1, Math.round(absoluteSeconds / relativeUnit.seconds))
  const unitLabel = count === 1 ? relativeUnit.singular : relativeUnit.plural
  return `${count} ${unitLabel} ${differenceSeconds > 0 ? 'ka hor' : 'ka dib'}`
}