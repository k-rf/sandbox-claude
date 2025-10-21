import { useState } from 'react';
import './Counter.css';

export default function Counter() {
  const [count, setCount] = useState(0);

  return (
    <div className="counter">
      <h2>カウンター</h2>
      <div className="counter-display">
        <p className="count">{count}</p>
      </div>
      <div className="counter-buttons">
        <button onClick={() => setCount(count - 1)}>-</button>
        <button onClick={() => setCount(0)}>リセット</button>
        <button onClick={() => setCount(count + 1)}>+</button>
      </div>
    </div>
  );
}
