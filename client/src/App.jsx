import { useState } from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import BookCard from './components/BookCard';
import Events from './components/Events';
import Footer from './components/Footer';
import { books } from './data/books';

export default function App() {
  const [filter, setFilter] = useState('all');

  const filteredBooks = filter === 'all'
    ? books
    : books.filter((book) => book.category === filter);

  return (
    <div id="top" className="min-h-screen bg-background text-customText font-serif overflow-x-hidden">
      <Header />
      <main>
        <Hero />

        {/* Catalog Section with useState Filter */}
        <section className="py-14">
          <div className="max-w-[1200px] mx-auto px-5">
            <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
              <h2 className="text-[clamp(1.6rem,4vw,2.2rem)] font-bold m-0 text-customText">Curated Books</h2>

              {/* Filter Buttons */}
              <div className="flex flex-wrap gap-2">
                {['all', 'fiction', 'nonfiction', 'staff-picks'].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setFilter(cat)}
                    className={`px-4 py-1.5 rounded-lg text-sm font-medium capitalize transition-colors ${
                      filter === cat
                        ? 'bg-accent text-surface'
                        : 'bg-surface border border-customBorder text-textLight hover:text-accent'
                    }`}
                  >
                    {cat === 'staff-picks' ? 'Staff Picks' : cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Product Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredBooks.map((book) => (
                <BookCard key={book.id} book={book} />
              ))}
            </div>
          </div>
        </section>

        <Events />
      </main>
      <Footer />
    </div>
  );
}