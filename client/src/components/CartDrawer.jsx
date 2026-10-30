import React from 'react';

export default function CartDrawer({ isOpen, onClose, cart, onUpdateQuantity, onCheckout, loading }) {
  if (!isOpen) return null;

  const totalAmount = cart.reduce((sum, item) => {
    // Extract numeric value from price string e.g. "R289" -> 289
    const priceNum = parseFloat(item.price.replace(/[^0-9.-]+/g, '')) || 0;
    return sum + priceNum * item.quantity;
  }, 0);

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/50 flex justify-end">
      <div className="w-full max-w-md bg-white h-full shadow-xl flex flex-col p-6 animate-in slide-in-from-right">
        <div className="flex justify-between items-center border-b pb-4 mb-4">
          <h2 className="text-xl font-serif font-bold">Your Shopping Cart</h2>
          <button onClick={onClose} className="text-stone-500 hover:text-stone-800 text-xl font-bold">&times;</button>
        </div>

        <div className="flex-grow overflow-y-auto divide-y divide-stone-200">
          {cart.length === 0 ? (
            <div className="text-center py-12 text-stone-500">Your cart is empty.</div>
          ) : (
            cart.map((item) => (
              <div key={item.id} className="py-4 flex justify-between items-center">
                <div>
                  <h4 className="font-semibold text-stone-800">{item.title}</h4>
                  <p className="text-sm text-stone-500">{item.price} each</p>
                </div>
                <div className="flex items-center space-x-3">
                  <button 
                    onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                    className="w-7 h-7 bg-stone-100 rounded flex items-center justify-center font-bold hover:bg-stone-200"
                  >-</button>
                  <span className="font-medium">{item.quantity}</span>
                  <button 
                    onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                    className="w-7 h-7 bg-stone-100 rounded flex items-center justify-center font-bold hover:bg-stone-200"
                  >+</button>
                </div>
              </div>
            ))
          )}
        </div>

        {cart.length > 0 && (
          <div className="border-t pt-4 mt-4">
            <div className="flex justify-between items-center mb-4 text-lg font-bold">
              <span>Total:</span>
              <span>R{totalAmount.toFixed(2)}</span>
            </div>
            <button
              onClick={onCheckout}
              disabled={loading}
              className="w-full bg-emerald-700 text-white py-3 rounded-lg font-semibold hover:bg-emerald-800 transition disabled:opacity-50 shadow-md"
            >
              {loading ? 'Redirecting to Stripe...' : 'Proceed to Secure Checkout'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}