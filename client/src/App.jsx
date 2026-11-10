import { useLayoutEffect, useEffect, useState } from 'react'
import { ArrowLeft, ArrowUpRight, BookOpen, Clock3, ExternalLink, KeyRound, Mail, Search, Video, X } from 'lucide-react'
import AdminPage from './AdminPage.jsx'
import AuthorAvatar from './AuthorAvatar.jsx'
import ArticleTimestamp from './ArticleTimestamp.jsx'
import ContactPage from './ContactPage.jsx'
import ThemeToggle from './ThemeToggle.jsx'

const categories = ['Dhammaan', 'Teknolojiyad', 'Siyaasad', 'Amni', 'Caafimaad', 'Dhaqaale']
const categoryColors = { Teknolojiyad: 'technology', Siyaasad: 'politics', Amni: 'security', Caafimaad: 'health', Dhaqaale: 'economics' }

function getSafeHttpsUrl(value) {
  try {
    const url = new URL(value)
    return url.protocol === 'https:' && !url.username && !url.password ? url : null
  } catch {
    return null
  }
}

function getYouTubeEmbedUrl(url) {
  const host = url.hostname.toLowerCase()
  let videoId = ''
  if (host === 'youtu.be') videoId = url.pathname.split('/').filter(Boolean)[0] || ''
  if (['youtube.com', 'www.youtube.com', 'm.youtube.com', 'youtube-nocookie.com', 'www.youtube-nocookie.com'].includes(host)) {
    videoId = url.searchParams.get('v') || url.pathname.match(/^\/(?:embed|shorts)\/([^/?]+)/)?.[1] || ''
  }
  return /^[\w-]{11}$/.test(videoId) ? `https://www.youtube-nocookie.com/embed/${videoId}` : ''
}

function App() {
  const [theme, setTheme] = useState(() => {
    const savedTheme = localStorage.getItem('gardhub-theme')
    if (savedTheme === 'light' || savedTheme === 'dark') return savedTheme
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  })
  const [adminAuthenticated, setAdminAuthenticated] = useState(() => localStorage.getItem('gardhub-admin-authenticated') === 'true')
  const [now, setNow] = useState(() => Date.now())

  useLayoutEffect(() => {
    const root = document.documentElement
    root.dataset.theme = theme
    localStorage.setItem('gardhub-theme', theme)

    if (root.dataset.themeReady !== 'true') {
      const frame = requestAnimationFrame(() => {
        root.dataset.themeReady = 'true'
      })
      return () => cancelAnimationFrame(frame)
    }
  }, [theme])

  useEffect(() => {
    const updateTime = () => setNow(Date.now())
    const interval = window.setInterval(updateTime, 15000)
    document.addEventListener('visibilitychange', updateTime)
    return () => {
      window.clearInterval(interval)
      document.removeEventListener('visibilitychange', updateTime)
    }
  }, [])

  useEffect(() => {
    function handleAdminShortcut(event) {
      if (event.ctrlKey && event.shiftKey && event.key.toLowerCase() === 'a') {
        event.preventDefault()
        window.location.assign('/admin')
      }
    }

    window.addEventListener('keydown', handleAdminShortcut)
    return () => window.removeEventListener('keydown', handleAdminShortcut)
  }, [])

  const toggleTheme = () => setTheme((current) => current === 'dark' ? 'light' : 'dark')
  const updateAdminAuthentication = (authenticated) => {
    if (authenticated) localStorage.setItem('gardhub-admin-authenticated', 'true')
    else localStorage.removeItem('gardhub-admin-authenticated')
    setAdminAuthenticated(authenticated)
  }

  if (window.location.pathname === '/admin') {
    return <AdminPage theme={theme} now={now} onToggleTheme={toggleTheme} onAdminAuthenticated={() => updateAdminAuthentication(true)} onAdminSignOut={() => updateAdminAuthentication(false)} />
  }
  if (window.location.pathname === '/contact') {
    return <ContactPage theme={theme} onToggleTheme={toggleTheme} adminAuthenticated={adminAuthenticated} />
  }
  return <PublicSite theme={theme} now={now} onToggleTheme={toggleTheme} adminAuthenticated={adminAuthenticated} />
}

function PublicSite({ theme, now, onToggleTheme, adminAuthenticated }) {
  const [articles, setArticles] = useState([])
  const [activeCategory, setActiveCategory] = useState('Dhammaan')
  const [search, setSearch] = useState('')
  const [selectedArticle, setSelectedArticle] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const controller = new AbortController()
    const params = new URLSearchParams()
    if (activeCategory !== 'Dhammaan') params.set('category', activeCategory)
    if (search.trim()) params.set('search', search.trim())
    setLoading(true)
    setError('')
    fetch(`/api/articles?${params}`, { signal: controller.signal })
      .then(async (response) => {
        const payload = await response.json()
        if (!response.ok) throw new Error(payload.message || 'Maqaallada lama soo dejin karin.')
        setArticles(payload.data)
      })
      .catch((fetchError) => {
        if (fetchError.name !== 'AbortError') setError(fetchError.message)
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false)
      })
    return () => controller.abort()
  }, [activeCategory, search])

  async function openArticle(article) {
    try {
      const response = await fetch(`/api/articles/${encodeURIComponent(article.slug)}`)
      const payload = await response.json()
      if (!response.ok) throw new Error(payload.message)
      setSelectedArticle(payload.data)
    } catch (fetchError) {
      setError(fetchError.message || 'Maqaalka lama heli karin.')
    }
  }

  const featuredArticle = articles[0]
  const recentArticles = articles.slice(featuredArticle ? 1 : 0)

  return (
    <div className="app-shell">
      <header className="site-header">
        <div className="header-inner">
          <button className="brand" onClick={() => setSelectedArticle(null)} aria-label="Gardhub Insights bogga hore">
            <span className="brand-mark" aria-hidden="true">G</span>
            <span className="brand-name"><b>Gardhub</b><span>Insights</span></span>
          </button>
          <div className="header-tools">
            <label className="search-box"><Search size={17} strokeWidth={1.8} aria-hidden="true" /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Raadi maqaal..." aria-label="Raadi maqaallo" />{search && <button className="clear-search" onClick={() => setSearch('')} aria-label="Nadiifi raadinta"><X size={15} /></button>}</label>
            <ThemeToggle theme={theme} onToggle={onToggleTheme} />
            {adminAuthenticated && <a className="admin-header-link" href="/admin" aria-label="Admin Dashboard"><AuthorAvatar className="admin-header-avatar" /><KeyRound size={14} aria-hidden="true" /><span>Admin Dashboard</span></a>}
          </div>
        </div>
      </header>

      {selectedArticle ? <ArticlePage article={selectedArticle} now={now} onBack={() => setSelectedArticle(null)} /> : (
        <main>
          <section className="intro-band">
            <div className="intro-copy"><span className="eyebrow"><span className="eyebrow-dot" /> Aragtiyo maanta</span><h1>Aragtiyo <em>Qoto Dheer</em> iyo Warbixinno Xog Ogaal ah</h1><p>Falanqeyn sugan oo ku saabsan amniga, dhaqaalaha, iyo horumarinta bulshada.</p></div>
            <div className="intro-author-card"><AuthorAvatar className="intro-author-avatar" /><span><b>Gardhub - Tifatire</b><small>Tifaftire iyo falanqeeye</small><small className="intro-author-bio">Amni, dhaqaale, iyo horumar bulsho</small></span></div>
          </section>
          <section className="feed-section" aria-label="Maqaallada">
            <div className="feed-toolbar"><div className="category-tabs" role="tablist" aria-label="Qaybaha maqaallada">{categories.map((category) => <button key={category} role="tab" aria-selected={activeCategory === category} className={activeCategory === category ? 'category-tab active' : 'category-tab'} onClick={() => setActiveCategory(category)}>{category}</button>)}</div><span className="feed-count">{loading ? '...' : `${articles.length} maqaal`}</span></div>
            {error && <div className="notice error-notice" role="alert"><span>{error}</span><button onClick={() => setError('')} aria-label="Xir fariinta"><X size={16} /></button></div>}
            {loading ? <div className="loading-state"><span className="loader" /> Maqaallada ayaa la soo dejinayaa</div> : articles.length === 0 ? (
              <div className="empty-state"><BookOpen size={24} strokeWidth={1.5} /><h2>{search ? 'Wax natiijo ah lama helin' : 'Maqaallo cusub ayaa dhowaan imanaya'}</h2><p>{search ? 'Isku day eray kale ama beddel qaybta aad dooratay.' : 'Maqaallo cusub ayaa halkan lagu soo bandhigi doonaa.'}</p></div>
            ) : <><FeaturedStory article={featuredArticle} now={now} onOpen={openArticle} />{recentArticles.length > 0 && <><div className="recent-heading"><h2>Maqaalladii u dambeeyay</h2><span>SOO XULIDDA TIFAFTIRKA</span></div><div className="article-grid">{recentArticles.map((article, index) => <ArticleCard key={article._id} article={article} index={index} now={now} onOpen={openArticle} />)}</div></>}</>}
          </section>
        </main>
      )}

      <footer className="site-footer"><span className="footer-brand">Gardhub <b>Insights</b></span><span>Fahamku waa bilowga isbeddelka.</span><span>© {new Date().getFullYear()} Gardhub</span><a className="contact-footer-link" href="/contact"><Mail size={13} aria-hidden="true" /><span>Nala Soo Xiriir</span></a>{adminAuthenticated && <a className="admin-footer-link" href="/admin"><KeyRound size={13} aria-hidden="true" /><span>Admin Dashboard</span></a>}</footer>
    </div>
  )
}

function CategoryLabel({ category }) {
  return <span className={`category-label ${categoryColors[category] || ''}`}>{category}</span>
}

function FeaturedStory({ article, now, onOpen }) {
  return <article className="featured-story"><button className="featured-image" onClick={() => onOpen(article)} aria-label={`Akhri: ${article.title}`}>{article.coverImage ? <img src={article.coverImage} alt="" /> : <div className={`image-art ${categoryColors[article.category] || 'default-art'}`}><span>G.</span><i /><b /></div>}<span className="image-index">01 / MAQAALKA MUUQDA</span>{article.videoUrl && <span className="featured-video-badge"><Video size={13} /> Muuqaal</span>}</button><div className="featured-copy"><div className="story-meta"><CategoryLabel category={article.category} /><ArticleTimestamp value={article.createdAt} now={now} /></div><button className="story-title-button" onClick={() => onOpen(article)}><h2>{article.title}</h2></button><p className="story-excerpt">{article.excerpt}</p><div className="story-bottom"><span>Qore: <b>{article.author}</b></span><span><Clock3 size={14} /> {article.readTime} daqiiqo</span></div><button className="read-link" onClick={() => onOpen(article)}>Akhri sheekada <ArrowUpRight size={17} /></button></div></article>
}

function ArticleCard({ article, index, now, onOpen }) {
  return <article className="article-card" style={{ '--card-delay': `${index * 70}ms` }}><button className={`card-art ${categoryColors[article.category] || 'default-art'}`} onClick={() => onOpen(article)} aria-label={`Akhri: ${article.title}`}>{article.coverImage ? <img src={article.coverImage} alt="" /> : <><span className="art-letter">{article.category.slice(0, 1)}</span><i /><b /></>}<span className="card-arrow"><ArrowUpRight size={16} /></span>{article.videoUrl && <span className="card-video-badge"><Video size={13} /> Muuqaal</span>}</button><div className="card-meta"><CategoryLabel category={article.category} /><ArticleTimestamp value={article.createdAt} now={now} /></div><button className="card-title-button" onClick={() => onOpen(article)}><h3>{article.title}</h3></button><p className="card-excerpt">{article.excerpt}</p><div className="card-byline"><span>{article.author}</span><span><Clock3 size={13} /> {article.readTime} daqiiqo</span></div></article>
}

function ArticlePage({ article, now, onBack }) {
  const videoUrl = getSafeHttpsUrl(article.videoUrl)
  const embedUrl = videoUrl && getYouTubeEmbedUrl(videoUrl)
  const directVideo = videoUrl && /\.(mp4|m4v|mov|ogg|webm)$/i.test(videoUrl.pathname)
  const resourceLinks = Array.isArray(article.resourceLinks) ? article.resourceLinks.map(getSafeHttpsUrl).filter(Boolean) : []

  return <main className="article-page"><button className="back-link" onClick={onBack}><ArrowLeft size={16} /> Ku noqo maqaalada</button><div className="article-heading"><div className="story-meta"><CategoryLabel category={article.category} /><ArticleTimestamp value={article.createdAt} now={now} /></div><h1>{article.title}</h1><p className="article-deck">{article.excerpt}</p><div className="article-author"><AuthorAvatar className="article-author-avatar" /><span><b>{article.author}</b><small>Tifatire · {article.readTime} daqiiqo oo akhris ah</small></span></div></div>{article.coverImage && <img className="article-cover" src={article.coverImage} alt="" />}{videoUrl && <div className="article-video">{embedUrl ? <iframe src={embedUrl} title={`Muuqaal: ${article.title}`} loading="lazy" referrerPolicy="strict-origin-when-cross-origin" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen /> : directVideo ? <video src={videoUrl.href} controls playsInline preload="metadata">Browser-kaagu ma taageero muuqaalka.</video> : <a className="article-video-link" href={videoUrl.href} target="_blank" rel="noreferrer"><Video size={16} /> Daawo muuqaalka <ExternalLink size={14} /></a>}</div>}<div className="article-body">{article.content.split(/\n\s*\n/).filter(Boolean).map((paragraph, index) => <p key={index}>{paragraph}</p>)}</div>{resourceLinks.length > 0 && <section className="article-resources" aria-labelledby="resources-title"><h2 id="resources-title">Ilaha iyo tixraacyada</h2><ul>{resourceLinks.map((url) => <li key={url.href}><a href={url.href} target="_blank" rel="noreferrer"><span>{url.hostname.replace(/^www\./, '')}</span><ExternalLink size={14} /></a></li>)}</ul></section>}</main>
}

export default App