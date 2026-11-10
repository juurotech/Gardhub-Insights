import { ArrowLeft, ArrowUpRight, KeyRound, Mail, MessageCircle } from 'lucide-react'
import AuthorAvatar from './AuthorAvatar.jsx'
import ThemeToggle from './ThemeToggle.jsx'

const CONTACT_EMAIL = 'primegardhub@gmail.com'
const WHATSAPP_NUMBER = '252618673056'
const WHATSAPP_MESSAGE = 'Salaan Gardhub, waxaan ka imid website-ka. Waxaan rabaa inaan kula soo xiriiro.'

function ContactPage({ theme, onToggleTheme, adminAuthenticated }) {
  const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(WHATSAPP_MESSAGE)}`

  function openEmailDraft(event) {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    const name = String(form.get('name') || '').trim()
    const email = String(form.get('email') || '').trim()
    const message = String(form.get('message') || '').trim()
    const subject = `Fariin ka timid ${name} | Gardhub Insights`
    const body = `Magaca: ${name}\nEmail: ${email}\n\n${message}`
    window.location.href = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
  }

  return (
    <div className="app-shell">
      <header className="site-header">
        <div className="header-inner">
          <a className="brand" href="/" aria-label="Gardhub Insights bogga hore">
            <span className="brand-mark" aria-hidden="true">G</span>
            <span className="brand-name"><b>Gardhub</b><span>Insights</span></span>
          </a>
          <div className="header-tools">
            <a className="contact-home-link" href="/"><ArrowLeft size={15} /><span>Bogga hore</span></a>
            <ThemeToggle theme={theme} onToggle={onToggleTheme} />
            {adminAuthenticated && <a className="admin-header-link" href="/admin" aria-label="Admin Dashboard"><AuthorAvatar className="admin-header-avatar" /><KeyRound size={14} aria-hidden="true" /><span>Admin Dashboard</span></a>}
          </div>
        </div>
      </header>

      <main className="contact-page">
        <header className="contact-heading">
          <span className="eyebrow"><span className="eyebrow-dot" /> Gardhub Insights</span>
          <h1>Nala Soo Xiriir</h1>
          <p>Su’aal, talo, ama xog aad nala wadaagayso? Waxaan jeclaan lahayn inaan kaa maqalno.</p>
        </header>

        <div className="contact-layout">
          <section className="contact-options" aria-labelledby="contact-options-title">
            <h2 id="contact-options-title">Dooro habka kugu habboon</h2>
            <a className="contact-option contact-whatsapp" href={whatsappUrl} target="_blank" rel="noreferrer">
              <span className="contact-option-icon"><MessageCircle size={20} aria-hidden="true" /></span>
              <span className="contact-option-copy"><b>WhatsApp</b><small>+252 61 867 3056</small></span>
              <ArrowUpRight className="contact-option-arrow" size={17} aria-hidden="true" />
            </a>
            <a className="contact-option" href={`mailto:${CONTACT_EMAIL}`}>
              <span className="contact-option-icon"><Mail size={20} aria-hidden="true" /></span>
              <span className="contact-option-copy"><b>Email</b><small>{CONTACT_EMAIL}</small></span>
              <ArrowUpRight className="contact-option-arrow" size={17} aria-hidden="true" />
            </a>
          </section>

          <section className="contact-form-section" aria-labelledby="contact-form-title">
            <h2 id="contact-form-title">Fariin noo soo dir</h2>
            <form className="contact-form" onSubmit={openEmailDraft}>
              <label>Magaca<input name="name" autoComplete="name" maxLength="100" required /></label>
              <label>Email<input name="email" type="email" autoComplete="email" maxLength="254" required /></label>
              <label>Fariinta<textarea name="message" rows="6" maxLength="5000" required /></label>
              <button className="contact-submit" type="submit"><Mail size={16} aria-hidden="true" /> Ku fur email-kaaga</button>
            </form>
          </section>
        </div>
      </main>

      <footer className="site-footer">
        <span className="footer-brand">Gardhub <b>Insights</b></span>
        <span>Fahamku waa bilowga isbeddelka.</span>
        <span>© {new Date().getFullYear()} Gardhub</span>
        <a className="contact-footer-link" href="/contact"><Mail size={13} aria-hidden="true" /><span>Nala Soo Xiriir</span></a>
        {adminAuthenticated && <a className="admin-footer-link" href="/admin"><KeyRound size={13} aria-hidden="true" /><span>Admin Dashboard</span></a>}
      </footer>
    </div>
  )
}

export default ContactPage