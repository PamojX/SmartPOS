import React, { useEffect, useState } from 'react';
import axios from 'axios';

export default function Billing() {
  const [services, setServices] = useState([]);
  const [cart, setCart] = useState([]);

  useEffect(() => {
    axios.get('http://localhost:5000/api/services')
      .then(res => setServices(res.data));
  }, []);

  const addToCart = (item) => {
    const exists = cart.find(c => c.id === item.id);
    if (exists) {
      setCart(cart.map(c => c.id === item.id ? { ...c, qty: c.qty + 1 } : c));
    } else {
      setCart([...cart, { ...item, qty: 1 }]);
    }
  };

  const removeFromCart = (id) => {
    setCart(cart.filter(c => c.id !== id));
  };

  const getTotal = () => {
    return cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  };

  return (
    <div style={{ padding: '20px' }}>
      <h2>🧾 Billing</h2>
      <div style={{ display: 'flex', gap: '50px' }}>
        {/* Service List */}
        <div>
          <h4>Available Services</h4>
          <ul>
            {services.map(service => (
              <li key={service.id}>
                {service.name} - Rs. {service.price}
                <button onClick={() => addToCart(service)} style={{ marginLeft: '10px' }}>Add</button>
              </li>
            ))}
          </ul>
        </div>

        {/* Cart */}
        <div>
          <h4>🛒 Cart</h4>
          <ul>
            {cart.map(item => (
              <li key={item.id}>
                {item.name} x {item.qty} = Rs. {item.qty * item.price}
                <button onClick={() => removeFromCart(item.id)} style={{ marginLeft: '10px' }}>Remove</button>
              </li>
            ))}
          </ul>
          <h4>Total: Rs. {getTotal()}</h4>

          <button
  onClick={async () => {
    try {
      const res = await axios.post('http://localhost:5000/api/transactions', {
        items: cart,
        total: getTotal(),
      });
      alert(`Transaction saved! ID: ${res.data.transactionId}`);
      setCart([]); // clear cart
    } catch (err) {
      console.error(err);
      alert("Failed to save transaction");
    }
  }}
>
  ✅ Complete Transaction
</button>

        </div>
      </div>
    </div>
  );
}
