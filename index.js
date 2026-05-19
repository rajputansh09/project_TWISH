require('dotenv').config();
const express = require('express');
const nodemailer = require('nodemailer');
const session = require('express-session');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

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

app.get(['/', '/home'], (req, res) => {
  renderPage(res, 'home', {
    pageTitle: 'Twish — Psychotherapist in Mississauga | Shimul Rajput',
    metaDesc: 'Twish offers individual, couples and virtual therapy in Mississauga, Ontario. Registered Psychotherapist Shimul Rajput provides culturally sensitive therapy in English, Hindi and Punjabi.'
  });
});

app.get('/about', (req, res) => {
  renderPage(res, 'about', {
    pageTitle: 'About Shimul Rajput — South Asian Therapist Mississauga | Twish',
    metaDesc: 'Meet Shimul Rajput, Registered Psychotherapist (Qualifying) in Mississauga. MACP from Yorkville University. Culturally sensitive therapy in English, Hindi and Punjabi.'
  });
});

app.get('/services', (req, res) => {
  renderPage(res, 'services', {
    pageTitle: 'Therapy Services — Individual, Couples & Virtual | Twish Mississauga',
    metaDesc: 'Individual therapy, couples therapy, and virtual therapy in Mississauga, Ontario. $150/50 min. Free 15-minute consultation available.'
  });
});

app.get('/blog', (req, res) => {
  renderPage(res, 'blog', {
    pageTitle: 'Mental Health Blog — Twish Therapy Mississauga',
    metaDesc: 'Articles on mental health, anxiety, relationships, South Asian identity, and therapy insights by Shimul Rajput, psychotherapist in Mississauga.'
  });
});

app.get('/contact', (req, res) => {
  renderPage(res, 'contact', {
    pageTitle: 'Contact Twish — Book a Therapy Session in Mississauga',
    metaDesc: 'Contact Shimul Rajput at Twish Therapy, 365 Prince of Wales Dr, Mississauga. Book your free 15-minute consultation today.',
    email: process.env.CONTACT_EMAIL || 'rajputshimul@gmail.com',
    phone: '(647) 616-5744',
    address: '365 Prince of Wales Dr, Mississauga, ON L5B 0G6'
  });
});

app.get('/signin', (req, res) => {
  renderPage(res, 'signIn', { pageTitle: 'Sign In — Twish' });
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