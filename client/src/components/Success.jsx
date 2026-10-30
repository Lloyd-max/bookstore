import React, { useEffect, useState } from 'react';

export default function Success({ onReturnHome }) {
  const [status, setStatus] = useState('Verifying payment...');
  const [orderDetails, setOrderDetails] = useState(null);

  useEffect(() => {
    const queryParams = new URLSearchParams(window.location.search);
    const sessionId = queryParams.get('session_id');

    if (!sessionId) {
      setStatus('No active session found.');
      return;
    }

    let attempts = 0;
    const maxAttempts = 5;

    const verifyOrder = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/orders/verify?session_id=${sessionId}`, {
          credentials: 'include'
        });
        const data = await response.json();

        if (response.ok && data.paid) {
          setStatus('Payment Successful!');
          setOrderDetails(data.order);
          return true;
        }
      } catch (err) {
        console.error('Verification poll error:', err);
      }
      return false;
    };

    // Poll the backend with retries to handle slight webhook delay
    const interval = setInterval(async () => {
      attempts++;
      const success = await verifyOrder();
      if (success || attempts >= maxAttempts) {
        clearInterval(interval);
        if (!success) {
          setStatus('Payment received, but confirmation is processing. Check your email or dashboard shortly.');
        }
      }
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-stone-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white p-8 rounded-xl shadow-lg border border-stone-200 text-center">
        <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">✓</div>
        <h1 className="text-2xl font-serif font-bold text-stone-900 mb-2">Order Confirmed!</h1>
        <p className="text-stone-600 mb-6">{status}</p>

        {orderDetails && (
          <div className="bg-stone-50 p-4 rounded-lg mb-6 text-left text-sm text-stone-700">
            <p><strong>Order ID:</strong> {orderDetails.id}</p>
            <p><strong>Status:</strong> <span className="text-emerald-600 font-semibold uppercase">{orderDetails.status}</span></p>
          </div>
        )}

        <button
          onClick={onReturnHome}
          className="w-full bg-stone-900 text-white py-3 rounded-lg font-semibold hover:bg-stone-800 transition"
        >
          Return to Bookstore
        </button>
      </div>
    </div>
  );
}