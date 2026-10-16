import { useState } from 'react';

export default function ReserveCounter({ initialCount = 0 }) {
  const [count, setCount] = useState(initialCount);

  const handleDecrement = () => {
    if (count > 0) setCount(count - 1);
  };

  const handleIncrement = () => {
    setCount(count + 1);
  };

  return (
    <div className="flex items-center justify-between mt-3 pt-3 border-t border-customBorder">
      <div className="flex items-center space-x-2">
        <button
          onClick={handleDecrement}
          className="w-8 h-8 flex items-center justify-center bg-customBorder text-customText rounded hover:bg-textLight hover:text-surface transition-colors font-bold"
          aria-label="Decrease quantity"
        >
          -
        </button>
        <span className="w-6 text-center font-bold text-sm">{count}</span>
        <button
          onClick={handleIncrement}
          className="w-8 h-8 flex items-center justify-center bg-accent text-surface rounded hover:bg-accentDark transition-colors font-bold"
          aria-label="Increase quantity"
        >
          +
        </button>
      </div>
      <span className="text-xs text-textLight">
        {count === 0 ? 'Not reserved' : `${count} reserved`}
      </span>
    </div>
  );
}