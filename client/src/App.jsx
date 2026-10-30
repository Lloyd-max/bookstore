import React, { useState, useEffect } from 'react';
import { fetchBooks, checkAuth, logoutUser, createCheckoutSession } from './services/api';
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
  const [cart, setCart] = useState([]); // 🛒 Cart state
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  useEffect(() => {
    checkAuth().then(data => {
      if (data.loggedIn) {
        setUser(data.user);
      }
    });

    fetchBooks().then(data => {
      setBooks(data);
      setLoading(false);
    });
  }, []);

  const handleLogout = async () => {
    await logoutUser();
    setUser(null);
  };

  // Add book to cart
  const addToCart = (book) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === book.id);
      if (existing) {
        return prev.map(item => item.id === book.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { ...book, quantity: 1 }];
    });
  };

  // Handle Stripe Checkout trigger
  const handleCheckout = async () => {
    if (!user) {
      setIsAuthModalOpen(true);
      return;
    }

    try {
      setIsCheckingOut(true);
      const items = cart.map(item => ({
        bookId: item.id,
        quantity: item.quantity
      }));

      const checkoutUrl = await createCheckoutSession(items);
      window.location.href = checkoutUrl; // Redirect to Stripe
    } catch (err) {
      console.error('Checkout error:', err);
      alert(err.message || 'Failed to initiate checkout.');
      setIsCheckingOut(false);
    }
  };

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900 flex flex-col">
      <Header 
        user={user} 
        onOpenAuth={() => setIsAuthModalOpen(true)} 
        onLogout={handleLogout} 
        cartCount={cart.reduce((acc, item) => acc + item.quantity, 0)}
      />
      
      <main className="flex-grow">
        <Hero />

        <section className="max-w-7xl mx-auto px-4 py-12">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-serif font-bold">Catalog & Collections</h2>
            <span className="text-sm text-stone-500">Current Books Available</span>
          </div>

          {loading ? (
            <div className="text-center py-12 text-stone-500">Loading books...</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {books.map((book) => (
                <div key={book.id} className="flex flex-col">
                  <BookCard book={book} />
                  <button 
                    onClick={() => addToCart(book)}
                    className="mt-2 bg-stone-800 text-white py-2 px-4 rounded hover:bg-stone-700 transition"
                  >
                    Add to Cart
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Simple Cart Summary Section */}
        {cart.length > 0 && (
          <section className="max-w-4xl mx-auto my-8 p-6 bg-white rounded-lg shadow border border-stone-200">
            <h3 className="text-xl font-serif font-bold mb-4">Your Shopping Cart</h3>
            <ul className="divide-y divide-stone-200 mb-4">
              {cart.map(item => (
                <li key={item.id} className="py-2 flex justify-between items-center">
                  <span>{item.title} (x{item.quantity})</span>
                  <span className="font-semibold">{item.price}</span>
                </li>
              ))}
            </ul>
            <button
              onClick={handleCheckout}
              disabled={isCheckingOut}
              className="w-full bg-emerald-700 text-white py-3 rounded-lg font-semibold hover:bg-emerald-800 transition disabled:opacity-50"
            >
              {isCheckingOut ? 'Redirecting to Stripe...' : 'Proceed to Secure Checkout'}
            </button>
          </section>
        )}

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