require('dotenv').config();
const express = require('express');
const session = require('express-session');
const path = require('path');

const app = express();
const BASE = 'https://twishcare.ca';
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
// SITEMAP
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
// ROBOTS.TXT
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
// LLMS.TXT
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

  // ── Honeypot — silently block bots ──
  if (req.body.website) return res.status(200).json({ success: true });

  if (!name || !email || !message) return res.status(400).json({ error: 'Missing fields' });

  try {

    // ── EMAIL 1: Notification to Shimul ──
    const toShimul = await fetch('https://api.brevo.com/v3/smtp/email', {
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
        subject: '🌿 New Message via Twish — ' + (subject || 'General Inquiry') + ' from ' + name,
        htmlContent: `
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#f4efe6;font-family:'Georgia',serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4efe6;padding:40px 20px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(44,57,48,0.1);">
        <tr>
          <td style="background:#2C3930;padding:32px 40px;text-align:center;">
            <p style="margin:0;font-family:'Georgia',serif;font-size:11px;font-weight:500;letter-spacing:0.25em;text-transform:uppercase;color:#A27B5C;">Twish — Therapy with Shimul</p>
            <h1 style="margin:12px 0 0;font-family:'Georgia',serif;font-size:26px;font-weight:400;color:#DCD7C9;letter-spacing:0.02em;">New Message Received</h1>
          </td>
        </tr>
        <tr><td style="height:3px;background:linear-gradient(90deg,#A27B5C,#C4956A);"></td></tr>
        <tr>
          <td style="padding:40px;">
            <p style="margin:0 0 24px;font-family:'Georgia',serif;font-size:15px;color:#4A4A45;line-height:1.7;">Hi Shimul, someone has reached out through your website. Here are their details:</p>
            <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:16px;">
              <tr>
                <td width="48%" style="background:#f4efe6;border-radius:10px;padding:16px 20px;vertical-align:top;">
                  <p style="margin:0 0 4px;font-family:'Georgia',serif;font-size:10px;font-weight:600;letter-spacing:0.2em;text-transform:uppercase;color:#A27B5C;">Name</p>
                  <p style="margin:0;font-family:'Georgia',serif;font-size:15px;color:#2C3930;font-weight:600;">${name}</p>
                </td>
                <td width="4%"></td>
                <td width="48%" style="background:#f4efe6;border-radius:10px;padding:16px 20px;vertical-align:top;">
                  <p style="margin:0 0 4px;font-family:'Georgia',serif;font-size:10px;font-weight:600;letter-spacing:0.2em;text-transform:uppercase;color:#A27B5C;">Email</p>
                  <p style="margin:0;font-family:'Georgia',serif;font-size:15px;color:#2C3930;"><a href="mailto:${email}" style="color:#A27B5C;text-decoration:none;">${email}</a></p>
                </td>
              </tr>
            </table>
            <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:16px;">
              <tr>
                <td style="background:#f4efe6;border-radius:10px;padding:16px 20px;">
                  <p style="margin:0 0 4px;font-family:'Georgia',serif;font-size:10px;font-weight:600;letter-spacing:0.2em;text-transform:uppercase;color:#A27B5C;">Subject</p>
                  <p style="margin:0;font-family:'Georgia',serif;font-size:15px;color:#2C3930;">${subject || 'No subject provided'}</p>
                </td>
              </tr>
            </table>
            <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:32px;">
              <tr>
                <td style="background:#2C3930;border-radius:10px;padding:24px;">
                  <p style="margin:0 0 8px;font-family:'Georgia',serif;font-size:10px;font-weight:600;letter-spacing:0.2em;text-transform:uppercase;color:#A27B5C;">Their Message</p>
                  <p style="margin:0;font-family:'Georgia',serif;font-size:15px;color:#DCD7C9;line-height:1.8;white-space:pre-wrap;">${message}</p>
                </td>
              </tr>
            </table>
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td align="center">
                  <a href="mailto:${email}?subject=Re: ${subject || 'Your message to Twish'}" style="display:inline-block;background:#A27B5C;color:#ffffff;font-family:'Georgia',serif;font-size:13px;font-weight:500;letter-spacing:0.12em;text-transform:uppercase;padding:14px 32px;border-radius:999px;text-decoration:none;">Reply to ${name}</a>
                </td>
              </tr>
            </table>
          </td>
        </tr>
        <tr>
          <td style="background:#1A2320;padding:24px 40px;text-align:center;">
            <p style="margin:0;font-family:'Georgia',serif;font-size:11px;color:rgba(220,215,201,0.4);letter-spacing:0.1em;">twishcare.ca &bull; (647) 616-5744 &bull; rajputshimul@gmail.com</p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`
      })
    });

    // ── EMAIL 2: Confirmation to the sender ──
    const toSender = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'api-key': process.env.BREVO_API_KEY
      },
      body: JSON.stringify({
        sender: { name: 'Shimul Rajput — Twish', email: 'rajputshimul@gmail.com' },
        to: [{ email, name }],
        subject: 'Thank you for reaching out — Twish',
        htmlContent: `
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#f4efe6;font-family:'Georgia',serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4efe6;padding:40px 20px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(44,57,48,0.1);">
        <tr>
          <td style="background:#2C3930;padding:40px;text-align:center;">
            <p style="margin:0 0 8px;font-family:'Georgia',serif;font-size:11px;font-weight:500;letter-spacing:0.25em;text-transform:uppercase;color:#A27B5C;">Twish — Therapy with Shimul</p>
            <h1 style="margin:0;font-family:'Georgia',serif;font-size:28px;font-weight:400;color:#DCD7C9;letter-spacing:0.02em;">Thank you, ${name}.</h1>
          </td>
        </tr>
        <tr><td style="height:3px;background:linear-gradient(90deg,#A27B5C,#C4956A);"></td></tr>
        <tr>
          <td style="padding:40px;">
            <p style="margin:0 0 20px;font-family:'Georgia',serif;font-size:16px;color:#4A4A45;line-height:1.8;">Reaching out takes courage, and I want you to know your message has been received.</p>
            <p style="margin:0 0 28px;font-family:'Georgia',serif;font-size:16px;color:#4A4A45;line-height:1.8;">I personally read every message and will be in touch within <strong style="color:#2C3930;">one to two business days</strong>. In the meantime, please know that taking this step, however small it might feel, matters.</p>

            <!-- What happens next -->
            <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:32px;">
              <tr>
                <td style="background:#f4efe6;border-radius:12px;padding:28px;border-left:4px solid #A27B5C;">
                  <p style="margin:0 0 20px;font-family:'Georgia',serif;font-size:11px;font-weight:600;letter-spacing:0.2em;text-transform:uppercase;color:#A27B5C;">What Happens Next</p>
                  <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:16px;">
                    <tr>
                      <td width="36" valign="top" style="padding-top:2px;">
                        <div style="width:28px;height:28px;background:#2C3930;border-radius:14px;text-align:center;line-height:28px;font-family:'Georgia',serif;color:#A27B5C;font-size:13px;font-weight:600;display:inline-block;">1</div>
                      </td>
                      <td style="font-family:'Georgia',serif;font-size:14px;color:#4A4A45;line-height:1.75;padding-left:8px;">Shimul reviews your message and responds warmly within 1 to 2 business days.</td>
                    </tr>
                  </table>
                  <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:16px;">
                    <tr>
                      <td width="36" valign="top" style="padding-top:2px;">
                        <div style="width:28px;height:28px;background:#2C3930;border-radius:14px;text-align:center;line-height:28px;font-family:'Georgia',serif;color:#A27B5C;font-size:13px;font-weight:600;display:inline-block;">2</div>
                      </td>
                      <td style="font-family:'Georgia',serif;font-size:14px;color:#4A4A45;line-height:1.75;padding-left:8px;">You will be invited to a free 15-minute consultation, no commitment, no pressure.</td>
                    </tr>
                  </table>
                  <table width="100%" cellpadding="0" cellspacing="0">
                    <tr>
                      <td width="36" valign="top" style="padding-top:2px;">
                        <div style="width:28px;height:28px;background:#2C3930;border-radius:14px;text-align:center;line-height:28px;font-family:'Georgia',serif;color:#A27B5C;font-size:13px;font-weight:600;display:inline-block;">3</div>
                      </td>
                      <td style="font-family:'Georgia',serif;font-size:14px;color:#4A4A45;line-height:1.75;padding-left:8px;">Your first session in Mississauga, Markham, Burlington, or virtually across Canada.</td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>

            <!-- Quote -->
            <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:32px;">
              <tr>
                <td style="border-top:1px solid rgba(162,123,92,0.3);border-bottom:1px solid rgba(162,123,92,0.3);padding:24px 0;text-align:center;">
                  <p style="margin:0;font-family:'Georgia',serif;font-size:18px;font-style:italic;color:#2C3930;line-height:1.6;">"You don't have to have it all figured out<br>to take the first step."</p>
                  <p style="margin:12px 0 0;font-family:'Georgia',serif;font-size:11px;letter-spacing:0.15em;text-transform:uppercase;color:#A27B5C;"> — Shimul Rajput</p>
                </td>
              </tr>
            </table>

            <!-- Book button -->
            <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:32px;">
              <tr>
                <td align="center">
                  <p style="margin:0 0 16px;font-family:'Georgia',serif;font-size:14px;color:#4A4A45;">If you would like to book directly, your free consultation is just one click away:</p>
                  <a href="https://twishcare.kindred.site/providers/shimul_rajput/booking" style="display:inline-block;background:#A27B5C;color:#ffffff;font-family:'Georgia',serif;font-size:12px;font-weight:500;letter-spacing:0.15em;text-transform:uppercase;padding:14px 32px;border-radius:999px;text-decoration:none;">Book Free 15-Min Consult</a>
                </td>
              </tr>
            </table>

            <!-- Sign off -->
            <p style="margin:0;font-family:'Georgia',serif;font-size:15px;color:#4A4A45;line-height:1.9;">With warmth,<br><strong style="color:#2C3930;font-size:17px;">Shimul Rajput</strong><br><span style="font-size:12px;color:#A27B5C;letter-spacing:0.1em;text-transform:uppercase;">Registered Psychotherapist (Qualifying) &bull; CRPO #18680</span></p>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="background:#1A2320;padding:28px 40px;text-align:center;">
            <p style="margin:0 0 6px;font-family:'Georgia',serif;font-size:13px;color:rgba(220,215,201,0.6);">Mississauga &bull; Markham &bull; Burlington &bull; Virtual across Canada</p>
            <p style="margin:0;font-family:'Georgia',serif;font-size:11px;color:rgba(220,215,201,0.3);letter-spacing:0.08em;">twishcare.ca &bull; (647) 616-5744</p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`
      })
    });

    if (toShimul.ok && toSender.ok) return res.status(200).json({ success: true });
    const e1 = toShimul.ok ? null : await toShimul.json();
    const e2 = toSender.ok ? null : await toSender.json();
    console.error('Brevo error:', e1 || e2);
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
