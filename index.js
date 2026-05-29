require('dotenv').config();
const express = require('express');
const session = require('express-session');
const path = require('path');

const app = express();
const BASE = process.env.BASE_URL || 'https://twishcare.ca';
const TODAY = new Date().toISOString().split('T')[0];

// ═══════════════════════════════════════════
// SECURITY + SEO HEADERS
// ═══════════════════════════════════════════
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  next();
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ═══════════════════════════════════════════
// STATIC FILES — aggressive caching for WebP
// ═══════════════════════════════════════════
app.use(express.static(path.join(__dirname, 'public'), {
  maxAge: '7d',
  setHeaders: (res, fp) => {
    if (fp.match(/\.(webp|jpg|jpeg|png|svg|gif|ico|avif)$/i))
      res.setHeader('Cache-Control', 'public, max-age=604800, immutable');
    else if (fp.match(/\.(css|js)$/i))
      res.setHeader('Cache-Control', 'public, max-age=86400');
    else if (fp.match(/\.(woff|woff2|ttf|eot)$/i))
      res.setHeader('Cache-Control', 'public, max-age=2592000, immutable');
  }
}));

app.use(session({
  secret: process.env.SESSION_SECRET || 'twish2025',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: process.env.NODE_ENV === 'production', maxAge: 86400000 }
}));

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

function rp(res, partial, locals = {}) {
  res.render('partials/' + partial, { ...locals, layout: false }, (err, body) => {
    if (err) return res.status(500).send(err.message);
    res.render('layout', { ...locals, body });
  });
}

// ═══════════════════════════════════════════
// SITEMAP — all pages including blog articles
// Google crawls based on priority + changefreq
// ═══════════════════════════════════════════
app.get('/sitemap.xml', (req, res) => {
  res.header('Content-Type', 'application/xml');
  res.header('Cache-Control', 'public, max-age=3600');
  res.send(`<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">

  <!-- CORE PAGES -->
  <url>
    <loc>${BASE}/home</loc>
    <lastmod>${TODAY}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
    <xhtml:link rel="alternate" hreflang="en-CA" href="${BASE}/home"/>
  </url>
  <url>
    <loc>${BASE}/about</loc>
    <lastmod>${TODAY}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>${BASE}/services</loc>
    <lastmod>${TODAY}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>${BASE}/contact</loc>
    <lastmod>${TODAY}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>${BASE}/blog</loc>
    <lastmod>${TODAY}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>

  <!-- BLOG ARTICLES -->
  <url>
    <loc>${BASE}/blog/understanding-anxiety</loc>
    <lastmod>2025-05-01</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>${BASE}/blog/burnout-is-not-laziness</loc>
    <lastmod>2025-05-01</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>${BASE}/blog/four-patterns-damage-relationships</loc>
    <lastmod>2025-05-01</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>${BASE}/blog/intergenerational-trauma</loc>
    <lastmod>2025-05-01</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>${BASE}/blog/when-to-start-therapy</loc>
    <lastmod>2025-05-01</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>${BASE}/blog/mental-health-south-asian-community</loc>
    <lastmod>2025-05-01</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>

</urlset>`);
});

// ═══════════════════════════════════════════
// ROBOTS.TXT — all major search + AI bots
// ═══════════════════════════════════════════
app.get('/robots.txt', (req, res) => {
  res.header('Content-Type', 'text/plain');
  res.header('Cache-Control', 'public, max-age=86400');
  res.send(`# Twish — Therapy with Shimul
# https://twishcare.ca
# robots.txt — search engine and AI crawler permissions

# ── All crawlers (default) ──
User-agent: *
Allow: /
Disallow: /api/
Disallow: /*.json$
Crawl-delay: 1

# ── Google ──
User-agent: Googlebot
Allow: /
Crawl-delay: 0

User-agent: Googlebot-Image
Allow: /images/

User-agent: Googlebot-Mobile
Allow: /

# ── Bing / Microsoft ──
User-agent: Bingbot
Allow: /
Crawl-delay: 0

User-agent: MSNBot
Allow: /

User-agent: MSNBot-Media
Allow: /images/

# ── Yahoo ──
User-agent: Slurp
Allow: /

# ── DuckDuckGo ──
User-agent: DuckDuckBot
Allow: /

User-agent: DuckDuckGo-Favicons-Bot
Allow: /

# ── Yandex ──
User-agent: YandexBot
Allow: /

# ── Baidu ──
User-agent: Baiduspider
Allow: /

# ── Apple ──
User-agent: Applebot
Allow: /

User-agent: Applebot-Extended
Allow: /

# ── AI — OpenAI / ChatGPT ──
User-agent: GPTBot
Allow: /

User-agent: ChatGPT-User
Allow: /

User-agent: OAI-SearchBot
Allow: /

# ── AI — Anthropic / Claude ──
User-agent: ClaudeBot
Allow: /

User-agent: Claude-Web
Allow: /

User-agent: anthropic-ai
Allow: /

# ── AI — Perplexity ──
User-agent: PerplexityBot
Allow: /

# ── AI — Google Gemini ──
User-agent: Google-Extended
Allow: /

User-agent: Gemini-Web
Allow: /

# ── AI — xAI / Grok ──
User-agent: Grok
Allow: /

User-agent: xAI-Bot
Allow: /

# ── AI — Meta / LLaMA ──
User-agent: FacebookBot
Allow: /

User-agent: Meta-ExternalAgent
Allow: /

User-agent: Meta-ExternalFetcher
Allow: /

# ── AI — Cohere ──
User-agent: cohere-ai
Allow: /

# ── AI — Mistral ──
User-agent: MistralBot
Allow: /

# ── AI — You.com ──
User-agent: YouBot
Allow: /

# ── AI — Common Crawl (trains many AI models) ──
User-agent: CCBot
Allow: /

# ── AI — Amazon Alexa ──
User-agent: Amazonbot
Allow: /

# ── Sitemap location ──
Sitemap: ${BASE}/sitemap.xml

# ── LLMs.txt for AI systems ──
LLMs: ${BASE}/llms.txt`);
});

// ═══════════════════════════════════════════
// LLMS.TXT — AI-readable practitioner summary
// ═══════════════════════════════════════════
app.get('/llms.txt', (req, res) => {
  res.header('Content-Type', 'text/plain');
  res.header('Cache-Control', 'public, max-age=86400');
  res.sendFile(path.join(__dirname, 'public/llms.txt'));
});

// ═══════════════════════════════════════════
// PAGE ROUTES
// ═══════════════════════════════════════════
app.get(['/', '/home'], (req, res) => rp(res, 'home', {
  currentPage: 'home',
  canonicalUrl: BASE + '/home',
  pageTitle: 'Twish — Registered Psychotherapist in Mississauga, Markham & Burlington | Shimul Rajput',
  metaDesc: 'Registered Psychotherapist Shimul Rajput offers individual, couples, and virtual therapy in Mississauga, Markham, Burlington, and across Canada. Sessions in English, Hindi, and Punjabi. CRPO #18680. Free 15-min consultation.'
}));

app.get('/about', (req, res) => rp(res, 'about', {
  currentPage: 'about',
  canonicalUrl: BASE + '/about',
  pageTitle: 'About Shimul Rajput — Registered Psychotherapist Mississauga, Markham & Burlington | Twish',
  metaDesc: 'Meet Shimul Rajput, CRPO Registered Psychotherapist (Qualifying) #18680. MACP from Yorkville University. Culturally sensitive therapy in English, Hindi, and Punjabi. In-person in Mississauga, Markham, Burlington and virtually across Canada.'
}));

app.get('/services', (req, res) => rp(res, 'services', {
  currentPage: 'services',
  canonicalUrl: BASE + '/services',
  pageTitle: 'Therapy Services — Individual, Couples & Virtual Therapy | Twish Mississauga, Markham & Burlington',
  metaDesc: 'Individual therapy $150, couples therapy $250, free 15-minute consultation. In-person in Mississauga, Markham, and Burlington. Virtual across Canada. CBT, DBT, EFCT, trauma-informed care. CRPO registered.'
}));

app.get('/blog', (req, res) => rp(res, 'blog', {
  currentPage: 'blog',
  canonicalUrl: BASE + '/blog',
  pageTitle: 'Mental Health Blog — Anxiety, Trauma, Burnout and Therapy Insights | Twish',
  metaDesc: 'Evidence-informed mental health articles by Shimul Rajput, Registered Psychotherapist in Mississauga, Markham, and Burlington. Topics: anxiety, depression, trauma recovery, burnout, intergenerational trauma, couples therapy, South Asian mental health.'
}));

app.get('/contact', (req, res) => rp(res, 'contact', {
  currentPage: 'contact',
  canonicalUrl: BASE + '/contact',
  pageTitle: 'Contact Twish — Book Therapy in Mississauga, Markham or Burlington | Shimul Rajput',
  metaDesc: 'Contact Shimul Rajput at Twish. In-person in Mississauga (365 Prince of Wales Dr), Markham (10 Villa Ada Drive), and Burlington. Virtual therapy across Canada. Book your free 15-minute consultation today.'
}));

// ── Blog Articles ──
app.get('/blog/understanding-anxiety', (req, res) => rp(res, 'blog-understanding-anxiety', {
  currentPage: 'blog',
  canonicalUrl: BASE + '/blog/understanding-anxiety',
  pageTitle: 'Understanding Anxiety: Why Your Body Thinks You Are in Danger | Twish',
  metaDesc: 'Anxiety is your nervous system doing its job, sometimes too well. Learn what is actually happening in your body and how therapy in Mississauga, Markham, or Burlington can help you find calm again.'
}));

app.get('/blog/burnout-is-not-laziness', (req, res) => rp(res, 'blog-burnout-is-not-laziness', {
  currentPage: 'blog',
  canonicalUrl: BASE + '/blog/burnout-is-not-laziness',
  pageTitle: 'Burnout Is Not Laziness: What Your Exhaustion Is Really Telling You | Twish',
  metaDesc: 'Chronic exhaustion, cynicism, and a growing sense of ineffectiveness. Understanding the real signs of burnout and how therapy in Mississauga, Markham, or Burlington can help you recover.'
}));

app.get('/blog/four-patterns-damage-relationships', (req, res) => rp(res, 'blog-four-patterns-damage-relationships', {
  currentPage: 'blog',
  canonicalUrl: BASE + '/blog/four-patterns-damage-relationships',
  pageTitle: 'The Four Patterns That Quietly Damage Relationships | Twish',
  metaDesc: 'Criticism, contempt, defensiveness, and stonewalling. Research shows these four communication patterns predict relationship breakdown. Couples therapy in Mississauga, Markham, and Burlington.'
}));

app.get('/blog/intergenerational-trauma', (req, res) => rp(res, 'blog-intergenerational-trauma', {
  currentPage: 'blog',
  canonicalUrl: BASE + '/blog/intergenerational-trauma',
  pageTitle: 'Intergenerational Trauma: Carrying What Was Never Yours to Carry | Twish',
  metaDesc: 'Why the emotional wounds of our parents and grandparents so often become our own, and how trauma-informed therapy in Mississauga, Markham, and Burlington can help you heal.'
}));

app.get('/blog/when-to-start-therapy', (req, res) => rp(res, 'blog-when-to-start-therapy', {
  currentPage: 'blog',
  canonicalUrl: BASE + '/blog/when-to-start-therapy',
  pageTitle: 'How to Know When You Are Ready to Start Therapy | Twish',
  metaDesc: 'You do not need to be in crisis to benefit from therapy. Learn the quiet signs that suggest therapy might help. Book a free consultation in Mississauga, Markham, Burlington, or virtually.'
}));

app.get('/blog/mental-health-south-asian-community', (req, res) => rp(res, 'blog-mental-health-south-asian-community', {
  currentPage: 'blog',
  canonicalUrl: BASE + '/blog/mental-health-south-asian-community',
  pageTitle: 'Mental Health in the South Asian Community: Breaking the Silence | Twish',
  metaDesc: 'Stigma, shame, and the pressure to stay strong. Why mental health is often the hardest conversation in South Asian families. South Asian therapist in Mississauga, Markham, Burlington, and virtually across Canada.'
}));

// ═══════════════════════════════════════════
// CONTACT FORM — Brevo email
// ═══════════════════════════════════════════
app.post('/send-message', async (req, res) => {
  const { name, email, subject, message } = req.body;
  if (!name || !email || !message) return res.status(400).json({ error: 'Missing fields' });
  try {
    const r = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'api-key': process.env.BREVO_API_KEY
      },
      body: JSON.stringify({
        sender: { name: 'Twish Website', email: 'rajputshimul@gmail.com' },
        to: [{ email: 'rajputshimul@gmail.com', name: 'Shimul Rajput' }],
        replyTo: { email, name },
        subject: '[Twish] ' + (subject || 'New message from ' + name),
        htmlContent: `
          <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
            <div style="background:#2C3930;padding:24px;text-align:center;">
              <h2 style="color:#DCD7C9;margin:0;">New Message from Twish Website</h2>
            </div>
            <div style="padding:24px;background:#f9f9f9;">
              <p><strong>Name:</strong> ${name}</p>
              <p><strong>Email:</strong> ${email}</p>
              <p><strong>Subject:</strong> ${subject || 'No subject'}</p>
              <p><strong>Message:</strong></p>
              <div style="background:white;padding:16px;border-radius:8px;border:1px solid #ddd;white-space:pre-wrap;">${message}</div>
            </div>
            <div style="background:#2C3930;padding:16px;text-align:center;">
              <p style="color:#A27B5C;margin:0;font-size:12px;">Twish — Therapy with Shimul | twishcare.ca</p>
            </div>
          </div>`
      })
    });
    if (r.ok) return res.status(200).json({ success: true });
    const e = await r.json();
    console.error('Brevo error:', e);
    res.status(500).json({ error: 'Failed to send message' });
  } catch (e) {
    console.error('Email error:', e.message);
    res.status(500).json({ error: 'Failed to send message' });
  }
});

// ═══════════════════════════════════════════
// SERVER
// ═══════════════════════════════════════════
if (process.env.NODE_ENV !== 'production') {
  app.listen(process.env.PORT || 3000, () => console.log('Twish running on port 3000'));
}

module.exports = app;
