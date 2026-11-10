const express = require('express')
const slugify = require('slugify')
const { Article, categories } = require('../models/Article')
const requireAdmin = require('../middleware/adminAuth')
const { AUTHOR_NAME } = require('../config/identity')

const router = express.Router()

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

async function findArticle(idOrSlug) {
  if (/^[a-f\d]{24}$/i.test(idOrSlug)) return Article.findById(idOrSlug)
  return Article.findOne({ slug: idOrSlug })
}

function getHttpsUrl(value) {
  if (value == null || value === '') return ''
  if (typeof value !== 'string' || value.length > 1000) return null
  try {
    const trimmedValue = value.trim()
    const hasScheme = /^[a-z][a-z\d+.-]*:/i.test(trimmedValue)
    const url = new URL(hasScheme ? trimmedValue : `https://${trimmedValue}`)
    if (url.protocol !== 'https:' || !url.hostname || url.username || url.password) return null
    return url.toString()
  } catch {
    return null
  }
}

router.get('/', async (req, res, next) => {
  try {
    const { category, search } = req.query
    const filter = {}
    if (category) {
      if (!categories.includes(category)) {
        return res.status(400).json({ success: false, message: 'Qaybta la codsaday lama aqoonsana.' })
      }
      filter.category = category
    }
    if (search) {
      const term = String(search).trim().slice(0, 100)
      if (term) {
        const pattern = new RegExp(escapeRegex(term), 'i')
        filter.$or = [{ title: pattern }, { excerpt: pattern }, { content: pattern }]
      }
    }

    const [articles, totalCount] = await Promise.all([
      Article.find(filter).sort({ createdAt: -1 }).limit(100).lean(),
      Article.countDocuments(filter),
    ])
    res.json({ success: true, count: articles.length, totalCount, data: articles })
  } catch (error) {
    next(error)
  }
})

router.get('/:idOrSlug', async (req, res, next) => {
  try {
    const article = await findArticle(req.params.idOrSlug)
    if (!article) return res.status(404).json({ success: false, message: 'Maqaalka lama helin.' })
    res.json({ success: true, data: article })
  } catch (error) {
    next(error)
  }
})

router.post('/', requireAdmin, async (req, res, next) => {
  try {
    const body = req.body && typeof req.body === 'object' ? req.body : {}
    const { title, content, excerpt, category, coverImage, videoUrl, readTime: requestedReadTime } = body
    if (![title, content, excerpt, category].every((value) => typeof value === 'string' && value.trim())) {
      return res.status(400).json({ success: false, message: 'Cinwaan, qoraal, soo koobid iyo qayb waa loo baahan yahay.' })
    }
    if (!categories.includes(category)) {
      return res.status(400).json({ success: false, message: 'Qaybta la doortay lama aqoonsana.' })
    }
    const cleanCoverImage = getHttpsUrl(coverImage)
    if (cleanCoverImage === null) {
      return res.status(400).json({ success: false, message: 'Sawirku waa inuu noqdaa URL HTTPS sax ah.' })
    }
    const cleanVideoUrl = getHttpsUrl(videoUrl)
    if (cleanVideoUrl === null) {
      return res.status(400).json({ success: false, message: 'Muuqaalku waa inuu noqdaa URL HTTPS sax ah.' })
    }
    const requestedResourceLinks = body.resourceLinks ?? []
    if (!Array.isArray(requestedResourceLinks) || requestedResourceLinks.length > 20) {
      return res.status(400).json({ success: false, message: 'Ku dar ugu badnaan 20 xiriiriye oo tixraac ah.' })
    }
    const resourceLinks = []
    for (const value of requestedResourceLinks) {
      if (typeof value === 'string' && !value.trim()) continue
      const cleanUrl = getHttpsUrl(value)
      if (!cleanUrl) {
        return res.status(400).json({ success: false, message: 'Xiriir kasta waa inuu noqdaa URL HTTPS sax ah.' })
      }
      if (!resourceLinks.includes(cleanUrl)) resourceLinks.push(cleanUrl)
    }
    const cleanTitle = title.trim()
    const wordCount = content.trim().split(/\s+/).length
    const readTime = requestedReadTime == null || requestedReadTime === ''
      ? Math.max(1, Math.ceil(wordCount / 200))
      : Number(requestedReadTime)
    if (!Number.isInteger(readTime) || readTime < 1 || readTime > 180) {
      return res.status(400).json({ success: false, message: 'Waqtiga akhrisku waa inuu ahaadaa tiro dhan oo u dhexeysa 1 iyo 180 daqiiqo.' })
    }
    const baseSlug = slugify(cleanTitle, { lower: true, strict: true, trim: true }).slice(0, 160) || `maqaal-${Date.now()}`
    const articleFields = {
      title: cleanTitle,
      content: content.trim(),
      excerpt: excerpt.trim(),
      category,
      coverImage: cleanCoverImage || undefined,
      videoUrl: cleanVideoUrl || undefined,
      resourceLinks,
      author: AUTHOR_NAME,
      readTime,
    }
    let article
    let suffix = 1
    while (!article) {
      const slug = suffix === 1 ? baseSlug : `${baseSlug}-${suffix}`
      try {
        article = await Article.create({ ...articleFields, slug })
      } catch (error) {
        if (error.code !== 11000) throw error
        suffix += 1
      }
    }
    res.status(201).json({ success: true, data: article })
  } catch (error) {
    if (error.name === 'ValidationError') {
      return res.status(400).json({ success: false, message: error.message })
    }
    next(error)
  }
})

router.delete('/', requireAdmin, async (req, res, next) => {
  try {
    const result = await Article.deleteMany({})
    res.json({
      success: true,
      message: 'Dhammaan maqaallada waa la tirtiray.',
      deletedCount: result.deletedCount,
    })
  } catch (error) {
    next(error)
  }
})

router.delete('/:idOrSlug', requireAdmin, async (req, res, next) => {
  try {
    const article = await findArticle(req.params.idOrSlug)
    if (!article) return res.status(404).json({ success: false, message: 'Maqaalka lama helin.' })
    await article.deleteOne()
    res.json({ success: true, message: 'Maqaalka waa la tirtiray.', data: { id: article._id } })
  } catch (error) {
    next(error)
  }
})

module.exports = router