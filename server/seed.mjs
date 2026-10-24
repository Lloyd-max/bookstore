import { sql } from './db.mjs';

async function seedDatabase() {
  try {
    // 1. Drop and recreate tables
    await sql`DROP TABLE IF EXISTS books;`;
    await sql`DROP TABLE IF EXISTS users;`;

    await sql`
      CREATE TABLE users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;

    await sql`
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
    `;

    console.log("Tables created successfully.");

    // 2. Insert book data
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
      await sql`
        INSERT INTO books (id, title, author, price, category, badge, image, alt) 
        VALUES (${book[0]}, ${book[1]}, ${book[2]}, ${book[3]}, ${book[4]}, ${book[5]}, ${book[6]}, ${book[7]})
      `;
    }

    console.log("Database seeded with books successfully!");
    process.exit(0);
  } catch (err) {
    console.error("Error seeding database:", err);
    process.exit(1);
  }
}

seedDatabase();