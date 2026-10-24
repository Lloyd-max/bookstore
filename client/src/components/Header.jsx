import React from 'react';

export default function Header({ user, onOpenAuth, onLogout }) {
  return (
    <header className="border-b border-stone-200 bg-white sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <span className="font-serif font-bold text-xl tracking-tight">Dog-Ear Books</span>
        </div>

        <nav className="hidden md:flex space-x-6 text-sm text-stone-600">
          <a href="#fiction" className="hover:text-stone-900 transition">Fiction</a>
          <a href="#nonfiction" className="hover:text-stone-900 transition">Nonfiction</a>
          <a href="#staff-picks" className="hover:text-stone-900 transition">Staff Picks</a>
          <a href="#events" className="hover:text-stone-900 transition">Events</a>
        </nav>

        <div className="flex items-center space-x-4">
          {user ? (
            <div className="flex items-center space-x-3">
              <span className="text-xs bg-stone-100 text-stone-700 px-3 py-1.5 rounded-full font-medium">
                {user.email}
              </span>
              <button 
                onClick={onLogout}
                className="text-sm border border-stone-300 px-3 py-1.5 rounded-lg hover:bg-stone-50 transition"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <button 
              onClick={onOpenAuth}
              className="bg-stone-900 text-white text-sm px-4 py-2 rounded-lg font-medium hover:bg-stone-800 transition"
            >
              Sign In
            </button>
          )}
        </div>
      </div>
    </header>
  );
}