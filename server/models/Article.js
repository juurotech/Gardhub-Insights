const mongoose = require('mongoose')
const { AUTHOR_NAME } = require('../config/identity')

const categories = ['Teknolojiyad', 'Siyaasad', 'Amni', 'Caafimaad', 'Dhaqaale']

const articleSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true, maxlength: 140 },
  slug: { type: String, required: true, unique: true, index: true, maxlength: 180 },
  content: { type: String, required: true, trim: true, maxlength: 100000 },
  excerpt: { type: String, required: true, trim: true, maxlength: 300 },
  category: { type: String, required: true, enum: categories, index: true },
  coverImage: { type: String, trim: true, maxlength: 1000 },
  videoUrl: { type: String, trim: true, maxlength: 1000 },
  resourceLinks: {
    type: [{ type: String, trim: true, maxlength: 1000 }],
    default: [],
    validate: { validator: (links) => links.length <= 20, message: 'A maximum of 20 resource links is allowed.' },
  },
  author: { type: String, default: AUTHOR_NAME, trim: true, maxlength: 80 },
  readTime: { type: Number, required: true, min: 1, max: 180 },
  createdAt: { type: Date, default: Date.now, immutable: true, index: true },
}, { versionKey: false })

articleSchema.index({ title: 'text', excerpt: 'text', content: 'text' })

module.exports = { Article: mongoose.model('Article', articleSchema), categories }