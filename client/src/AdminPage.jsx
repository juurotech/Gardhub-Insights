import { useState } from 'react'
import { ArrowLeft, Check, Clock3, ExternalLink, FileText, KeyRound, LoaderCircle, LogOut, Send, Trash2, Video, X } from 'lucide-react'
import AuthorAvatar from './AuthorAvatar.jsx'
import ArticleTimestamp from './ArticleTimestamp.jsx'
import ThemeToggle from './ThemeToggle.jsx'

const categories = ['Teknolojiyad', 'Siyaasad', 'Amni', 'Caafimaad', 'Dhaqaale']
const AUTHOR_NAME = 'Gardhub - Tifatire'

async function readResponse(response) {
  const payload = await response.json().catch(() => ({}))
  if (!response.ok) throw new Error(payload.message || 'Codsiga lama dhammaystirin.')
  return payload
}

function getSafeExternalUrl(value) {
  try {
    const trimmedValue = value.trim()
    const hasScheme = /^[a-z][a-z\d+.-]*:/i.test(trimmedValue)
    const url = new URL(hasScheme ? trimmedValue : `https://${trimmedValue}`)
    return url.protocol === 'https:' && !url.username && !url.password ? url.href : ''
  } catch {
    return ''
  }
}

function getLinkLabel(value) {
  try {
    return new URL(value).hostname.replace(/^www\./, '')
  } catch {
    return 'Xiriiriye'
  }
}

function AdminPage({ theme, now, onToggleTheme, onAdminAuthenticated, onAdminSignOut }) {
  const [adminKey, setAdminKey] = useState('')
  const [authorized, setAuthorized] = useState(false)
  const [verifying, setVerifying] = useState(false)
  const [publishing, setPublishing] = useState(false)
  const [authError, setAuthError] = useState('')
  const [publishError, setPublishError] = useState('')
  const [coverImagePreview, setCoverImagePreview] = useState('')
  const [listError, setListError] = useState('')
  const [success, setSuccess] = useState('')
  const [articles, setArticles] = useState([])
  const [totalArticles, setTotalArticles] = useState(0)
  const [listLoading, setListLoading] = useState(false)
  const [deletingId, setDeletingId] = useState('')
  const [clearingAll, setClearingAll] = useState(false)
  const [clearAllOpen, setClearAllOpen] = useState(false)
  const [clearConfirmation, setClearConfirmation] = useState('')

  async function loadArticles() {
    setListLoading(true)
    setListError('')
    try {
      const payload = await readResponse(await fetch('/api/articles'))
      setArticles(payload.data)
      setTotalArticles(payload.totalCount ?? payload.count)
    } catch (error) {
      setListError(error.message)
    } finally {
      setListLoading(false)
    }
  }

  async function verifyAdmin(event) {
    event.preventDefault()
    setVerifying(true)
    setAuthError('')
    try {
      await readResponse(await fetch('/api/admin/verify', {
        method: 'POST',
        headers: { 'x-admin-key': adminKey },
      }))
      setAuthorized(true)
      onAdminAuthenticated()
      await loadArticles()
    } catch (error) {
      onAdminSignOut()
      setAuthError(error.message)
    } finally {
      setVerifying(false)
    }
  }

  async function publishArticle(event) {
    event.preventDefault()
    if (publishing) return

    const formElement = event.currentTarget
    const form = new FormData(formElement)
    setPublishing(true)
    setPublishError('')
    setSuccess('')

    try {
      const payload = await readResponse(await fetch('/api/articles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-admin-key': adminKey },
        body: JSON.stringify({
          title: form.get('title'),
          category: form.get('category'),
          excerpt: form.get('excerpt'),
          content: form.get('content'),
          readTime: Number(form.get('readTime')),
          coverImage: form.get('coverImage').trim(),
          videoUrl: form.get('videoUrl').trim(),
          resourceLinks: form.get('resourceLinks').split(/\r?\n/).map((url) => url.trim()).filter(Boolean),
        }),
      }))

      setArticles((current) => [payload.data, ...current.filter((article) => article._id !== payload.data._id)])
      formElement.reset()
      setCoverImagePreview('')
      setSuccess('Warbixinta si guul leh ayaa loo daabacay.')
      await loadArticles()
    } catch (error) {
      setPublishError(error.message)
    } finally {
      setPublishing(false)
    }
  }

  async function deleteArticle(article) {
    if (!window.confirm(`Ma hubtaa inaad tirtirayso maqaalka “${article.title}”?`)) return
    setDeletingId(article._id)
    setListError('')
    setSuccess('')
    try {
      await readResponse(await fetch(`/api/articles/${encodeURIComponent(article._id)}`, {
        method: 'DELETE',
        headers: { 'x-admin-key': adminKey },
      }))
      setArticles((current) => current.filter((item) => item._id !== article._id))
      setTotalArticles((current) => Math.max(0, current - 1))
      setSuccess('Maqaalka waa la tirtiray.')
    } catch (error) {
      setListError(error.message)
    } finally {
      setDeletingId('')
    }
  }

  async function clearAllArticles() {
    if (clearConfirmation !== 'TIRTIR' || clearingAll || totalArticles === 0) return
    setClearingAll(true)
    setListError('')
    setSuccess('')
    try {
      const payload = await readResponse(await fetch('/api/articles', {
        method: 'DELETE',
        headers: { 'x-admin-key': adminKey },
      }))
      setArticles([])
      setTotalArticles(0)
      setSuccess(`${payload.deletedCount} maqaal ayaa la tirtiray.`)
      setClearAllOpen(false)
      setClearConfirmation('')
    } catch (error) {
      setListError(error.message)
    } finally {
      setClearingAll(false)
    }
  }

  function closeClearAll() {
    if (clearingAll) return
    setClearAllOpen(false)
    setClearConfirmation('')
  }

  function signOut() {
    setAuthorized(false)
    onAdminSignOut()
    setAdminKey('')
    setArticles([])
    setSuccess('')
    setPublishError('')
  }

  return (
    <div className="admin-shell">
      <header className="admin-header">
        <a className="admin-brand" href="/" aria-label="Ku noqo Gardhub Insights">
          <span className="brand-mark" aria-hidden="true">G</span>
          <span className="brand-name"><b>Gardhub</b><span>Insights</span><small>MAAMULKA TIFAFTIRKA</small></span>
        </a>
        <div className="admin-header-actions">
          {authorized && <span className="admin-identity"><span className="admin-identity-status" /><AuthorAvatar className="admin-identity-avatar" /><span className="admin-identity-name">{AUTHOR_NAME}</span></span>}
          <ThemeToggle theme={theme} onToggle={onToggleTheme} />
          <a className="admin-home-link" href="/"><ArrowLeft size={15} /> Bogga hore</a>
          {authorized && <button className="admin-signout" onClick={signOut} aria-label="Ka bax"><LogOut size={16} /></button>}
        </div>
      </header>

      {!authorized ? (
        <main className="admin-gate">
          <div className="admin-gate-icon"><KeyRound size={20} /></div>
          <span className="admin-kicker">GELITAANKA TIFAFTIRAHA</span>
          <h1>Ku gal koontada maamulka.</h1>
          <p>Dashboard-kan waxaa geli kara oo keliya milkiilaha Gardhub Insights.</p>
          <form className="admin-gate-form" onSubmit={verifyAdmin}>
            <label className="admin-field-label">Furaha maamulka<input autoFocus autoComplete="current-password" type="password" value={adminKey} onChange={(event) => setAdminKey(event.target.value)} required /></label>
            {authError && <div className="admin-error" role="alert">{authError}</div>}
            <button className="admin-primary-button" type="submit" disabled={verifying}>
              {verifying ? <LoaderCircle className="admin-spinner" size={16} /> : <KeyRound size={16} />}
              {verifying ? 'Waa la xaqiijinayaa...' : 'Xaqiiji gelitaanka'}
            </button>
          </form>
        </main>
      ) : (
        <main className="admin-content">
          <section className="admin-page-title">
            <div><span className="admin-kicker">QOLKA TIFAFTIRKA</span><h1>Ku soo dhowow, {AUTHOR_NAME}</h1><p>Qor oo daabac warbixinta xigta ee Gardhub Insights.</p></div>
            <div className="admin-page-actions">
              <button className="admin-danger-button" onClick={() => setClearAllOpen(true)} disabled={totalArticles === 0 || clearingAll || Boolean(deletingId)}><Trash2 size={15} /> Tirtir dhammaan maqaallada</button>
              <div className="admin-published-count"><FileText size={17} /><span><b>{totalArticles}</b> maqaal la daabacay</span></div>
            </div>
          </section>
          {success && <div className="admin-success" role="status" aria-live="polite"><Check size={17} /><span>{success}</span></div>}
          <div className="admin-workspace">
            <section className="admin-editor-section" aria-labelledby="editor-title">
              <div className="admin-section-heading"><h2 id="editor-title">Qor maqaalka</h2><span>QORAAL CUSUB</span></div>
              <form className="admin-article-form" onSubmit={publishArticle}>
                <label className="admin-field-label">Cinwaanka<input name="title" required maxLength="140" placeholder="Cinwaanka maqaalka" disabled={publishing} /></label>
                <div className="admin-form-row">
                  <label className="admin-field-label">Qaybta<select name="category" required defaultValue="Amni" disabled={publishing}>{categories.map((category) => <option key={category} value={category}>{category}</option>)}</select></label>
                  <label className="admin-field-label">Waqtiga akhriska (daqiiqo)<input name="readTime" type="number" min="1" max="180" step="1" defaultValue="5" required disabled={publishing} /></label>
                </div>
                <label className="admin-field-label">URL-ka sawirka muuqda (ikhtiyaari)<input name="coverImage" type="text" inputMode="url" autoCapitalize="none" spellCheck={false} maxLength="1000" placeholder="https://example.com/image.jpg" onChange={(event) => setCoverImagePreview(getSafeExternalUrl(event.target.value))} disabled={publishing} /></label>
                {coverImagePreview && <figure className="admin-cover-preview"><img src={coverImagePreview} alt="Hordhaca sawirka maqaalka" onError={() => setCoverImagePreview('')} /><figcaption>Hordhaca sawirka maqaalka</figcaption></figure>}
                <label className="admin-field-label">URL-ka muuqaalka (ikhtiyaari)<input name="videoUrl" type="text" inputMode="url" autoCapitalize="none" spellCheck={false} maxLength="1000" placeholder="YouTube ama xiriiriye muuqaal HTTPS ah" disabled={publishing} /></label>
                <label className="admin-field-label">Xiriiriyeyaasha tixraaca (ikhtiyaari)<textarea name="resourceLinks" rows="3" maxLength="10000" placeholder="Geli hal URL sadar kasta" disabled={publishing} /></label>
                <label className="admin-field-label">Nuxurka gaaban<textarea name="excerpt" required maxLength="300" rows="3" placeholder="Soo koobid kooban oo maqaalka ah..." disabled={publishing} /></label>
                <label className="admin-field-label">Qoraalka dhamaystiran<textarea name="content" required maxLength="100000" rows="11" placeholder="Qoraalka warbixinta... Kala saar faqrado adigoo saf bannaan gelinaya." disabled={publishing} /></label>
                {publishError && <div className="admin-error" role="alert">{publishError}</div>}
                <div className="admin-form-footer"><div className="admin-form-author"><AuthorAvatar className="admin-form-author-avatar" /><span><b>{AUTHOR_NAME}</b><small>Qore</small></span></div><button className="admin-primary-button" type="submit" disabled={publishing}>{publishing ? <LoaderCircle className="admin-spinner" size={16} /> : <Send size={15} />}{publishing ? 'Waa la daabacayaa...' : 'Daabac warbixinta'}</button></div>
              </form>
            </section>

            <aside className="admin-article-list" aria-labelledby="recent-title">
              <div className="admin-section-heading"><h2 id="recent-title">Maqaalladii u dambeeyay</h2><button className="admin-refresh-button" onClick={loadArticles} disabled={listLoading} aria-label="Dib u cusboonaysii">{listLoading ? <LoaderCircle className="admin-spinner" size={15} /> : 'CUSBOONAYSII'}</button></div>
              {listError && <div className="admin-error" role="alert">{listError}</div>}
              {listLoading && articles.length === 0 ? <p className="admin-list-empty">Maqaallada ayaa la soo dejinayaa...</p> : articles.length === 0 ? <p className="admin-list-empty">Weli maqaal lama daabicin.</p> : <div className="admin-recent-items">{articles.slice(0, 8).map((article) => {
                const coverImage = getSafeExternalUrl(article.coverImage)
                const videoUrl = getSafeExternalUrl(article.videoUrl)
                const resourceLinks = Array.isArray(article.resourceLinks) ? article.resourceLinks.map(getSafeExternalUrl).filter(Boolean) : []
                return <article className="admin-recent-item" key={article._id}>
                  {coverImage && <img className="admin-recent-image" src={coverImage} alt="" loading="lazy" />}
                  <div className="admin-recent-meta"><span>{article.category}</span><ArticleTimestamp value={article.createdAt} now={now} /></div>
                  <h3>{article.title}</h3>
                  <p>{article.excerpt}</p>
                  {(videoUrl || resourceLinks.length > 0) && <div className="admin-media-links">
                    {videoUrl && <a href={videoUrl} target="_blank" rel="noreferrer"><Video size={12} /> Muuqaal</a>}
                    {resourceLinks.map((url, index) => <a href={url} target="_blank" rel="noreferrer" key={url}><ExternalLink size={12} /> {getLinkLabel(url) || `Il ${index + 1}`}</a>)}
                  </div>}
                  <div className="admin-recent-footer"><small>{article.readTime} daqiiqo · {article.author || AUTHOR_NAME}</small><button className="admin-delete-article" onClick={() => deleteArticle(article)} disabled={Boolean(deletingId) || clearingAll} aria-label={`Tirtir ${article.title}`}>{deletingId === article._id ? <LoaderCircle className="admin-spinner" size={14} /> : <Trash2 size={13} />} Tirtir</button></div>
                </article>
              })}</div>}
            </aside>
          </div>
        </main>
      )}
      {clearAllOpen && <div className="admin-confirm-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) closeClearAll() }}><section className="admin-confirm-dialog" role="alertdialog" aria-modal="true" aria-labelledby="clear-all-title" aria-describedby="clear-all-description"><div className="admin-confirm-icon"><Trash2 size={19} /></div><button className="admin-confirm-close" onClick={closeClearAll} disabled={clearingAll} aria-label="Xir"><X size={18} /></button><span className="admin-kicker">TALLAABO AAN DIB LOO CELIN KARIN</span><h2 id="clear-all-title">Tirtir dhammaan maqaallada?</h2><p id="clear-all-description">Waxaad tirtiraysaa {totalArticles} maqaal. Tallaabadan dib looma celin karo.</p><label className="admin-field-label">Si aad u xaqiijiso, qor <b>TIRTIR</b><input autoFocus value={clearConfirmation} onChange={(event) => setClearConfirmation(event.target.value)} disabled={clearingAll} /></label><div className="admin-confirm-actions"><button className="admin-cancel-button" onClick={closeClearAll} disabled={clearingAll}>Ka noqo</button><button className="admin-danger-button" onClick={clearAllArticles} disabled={clearConfirmation !== 'TIRTIR' || clearingAll}>{clearingAll ? <LoaderCircle className="admin-spinner" size={15} /> : <Trash2 size={15} />}{clearingAll ? 'Waa la tirtirayaa...' : 'Haa, tirtir dhammaan'}</button></div></section></div>}
    </div>
  )
}

export default AdminPage