import React, { useState, useEffect } from 'react';
import { fetchBooks, checkAuth, logoutUser } from './services/api';
import Header from './components/Header';
import Hero from './components/Hero';
import BookCard from './components/BookCard';
import Events from './components/Events';
import Footer from './components/Footer';
import AuthModal from './components/AuthModal';

export default function App() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  useEffect(() => {
    // Check if user session exists on page refresh
    checkAuth().then(data => {
      if (data.loggedIn) {
        setUser(data.user);
      }
    });

    // Fetch books from backend API
    fetchBooks().then(data => {
      setBooks(data);
      setLoading(false);
    });
  }, []);

  const handleLogout = async () => {
    await logoutUser();
    setUser(null);
  };

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900 flex flex-col">
      <Header 
        user={user} 
        onOpenAuth={() => setIsAuthModalOpen(true)} 
        onLogout={handleLogout} 
      />
      
      <main className="flex-grow">
        <Hero />

        <section className="max-w-7xl mx-auto px-4 py-12">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-serif font-bold">Catalog & Collections</h2>
            <span className="text-sm text-stone-500">Live from PostgreSQL Database</span>
          </div>

          {loading ? (
            <div className="text-center py-12 text-stone-500">
              Loading books from database...
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {books.map((book) => (
                <BookCard key={book.id} book={book} />
              ))}
            </div>
          )}
        </section>

        <Events />
      </main>

      <Footer />

      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)} 
        onSuccessfulLogin={(userData) => setUser(userData)} 
      />
    </div>
  );
}