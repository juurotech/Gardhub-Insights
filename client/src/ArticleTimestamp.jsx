import { formatArticleDate, formatRelativeArticleDate } from './articleDate.js'

function ArticleTimestamp({ value, now }) {
  const date = new Date(value)
  const isValid = !Number.isNaN(date.getTime())
  const absoluteDate = isValid ? formatArticleDate(value) : ''

  return (
    <time
      className="article-timestamp"
      dateTime={isValid ? date.toISOString() : undefined}
      title={absoluteDate || undefined}
      aria-label={absoluteDate || undefined}
    >
      {formatRelativeArticleDate(value, now)}
    </time>
  )
}

export default ArticleTimestamp