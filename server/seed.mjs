import dotenv from 'dotenv';
dotenv.config();
import pkg from 'pg';
const { Pool } = pkg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function seedDatabase() {
  try {
    console.log("Connecting to Neon database...");
    const client = await pool.connect();
    console.log("Connected successfully!");

    // 1. Drop tables in correct order (respecting foreign keys)
    console.log("Dropping existing tables...");
    await client.query('DROP TABLE IF EXISTS order_items;');
    await client.query('DROP TABLE IF EXISTS orders;');
    await client.query('DROP TABLE IF EXISTS books;');
    await client.query('DROP TABLE IF EXISTS users;');

    // 2. Create tables
    console.log("Creating new schema tables...");
    await client.query(`
      CREATE TABLE users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await client.query(`
      CREATE TABLE books (
        id VARCHAR(50) PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        author VARCHAR(255) NOT NULL,
        price VARCHAR(50) NOT NULL,
        category VARCHAR(50) NOT NULL,
        badge VARCHAR(100),
        image VARCHAR(255) NOT NULL,
        alt VARCHAR(255) NOT NULL
      );
    `);

    await client.query(`
      CREATE TABLE orders (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        stripe_session_id VARCHAR(255) UNIQUE NOT NULL,
        total_amount NUMERIC(10, 2) NOT NULL,
        status VARCHAR(50) DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await client.query(`
      CREATE TABLE order_items (
        id SERIAL PRIMARY KEY,
        order_id INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
        book_id VARCHAR(50) NOT NULL REFERENCES books(id) ON DELETE CASCADE,
        quantity INTEGER NOT NULL DEFAULT 1,
        price NUMERIC(10, 2) NOT NULL
      );
    `);

    console.log("All tables created successfully (users, books, orders, order_items).");

    // 3. Insert book data
    const booksData = [
      ['quiet-harbour', 'The Quiet Harbour', 'Ana Mirelles', 'R289', 'fiction', null, '/media/quite-harbour.jpg', 'Cover of The Quiet Harbour'],
      ['salt-and-ash', 'Salt and Ash', 'Tomas Verhoef', 'R265', 'fiction', null, '/media/salt-and-ash.jpg', 'Cover of Salt and Ash'],
      ['midnight-orchard', 'Midnight Orchard', 'Lerato Dlamini', 'R310', 'fiction', null, '/media/midnight-orchard.jpg', 'Cover of Midnight Orchard'],
      ['small-rivers', 'Small Rivers', 'Hannah Pretorius', 'R330', 'nonfiction', null, '/media/small-rivers.jpg', 'Cover of Small Rivers'],
      ['the-slow-city', 'The Slow City', 'Kabelo Mokoena', 'R299', 'nonfiction', null, '/media/slow-city.jpg', 'Cover of The Slow City'],
      ['field-notes', 'Field Notes', 'Ruth Ellery', 'R275', 'nonfiction', null, '/media/field-notes.jpg', 'Cover of Field Notes'],
      ['lantern-year', 'The Lantern Year', 'Ines Calloway', 'R320', 'staff-picks', 'Picked by Nomsa', '/media/lantern-year.jpg', 'Cover of The Lantern Year'],
      ['paper-maps', 'Paper Maps', 'Jonas Albrecht', 'R285', 'staff-picks', 'Picked by Dev', '/media/paper-images.jpg', 'Cover of Paper Maps'],
      ['last-ferry', 'The Last Ferry', 'Mina Okafor', 'R299', 'staff-picks', 'Picked by Sam', '/media/last-ferry.jpg', 'Cover of Last Ferry']
    ];

    for (const book of booksData) {
      await client.query(
        `INSERT INTO books (id, title, author, price, category, badge, image, alt) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        book
      );
    }

    console.log("Database seeded with books successfully!");
    client.release();
    await pool.end();
    process.exit(0);
  } catch (err) {
    console.error("Error seeding database:", err);
    process.exit(1);
  }
}

seedDatabase();