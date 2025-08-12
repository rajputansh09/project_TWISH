import express from 'express';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import nodemailer from 'nodemailer';
import methodOverride from 'method-override';
import { v4 as uuidv4 } from 'uuid';
import session from 'express-session';

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const __dirname = dirname(fileURLToPath(import.meta.url));

const app = express();
const port = 3000;

// Static posts (fixed content)
const blogPosts = [
  { title: 'Blog post 1', content: 'Content of blog post 1' },
  { title: 'Blog post 2', content: 'Content of blog post 2' },
];

const nestPosts = [
  { title: 'Nest post 1', content: 'Content of nest post 1' },
  { title: 'Nest post 2', content: 'Content of nest post 2' },
];

const bloomPosts = [
  { title: 'Bloom post 1', content: 'Content of bloom post 1' },
  { title: 'Bloom post 2', content: 'Content of bloom post 2' },
];

// ... add other static post arrays similarly ...
const flowPosts = [
  { title: 'Flow post 1', content: 'Content of flow post 1' },
  { title: 'Flow post 2', content: 'Content of flow post 2' },
];
const loomPosts = [
  { title: 'Loom post 1', content: 'Content of loom post 1' },
  { title: 'Loom post 2', content: 'Content of loom post 2' },
];
const renewPosts = [
  { title: 'Renew post 1', content: 'Content of renew post 1' },
  { title: 'Renew post 2', content: 'Content of renew post 2' },
];
const pearlPosts = [
  { title: 'Pearl post 1', content: 'Content of pearl post 1' },
  { title: 'Pearl post 2', content: 'Content of pearl post 2' },
];
const glowPosts = [
  { title: 'Glow post 1', content: 'Content of glow post 1' },
  { title: 'Glow post 2', content: 'Content of glow post 2' },
];
const litPosts = [
  { title: 'Lit post 1', content: 'Content of lit post 1' },
  { title: 'Lit post 2', content: 'Content of lit post 2' },
];
const voicePosts = [
  { title: 'Voice post 1', content: 'Content of voice post 1' },
  { title: 'Voice post 2', content: 'Content of voice post 2' },
];

// Dynamic posts (user created)
let posts = [];

// Admin username (you)
const ADMIN_USERNAME = 'anshrajput'; // Change as needed

// Middleware setup
app.use(express.static(join(__dirname, 'public')));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));

app.set('view engine', 'ejs');

// Session setup
app.use(session({
  secret: 'your-super-secret-key', // Replace with a strong secret for production
  resave: false,
  saveUninitialized: true,
}));



// Make currentUser and ADMIN_USERNAME available in all EJS templates
app.use((req, res, next) => {
  res.locals.currentUser = req.session.username || null;
  res.locals.ADMIN_USERNAME = ADMIN_USERNAME;
  next();
});

// --- ROUTES ---

// Home page
app.get('/', (req, res) => {
  res.render('index.ejs');
});

// Signin routes
app.get('/signin', (req, res) => {
  res.render('signin.ejs');
});

app.post('/signin', (req, res) => {
  const password = req.body['floatingPassword'];
  if (password === 'Rajputansh09') {
    req.session.username = ADMIN_USERNAME;
    res.redirect('/home');
  } else {
    res.render('index.ejs', { error: 'Invalid password' });
  }
});

// Static pages
app.get('/home', (req, res) => res.render('partials/home.ejs'));
app.get('/about', (req, res) => res.render('partials/about.ejs'));
app.get('/services', (req, res) => res.render('partials/services.ejs'));

// Blog page with static posts
app.get('/blog', (req, res) => {
  res.render('partials/blog.ejs', {
    currentFolder: 'partials',
    currentPage: 'blog',
    posts: blogPosts,
  });
});

// Contact page
app.get('/contact', (req, res) => {
  res.render('partials/contact.ejs', {
    email: 'shimul@twishcare.ca',
    phone: '+1 (647) 617-5744',
    address: '39 Dunbar St, Belleville, ON K8P 3R6',
  });
});

// Contact form submission
app.post('/send-message', async (req, res) => {
  const { name, email, subject, message } = req.body;

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'shimul@twishcare.ca',
      pass: process.env.EMAIL_PASSWORD, // Use env var for security
    },
  });

  const mailOptions = {
    from: 'shimul@twishcare.ca',
    replyTo: email,
    to: 'shimul@twishcare.ca',
    subject: `Twish Website Contact: ${subject}`,
    text: `
From: ${name}
Email: ${email}

Message:
${message}
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    res.render('partials/contact.ejs', {
      email: 'shimul@twishcare.ca',
      phone: '+1 (647) 617-5744',
      address: '39 Dunbar St, Belleville, ON K8P 3R6',
      success: true,
    });
  } catch (err) {
    console.error('Email send error:', err);
    res.render('partials/contact.ejs', {
      email: 'shimul@twishcare.ca',
      phone: '+1 (647) 617-5744',
      address: '39 Dunbar St, Belleville, ON K8P 3R6',
      success: false,
    });
  }
});

// Blog files routes with static posts + posts passed for search functionality
const blogFileRoutes = [
  { path: 'bloom', posts: bloomPosts },
  { path: 'nest', posts: nestPosts },
  { path: 'flow', posts: flowPosts },
  { path: 'loom', posts: loomPosts },
  { path: 'renew', posts: renewPosts },
  { path: 'pearl', posts: pearlPosts },
  { path: 'glow', posts: glowPosts },
  { path: 'lit', posts: litPosts },
  { path: 'voice', posts: voicePosts },
];

// Register blogFiles routes dynamically
blogFileRoutes.forEach(({ path, posts }) => {
  app.get(`/${path}`, (req, res) => {
    res.render(`blogFiles/${path}`, {
      currentFolder: 'blogFiles',
      currentPage: path,
      posts,
    });
  });
});

// --- Authentication routes for YouPost ---

// Login page (username based login)
app.get('/login', (req, res) => {
  res.render('blogFiles/login.ejs');
});

// Login POST
app.post('/login', (req, res) => {
  const { username } = req.body;
  if (!username || username.trim() === '') {
    return res.send('Please provide a username');
  }
  req.session.username = username.trim();
  res.redirect('/youPost');
});

// Logout POST
app.post('/logout', (req, res) => {
  req.session.destroy(() => {
    res.redirect('/youPost');
  });
});

// --- YouPost dynamic posts routes ---

// Render YouPost page
app.get('/youPost', (req, res) => {
  res.render('blogFiles/youPost.ejs', {
    currentFolder: 'blogFiles',
    currentPage: 'youPost',
    posts: posts,
    q: "",
    currentUser: req.session.username || null,
    ADMIN_USERNAME,
  });
});

// Create new post
app.post('/posts', (req, res) => {
  const { title, content } = req.body;
  const username = req.session.username;

  if (!username) {
    return res.send('You must be logged in to create a post. <a href="/login">Login here</a>');
  }
  if (!title || !content) {
    return res.status(400).send('Title and content are required');
  }

  const newPost = {
    _id: uuidv4(),
    title,
    content,
    author: username,
  };

  posts.push(newPost);
  res.redirect('/youPost');
});

// Update existing post
app.put('/posts/:id', (req, res) => {
  const postId = req.params.id;
  const { title, content } = req.body;
  const username = req.session.username;

  const post = posts.find((p) => p._id === postId);
  if (!post) {
    return res.status(404).send('Post not found');
  }
  if (!username) {
    return res.send('You must be logged in to edit a post.');
  }
  if (post.author !== username && username !== ADMIN_USERNAME) {
    return res.status(403).send('You do not have permission to edit this post.');
  }
  if (!title || !content) {
    return res.status(400).send('Title and content are required');
  }

  post.title = title;
  post.content = content;

  res.redirect('/youPost');
});

// Delete post
app.delete('/posts/:id', (req, res) => {
  const postId = req.params.id;
  const username = req.session.username;

  const post = posts.find((p) => p._id === postId);
  if (!post) {
    return res.status(404).send('Post not found');
  }
  if (!username) {
    return res.send('You must be logged in to delete a post.');
  }
  if (post.author !== username && username !== ADMIN_USERNAME) {
    return res.status(403).send('You do not have permission to delete this post.');
  }

  posts = posts.filter((p) => p._id !== postId);
  res.redirect('/youPost');
});

// --- Search route ---

app.get('/search', (req, res) => {
  const { q, folder, page } = req.query;

  // Helper function to get posts by page
  function getPostsByPage(page) {
    switch (page) {
      case 'blog': return blogPosts;
      case 'nest': return nestPosts;
      case 'bloom': return bloomPosts;
      case 'flow': return flowPosts;
      case 'loom': return loomPosts;
      case 'renew': return renewPosts;
      case 'lit': return litPosts;
      case 'pearl': return pearlPosts;
      case 'glow': return glowPosts;
      case 'voice': return voicePosts;
      case 'youPost': return posts;
      default: return null;
    }
  }

  const pagePosts = getPostsByPage(page);
  if (!pagePosts) {
    return res.status(400).send('Invalid page parameter for search');
  }

  if (!q || q.trim() === '') {
    // No search query: render full page with all posts
    return res.render(`${folder}/${page}`, {
      currentFolder: folder,
      currentPage: page,
      posts: pagePosts,
      q: '',
    });
  }

  if (page === 'youPost') {
    // On youPost page, filter by title OR content
    const filteredPosts = pagePosts.filter(post =>
      post.title.toLowerCase().includes(q.toLowerCase()) ||
      post.content.toLowerCase().includes(q.toLowerCase())
    );

    return res.render(`${folder}/${page}`, {
      currentFolder: folder,
      currentPage: page,
      q,
      posts: filteredPosts,
      currentUser: req.session.username || null,
      ADMIN_USERNAME,
    });
  } else {
    // On other pages, do NOT filter posts server-side
    // Just redirect back to the page with the query param
    return res.redirect(`/${page}?q=${encodeURIComponent(q)}`);
  }
});


// --- Start the server ---
app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
