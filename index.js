require('dotenv').config();
const express = require('express');
const session = require('express-session');
const path = require('path');

const app = express();
const BASE_URL = process.env.BASE_URL || 'https://twishcare.ca';

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public'), {
  maxAge: '7d',
  etag: true,
  setHeaders: (res, filePath) => {
    if (filePath.match(/\.(jpg|jpeg|png|gif|webp|svg|ico)$/i)) {
      res.setHeader('Cache-Control', 'public, max-age=604800, immutable');
    } else if (filePath.match(/\.(css|js)$/i)) {
      res.setHeader('Cache-Control', 'public, max-age=86400');
    }
  }
}));
app.use(session({
  secret: process.env.SESSION_SECRET || 'twish-secret-2025',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: process.env.NODE_ENV === 'production', maxAge: 24 * 60 * 60 * 1000 }
}));

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

function renderPage(res, partial, locals = {}) {
  res.render('partials/' + partial, { ...locals, layout: false }, (err, body) => {
    if (err) { console.error(err); return res.status(500).send(err.message); }
    res.render('layout', { ...locals, body });
  });
}

// Sitemap
app.get('/sitemap.xml', (req, res) => {
  res.header('Content-Type', 'application/xml');
  res.send(`<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>${BASE_URL}/home</loc><lastmod>2025-05-24</lastmod><changefreq>weekly</changefreq><priority>1.0</priority></url>
  <url><loc>${BASE_URL}/about</loc><lastmod>2025-05-24</lastmod><changefreq>monthly</changefreq><priority>0.9</priority></url>
  <url><loc>${BASE_URL}/services</loc><lastmod>2025-05-24</lastmod><changefreq>monthly</changefreq><priority>0.9</priority></url>
  <url><loc>${BASE_URL}/contact</loc><lastmod>2025-05-24</lastmod><changefreq>monthly</changefreq><priority>0.8</priority></url>
  <url><loc>${BASE_URL}/blog</loc><lastmod>2025-05-24</lastmod><changefreq>weekly</changefreq><priority>0.7</priority></url>
</urlset>`);
});

// Robots
app.get('/robots.txt', (req, res) => {
  res.header('Content-Type', 'text/plain');
  res.send(`User-agent: *
Allow: /
Disallow: /admin
Sitemap: ${BASE_URL}/sitemap.xml

User-agent: Googlebot
Allow: /

User-agent: Bingbot
Allow: /

User-agent: GPTBot
Allow: /

User-agent: ChatGPT-User
Allow: /

User-agent: PerplexityBot
Allow: /

User-agent: anthropic-ai
Allow: /

User-agent: ClaudeBot
Allow: /`);
});

// Pages
app.get(['/', '/home'], (req, res) => renderPage(res, 'home', {
  currentPage: 'home', canonicalUrl: BASE_URL + '/home',
  pageTitle: 'Twish — Registered Psychotherapist in Mississauga and Markham | Shimul Rajput',
  metaDesc: 'Twish — Registered Psychotherapist Shimul Rajput offers individual therapy, couples therapy, and virtual therapy in Mississauga, Markham, and across Canada. Sessions in English, Hindi, and Punjabi. Book a free 15-minute consultation today. CRPO #18680.'
}));

app.get('/about', (req, res) => renderPage(res, 'about', {
  currentPage: 'about', canonicalUrl: BASE_URL + '/about',
  pageTitle: 'About Shimul Rajput — Registered Psychotherapist Mississauga and Markham | Twish',
  metaDesc: 'Meet Shimul Rajput, Registered Psychotherapist (Qualifying) CRPO #18680. MACP from Yorkville University. Therapy in English, Hindi, and Punjabi in Mississauga, Markham, and virtually across Canada.'
}));

app.get('/services', (req, res) => renderPage(res, 'services', {
  currentPage: 'services', canonicalUrl: BASE_URL + '/services',
  pageTitle: 'Therapy Services — Individual, Couples and Virtual Therapy | Twish Mississauga Markham',
  metaDesc: 'Individual therapy $150, couples therapy $250, and free 15-minute consultation. Serving Mississauga, Markham, and virtually across Canada. CBT, DBT, EFCT, trauma-informed care. CRPO registered.'
}));

app.get('/blog', (req, res) => renderPage(res, 'blog', {
  currentPage: 'blog', canonicalUrl: BASE_URL + '/blog',
  pageTitle: 'Mental Health Blog — Anxiety, Trauma, Burnout and Therapy Insights | Twish',
  metaDesc: 'Mental health articles by Shimul Rajput, Registered Psychotherapist. Topics include anxiety, depression, trauma recovery, burnout, cultural identity, and couples therapy.'
}));

app.get('/contact', (req, res) => renderPage(res, 'contact', {
  currentPage: 'contact', canonicalUrl: BASE_URL + '/contact',
  pageTitle: 'Contact Twish — Book a Therapy Session in Mississauga or Markham | Shimul Rajput',
  metaDesc: 'Contact Shimul Rajput at Twish Therapy. Two locations: 365 Prince of Wales Dr Mississauga and 10 Villa Ada Drive Markham. Virtual therapy across Canada. Book your free 15-minute consultation.'
}));

// Contact form — Brevo API
app.post('/send-message', async (req, res) => {
  const { name, email, subject, message } = req.body;
  if (!name || !email || !message) return res.status(400).json({ error: 'Missing required fields' });
  
  try {
    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'api-key': process.env.BREVO_API_KEY
      },
      body: JSON.stringify({
        sender: { name: 'Twish Website', email: 'rajputshimul@gmail.com' },
        to: [{ email: 'rajputshimul@gmail.com', name: 'Shimul Rajput' }],
        replyTo: { email: email, name: name },
        subject: '[Twish] ' + (subject || 'New message from ' + name),
        htmlContent: `
          <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
            <div style="background:#2C3930;padding:24px;text-align:center;">
              <h2 style="color:#DCD7C9;margin:0;font-size:20px;">New Message from Twish Website</h2>
            </div>
            <div style="padding:24px;background:#f9f9f9;border:1px solid #eee;">
              <p style="margin:0 0 12px;"><strong>Name:</strong> ${name}</p>
              <p style="margin:0 0 12px;"><strong>Email:</strong> ${email}</p>
              <p style="margin:0 0 12px;"><strong>Subject:</strong> ${subject || 'No subject'}</p>
              <p style="margin:0 0 8px;"><strong>Message:</strong></p>
              <div style="background:white;padding:16px;border-radius:8px;border:1px solid #ddd;">
                <p style="margin:0;white-space:pre-wrap;">${message}</p>
              </div>
            </div>
            <div style="background:#2C3930;padding:16px;text-align:center;">
              <p style="color:#A27B5C;margin:0;font-size:12px;">Twish — Therapy with Shimul | twishcare.ca</p>
            </div>
          </div>`
      })
    });

    if (response.ok) {
      res.status(200).json({ success: true });
    } else {
      const err = await response.json();
      console.error('Brevo error:', err);
      res.status(500).json({ error: 'Failed to send message' });
    }
  } catch (err) {
    console.error('Email error:', err.message);
    res.status(500).json({ error: 'Failed to send message' });
  }
});

// Only listen when running locally, not on Vercel
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => console.log('Twish running on port ' + PORT));
}

module.exports = app;