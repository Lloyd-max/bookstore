import React, { useState, useEffect } from 'react';
import { fetchBooks, checkAuth, logoutUser, createCheckoutSession } from './services/api';
import Header from './components/Header';
import Hero from './components/Hero';
import BookCard from './components/BookCard';
import Events from './components/Events';
import Footer from './components/Footer';
import AuthModal from './components/AuthModal';
import CartDrawer from './components/CartDrawer';
import Success from './components/Success';

export default function App() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  const isSuccessPage = window.location.pathname.includes('/success');

  useEffect(() => {
    checkAuth().then(data => {
      if (data.loggedIn) setUser(data.user);
    });

    fetchBooks().then(data => {
      setBooks(data);
      setLoading(false);
    });
  }, []);

  if (isSuccessPage) {
    return <Success onReturnHome={() => window.location.href = '/'} />;
  }

  const handleLogout = async () => {
    await logoutUser();
    setUser(null);
  };

  const addToCart = (book) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === book.id);
      if (existing) {
        return prev.map(item => item.id === book.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { ...book, quantity: 1 }];
    });
    setIsCartOpen(true); // Automatically open cart drawer when adding items
  };

  const updateQuantity = (id, quantity) => {
    if (quantity <= 0) {
      setCart(prev => prev.filter(item => item.id !== id));
    } else {
      setCart(prev => prev.map(item => item.id === id ? { ...item, quantity } : item));
    }
  };

  const handleCheckout = async () => {
    if (!user) {
      setIsAuthModalOpen(true);
      return;
    }

    try {
      setIsCheckingOut(true);
      const items = cart.map(item => ({ bookId: item.id, quantity: item.quantity }));
      const checkoutUrl = await createCheckoutSession(items);
      window.location.href = checkoutUrl;
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
        onOpenCart={() => setIsCartOpen(true)}
      />
      
      <main className="flex-grow">
        <Hero />

        <section className="max-w-7xl mx-auto px-4 py-12">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-serif font-bold">Catalog & Collections</h2>
            <button 
              onClick={() => setIsCartOpen(true)}
              className="text-sm bg-stone-800 text-white px-4 py-2 rounded hover:bg-stone-700 transition"
            >
              View Cart ({cart.reduce((acc, item) => acc + item.quantity, 0)})
            </button>
          </div>

          {loading ? (
            <div className="text-center py-12 text-stone-500">Loading books...</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {books.map((book) => (
                <div key={book.id} className="flex flex-col bg-white p-4 rounded-xl shadow-sm border border-stone-200">
                  <BookCard book={book} />
                  <button 
                    onClick={() => addToCart(book)}
                    className="mt-4 bg-stone-900 text-white py-2 px-4 rounded-lg hover:bg-stone-800 transition font-medium"
                  >
                    Add to Cart
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>

        <Events />
      </main>

      <Footer />

      <CartDrawer 
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cart={cart}
        onUpdateQuantity={updateQuantity}
        onCheckout={handleCheckout}
        loading={isCheckingOut}
      />

      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)} 
        onSuccessfulLogin={(userData) => setUser(userData)} 
      />
    </div>
  );
}