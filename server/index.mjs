import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { sql } from './db.mjs';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());

// Test database connection on startup over HTTPS
sql`SELECT NOW()`
  .then(res => {
    console.log('✅ Connected to Neon PostgreSQL successfully over HTTPS at:', res[0].now);
  })
  .catch(err => {
    console.error('❌ Database connection test failed on startup:', err);
  });

// GET route to fetch all books from PostgreSQL
app.get('/api/books', async (req, res) => {
  try {
    const books = await sql`SELECT * FROM books`;
    res.json(books);
  } catch (err) {
    console.error('Error fetching books:', err);
    res.status(500).json({ error: 'Server error while fetching books' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});