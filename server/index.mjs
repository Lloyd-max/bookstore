import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import bcrypt from 'bcrypt';
import session from 'express-session';
import { sql } from './db.mjs';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Allow local development and your production frontend URL (once deployed)
const allowedOrigins = [
  process.env.FRONTEND_URL,
  'http://localhost:5173',
  'http://localhost:3000'
];

app.use(cors({
  origin: function (origin, callback) {
    // Allow non-browser requests (like curl, Postman, server-to-server)
    if (!origin) return callback(null, true);

    // Allow exact matches or any Vercel preview deployment (*.vercel.app)
    if (allowedOrigins.includes(origin) || origin.endsWith('.vercel.app')) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));
app.use(express.json());

// Session Configuration
app.use(session({
  secret: process.env.SESSION_SECRET || 'super-secret-key-change-me',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false, // Set to true if using HTTPS in production
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000 // 1 day session
  }
}));

// Test database connection on startup over HTTPS
sql`SELECT NOW()`
  .then(res => {
    console.log('✅ Connected to Neon PostgreSQL successfully over HTTPS at:', res[0].now);
  })
  .catch(err => {
    console.error('❌ Database connection test failed on startup:', err);
  });

// --- BOOKS ROUTE ---
app.get('/api/books', async (req, res) => {
  try {
    const books = await sql`SELECT * FROM books`;
    res.json(books);
  } catch (err) {
    console.error('Error fetching books:', err);
    res.status(500).json({ error: 'Server error while fetching books' });
  }
});

// --- AUTH ROUTES ---

// 1. Register User
app.post('/api/register', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Check if user already exists
    const existing = await sql`SELECT * FROM users WHERE email = ${email}`;
    if (existing.length > 0) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    // Hash password
    const saltRounds = 10;
    const password_hash = await bcrypt.hash(password, saltRounds);

    // Insert user into database
    const [newUser] = await sql`
      INSERT INTO users (email, password_hash) 
      VALUES (${email}, ${password_hash}) 
      RETURNING id, email, created_at
    `;

    // Automatically log them in by setting session
    req.session.userId = newUser.id;
    req.session.email = newUser.email;

    res.status(201).json({ message: 'Registration successful', user: { email: newUser.email } });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ error: 'Server error during registration' });
  }
});

// 2. Login User
app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Find user
    const users = await sql`SELECT * FROM users WHERE email = ${email}`;
    if (users.length === 0) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const user = users[0];

    // Verify password hash
    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Set session
    req.session.userId = user.id;
    req.session.email = user.email;

    res.json({ message: 'Login successful', user: { email: user.email } });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Server error during login' });
  }
});

// 3. Check Current Session (Survives Page Refresh)
app.get('/api/me', (req, res) => {
  if (req.session && req.session.userId) {
    res.json({ loggedIn: true, user: { email: req.session.email } });
  } else {
    res.json({ loggedIn: false });
  }
});

// 4. Logout
app.post('/api/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) {
      return res.status(500).json({ error: 'Could not log out' });
    }
    res.clearCookie('connect.sid');
    res.json({ message: 'Logged out successfully' });
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});