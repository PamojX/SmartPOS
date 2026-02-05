import React, { useEffect, useState } from "react";
import "./InventoryPage.css";

export default function InventoryPage() {
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState({ name: "", price: "", stock: "" });

  // Local, unsaved edits per row: { [id]: string|number }
  const [stockInputs, setStockInputs] = useState({});

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    const res = await fetch("http://localhost:5000/api/items");
    const data = await res.json();
    setProducts(data || []);
  };

  const handleAdd = async () => {
    await fetch("http://localhost:5000/api/items", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setForm({ name: "", price: "", stock: "" });
    fetchProducts();
  };

  // Only called when clicking Set — this is the ONLY time we hit the DB
  const saveStock = async (id, newStock) => {
    await fetch(`http://localhost:5000/api/items/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ stock: newStock }),
    });
    // Refresh from DB and clear the local edited value so Set goes grey again
    await fetchProducts();
    setStockInputs((prev) => ({ ...prev, [id]: undefined }));
  };

  // Update the local (unsaved) value when user types
  const handleStockInput = (id, value) => {
    if (/^\d*$/.test(value)) {
      setStockInputs((prev) => ({ ...prev, [id]: value }));
    }
  };

  // Increment/decrement ONLY the local (unsaved) value
  const bumpLocal = (id, base, delta) => {
    const current = stockInputs[id] !== undefined ? Number(stockInputs[id]) : Number(base);
    const next = Math.max(0, current + delta);
    setStockInputs((prev) => ({ ...prev, [id]: String(next) }));
  };

  // Click “Set” → save current local value (or current DB value if unchanged)
  const handleSetClick = (p) => {
    const currentInput = stockInputs[p.id] !== undefined ? stockInputs[p.id] : p.stock;
    const num = Number(currentInput);
    if (!Number.isNaN(num)) {
      saveStock(p.id, num);
    }
  };

  return (
    <div className="inventory-container">
      <h2>Inventory</h2>

      <div className="form-group">
        <input
          placeholder="Name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />
        <input
          type="number"
          placeholder="Price"
          value={form.price}
          onChange={(e) => setForm({ ...form, price: e.target.value })}
        />
        <input
          type="number"
          placeholder="Stock"
          value={form.stock}
          onChange={(e) => setForm({ ...form, stock: e.target.value })}
        />
        <button onClick={handleAdd}>Add</button>
      </div>

      <table className="inventory-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Price</th>
            <th>Stock</th>
          </tr>
        </thead>
        <tbody>
          {products.map((p) => {
            // The value shown in the input (local edit if present; otherwise DB value)
            const currentInput =
              stockInputs[p.id] !== undefined ? stockInputs[p.id] : p.stock;

            // Is there any change compared to DB stock?
            const isChanged = String(currentInput) !== String(p.stock);

            // Buttons state
            const canDecrement = Number(currentInput) > 0;

            return (
              <tr key={p.id}>
                <td>{p.name}</td>
                <td>{p.price}</td>
                <td style={{ minWidth: 220 }}>
                  <button
                    className={`btn btn-icon ${canDecrement ? "" : "btn-disabled"}`}
                    onClick={() => canDecrement && bumpLocal(p.id, p.stock, -1)}
                    disabled={!canDecrement}
                    style={{ marginRight: 4 }}
                    aria-label="Decrease stock"
                  >
                    −
                  </button>

                  <input
                    type="number"
                    value={currentInput}
                    onChange={(e) => handleStockInput(p.id, e.target.value)}
                    className="stock-input"
                    min="0"
                  />

                  <button
                    className={`btn btn-set ${isChanged ? "btn-set-active" : "btn-set-idle"}`}
                    onClick={() => isChanged && handleSetClick(p)}
                    disabled={!isChanged}
                    style={{ marginRight: 4 }}
                    aria-label="Save stock"
                  >
                    Set
                  </button>

                  <button
                    className="btn btn-icon"
                    onClick={() => bumpLocal(p.id, p.stock, +1)}
                    aria-label="Increase stock"
                  >
                    +
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
