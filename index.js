require('dotenv').config();
const express = require('express');
const nodemailer = require('nodemailer');
const session = require('express-session');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;
const BASE_URL = process.env.BASE_URL || 'https://twishcare-ca.onrender.com';

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
  secret: process.env.SESSION_SECRET || 'twish-secret-2025',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false, maxAge: 24 * 60 * 60 * 1000 }
}));

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

function renderPage(res, partial, locals = {}) {
  res.render('partials/' + partial, { ...locals, layout: false }, (err, body) => {
    if (err) { console.error(err); return res.status(500).send(err.message); }
    res.render('layout', { ...locals, body });
  });
}

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
});

// Serve sitemap.xml
app.get('/sitemap.xml', (req, res) => {
  res.header('Content-Type', 'application/xml');
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>${BASE_URL}/home</loc><lastmod>2025-05-23</lastmod><changefreq>weekly</changefreq><priority>1.0</priority></url>
  <url><loc>${BASE_URL}/about</loc><lastmod>2025-05-23</lastmod><changefreq>monthly</changefreq><priority>0.9</priority></url>
  <url><loc>${BASE_URL}/services</loc><lastmod>2025-05-23</lastmod><changefreq>monthly</changefreq><priority>0.9</priority></url>
  <url><loc>${BASE_URL}/contact</loc><lastmod>2025-05-23</lastmod><changefreq>monthly</changefreq><priority>0.8</priority></url>
  <url><loc>${BASE_URL}/blog</loc><lastmod>2025-05-23</lastmod><changefreq>weekly</changefreq><priority>0.7</priority></url>
</urlset>`;
  res.send(sitemap);
});

// Serve robots.txt
app.get('/robots.txt', (req, res) => {
  res.header('Content-Type', 'text/plain');
  res.send(`User-agent: *
Allow: /
Disallow: /signin
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

app.get(['/', '/home'], (req, res) => {
  renderPage(res, 'home', {
    currentPage: 'home',
    canonicalUrl: BASE_URL + '/home',
    pageTitle: 'Twish — Registered Psychotherapist in Mississauga and Markham | Shimul Rajput',
    metaDesc: 'Twish — Registered Psychotherapist Shimul Rajput offers individual therapy, couples therapy, and virtual therapy in Mississauga, Markham, and across Canada. Sessions in English, Hindi, and Punjabi. Book a free 15-minute consultation today. CRPO #18680.'
  });
});

app.get('/about', (req, res) => {
  renderPage(res, 'about', {
    currentPage: 'about',
    canonicalUrl: BASE_URL + '/about',
    pageTitle: 'About Shimul Rajput — Registered Psychotherapist Mississauga and Markham | Twish',
    metaDesc: 'Meet Shimul Rajput, Registered Psychotherapist (Qualifying) CRPO #18680. MACP from Yorkville University. Offering therapy in English, Hindi, and Punjabi in Mississauga, Markham, and virtually across Canada.'
  });
});

app.get('/services', (req, res) => {
  renderPage(res, 'services', {
    currentPage: 'services',
    canonicalUrl: BASE_URL + '/services',
    pageTitle: 'Therapy Services — Individual, Couples and Virtual Therapy | Twish Mississauga Markham',
    metaDesc: 'Individual therapy $150, couples therapy $250, and free 15-minute consultation. Serving Mississauga, Markham, and virtually across Canada. CBT, DBT, EFCT, trauma-informed care. Sessions in English, Hindi, Punjabi. CRPO registered therapist.'
  });
});

app.get('/blog', (req, res) => {
  renderPage(res, 'blog', {
    currentPage: 'blog',
    canonicalUrl: BASE_URL + '/blog',
    pageTitle: 'Mental Health Blog — Anxiety, Trauma, Burnout and Therapy Insights | Twish',
    metaDesc: 'Mental health articles by Shimul Rajput, Registered Psychotherapist. Topics include anxiety, depression, trauma recovery, burnout, cultural identity, couples therapy, and South Asian mental health in Canada.'
  });
});

app.get('/contact', (req, res) => {
  renderPage(res, 'contact', {
    currentPage: 'contact',
    canonicalUrl: BASE_URL + '/contact',
    pageTitle: 'Contact Twish — Book a Therapy Session in Mississauga or Markham | Shimul Rajput',
    metaDesc: 'Contact Shimul Rajput at Twish Therapy. Two locations: 365 Prince of Wales Dr Mississauga and 10 Villa Ada Drive Markham. Virtual therapy across Canada. Book your free 15-minute consultation. Call (647) 616-5744.',
    email: process.env.CONTACT_EMAIL || 'rajputshimul@gmail.com',
    phone: '(647) 616-5744',
    address: '365 Prince of Wales Dr, Mississauga, ON L5B 0G6'
  });
});

app.get('/signin', (req, res) => {
  renderPage(res, 'signIn', {
    currentPage: '',
    canonicalUrl: BASE_URL + '/signin',
    pageTitle: 'Sign In — Twish Admin'
  });
});

app.post('/send-message', async (req, res) => {
  const { name, email, subject, message } = req.body;
  if (!name || !email || !message) return res.status(400).json({ error: 'Missing required fields' });
  try {
    await transporter.sendMail({
      from: '"Twish Website" <' + process.env.EMAIL_USER + '>',
      to: process.env.CONTACT_EMAIL || 'rajputshimul@gmail.com',
      replyTo: email,
      subject: '[Twish] ' + (subject || 'New message from ' + name),
      html: '<h2>New message from Twish website</h2><p><strong>Name:</strong> ' + name + '</p><p><strong>Email:</strong> ' + email + '</p><p><strong>Subject:</strong> ' + subject + '</p><p><strong>Message:</strong><br>' + message.replace(/\n/g, '<br>') + '</p>'
    });
    res.status(200).json({ success: true });
  } catch (err) {
    console.error('Email error:', err.message);
    res.status(500).json({ error: 'Failed to send message' });
  }
});

app.post('/admin-login', (req, res) => {
  const { password } = req.body;
  if (password === process.env.ADMIN_PASSWORD) { req.session.isAdmin = true; res.redirect('/blog'); }
  else res.redirect('/signin?error=1');
});

app.get('/admin-logout', (req, res) => { req.session.destroy(); res.redirect('/home'); });

app.listen(PORT, () => console.log('Twish running on port ' + PORT));