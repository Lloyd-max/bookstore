import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import bcrypt from 'bcrypt';
import session from 'express-session';
import Stripe from 'stripe';
import { sql } from './db.mjs';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

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

// --- STRIPE WEBHOOK ROUTE (Must be defined BEFORE express.json()) ---
app.post('/api/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;

  try {
    // If webhook secret is configured, verify signature securely
    if (endpointSecret) {
      event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
    } else {
      // Fallback for local testing if secret isn't set yet
      event = JSON.parse(req.body.toString());
    }
  } catch (err) {
    console.error(`⚠️ Webhook signature verification failed:`, err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the checkout.session.completed event
  if (event.type === 'checkout.session.completed') {
    const sessionObj = event.data.object;
    const sessionId = sessionObj.id;

    try {
      // Update order status to 'paid' in Neon PostgreSQL
      const updateResult = await sql`
        UPDATE orders 
        SET status = 'paid' 
        WHERE stripe_session_id = ${sessionId}
        RETURNING id, user_id, total_amount;
      `;

      if (updateResult.length > 0) {
        console.log(`✅ Order marked as PAID for session ID: ${sessionId}`);
      } else {
        console.warn(`⚠️ Order not found for Stripe session ID: ${sessionId}`);
      }
    } catch (err) {
      console.error('❌ Error updating order status in database:', err);
      return res.status(500).json({ error: 'Database update failed' });
    }
  }

  // Acknowledge receipt of the event to Stripe
  res.json({ received: true });
});

// JSON body parser for all other regular API routes
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

// --- STRIPE CHECKOUT ROUTE ---

// Middleware to block unauthenticated users from checking out
const requireAuth = (req, res, next) => {
  if (!req.session || !req.session.userId) {
    return res.status(401).json({ error: 'You must be signed in to checkout.' });
  }
  next();
};

app.post('/api/create-checkout-session', requireAuth, async (req, res) => {
  try {
    const { items } = req.body; // Expects [{ bookId: 'quiet-harbour', quantity: 1 }, ...]
    
    if (!items || items.length === 0) {
      return res.status(400).json({ error: 'No items provided for checkout.' });
    }

    const userId = req.session.userId;
    let totalAmount = 0;
    const lineItemsForStripe = [];
    const verifiedOrderItems = [];

    // CRITICAL SECURITY RULE: Look up true prices from the database, never trust the browser!
    for (const item of items) {
      const result = await sql`SELECT * FROM books WHERE id = ${item.bookId}`;
      if (result.length === 0) {
        return res.status(404).json({ error: `Book not found: ${item.bookId}` });
      }
      const book = result[0];

      // Parse price (e.g., 'R289' -> 289.00)
      const cleanPrice = parseFloat(book.price.replace(/[^0-9.]/g, ''));
      const quantity = item.quantity || 1;
      totalAmount += cleanPrice * quantity;

      // Stripe expects currency amounts in cents (smallest currency unit)
      lineItemsForStripe.push({
        price_data: {
          currency: 'zar',
          product_data: {
            name: book.title,
            description: `Author: ${book.author}`,
          },
          unit_amount: Math.round(cleanPrice * 100),
        },
        quantity: quantity,
      });

      verifiedOrderItems.push({
        book_id: book.id,
        quantity: quantity,
        price: cleanPrice,
      });
    }

    // Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
    
      line_items: lineItemsForStripe,
      mode: 'payment',
      success_url: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/cart`,
      metadata: {
        userId: userId.toString(),
      },
    });

    // Save initial order record with status 'pending' in Neon DB
    const orderResult = await sql`
      INSERT INTO orders (user_id, stripe_session_id, total_amount, status)
      VALUES (${userId}, ${session.id}, ${totalAmount}, 'pending')
      RETURNING id;
    `;
    const orderId = orderResult[0].id;

    // Save order items linked to this order
    for (const orderItem of verifiedOrderItems) {
      await sql`
        INSERT INTO order_items (order_id, book_id, quantity, price)
        VALUES (${orderId}, ${orderItem.book_id}, ${orderItem.quantity}, ${orderItem.price})
      `;
    }

    // Return Stripe Checkout URL to the frontend
    res.json({ url: session.url });

  } catch (err) {
    console.error('Error creating checkout session:', err);
    res.status(500).json({ error: 'Internal server error during checkout.' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});//