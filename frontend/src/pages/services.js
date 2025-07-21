import React, { useEffect, useState } from 'react';
import axios from 'axios';

export default function Services() {
  const [services, setServices] = useState([]);

  useEffect(() => {
    axios.get('http://localhost:5000/api/services')
      .then(res => setServices(res.data));
  }, []);

  return (
    <div style={{ padding: '20px' }}>
      <h2>📋 Available Services</h2>
      <ul>
        {services.map(service => (
          <li key={service.id}>
            {service.name} - Rs. {service.price}
          </li>
        ))}
      </ul>
    </div>
  );
}
