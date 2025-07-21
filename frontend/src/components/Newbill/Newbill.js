"use client"
import { useState } from "react"
import { Save, Plus, Trash2 } from "lucide-react"
import './Newbill.css'

const NewBill = () => {
  const [billItems, setBillItems] = useState([{ id: 1, item: "", quantity: 1, rate: 0, amount: 0 }])
  const [customerName, setCustomerName] = useState("")
  const [billDate, setBillDate] = useState(new Date().toISOString().split("T")[0])

  const addNewItem = () => {
    const newItem = {
      id: Date.now(),
      item: "",
      quantity: 1,
      rate: 0,
      amount: 0,
    }
    setBillItems([...billItems, newItem])
  }

  const removeItem = (id) => {
    setBillItems(billItems.filter((item) => item.id !== id))
  }

  const updateItem = (id, field, value) => {
    setBillItems(
      billItems.map((item) => {
        if (item.id === id) {
          const updatedItem = { ...item, [field]: value }
          if (field === "quantity" || field === "rate") {
            updatedItem.amount = updatedItem.quantity * updatedItem.rate
          }
          return updatedItem
        }
        return item
      }),
    )
  }

  const getTotalAmount = () => {
    return billItems.reduce((total, item) => total + item.amount, 0)
  }

  const handleSaveBill = () => {
    console.log("Saving bill:", { customerName, billDate, billItems, total: getTotalAmount() })
    // Add save logic here
  }

  return (
    <div className="new-bill">
      <div className="new-bill-container">
        <div className="new-bill-card">
          <div className="new-bill-header">
            <h1 className="new-bill-title">New Bill</h1>
          </div>

          <div className="new-bill-content">
            {/* Customer Details */}
            <div className="customer-details-grid">
              <div className="form-group">
                <label className="form-label">Customer Name</label>
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="form-input"
                  placeholder="Enter customer name"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Bill Date</label>
                <input
                  type="date"
                  value={billDate}
                  onChange={(e) => setBillDate(e.target.value)}
                  className="form-input"
                />
              </div>
            </div>

            {/* Bill Items */}
            <div className="bill-items-section">
              <div className="bill-items-header">
                <h3 className="bill-items-title">Bill Items</h3>
                <button onClick={addNewItem} className="add-item-button">
                  <Plus className="add-item-icon" />
                  <span>Add Item</span>
                </button>
              </div>

              <div className="bill-table-container">
                <table className="bill-table">
                  <thead>
                    <tr>
                      <th>Item</th>
                      <th>Quantity</th>
                      <th>Rate</th>
                      <th>Amount</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {billItems.map((item) => (
                      <tr key={item.id}>
                        <td>
                          <input
                            type="text"
                            value={item.item}
                            onChange={(e) => updateItem(item.id, "item", e.target.value)}
                            className="table-input"
                            placeholder="Item name"
                          />
                        </td>
                        <td>
                          <input
                            type="number"
                            value={item.quantity}
                            onChange={(e) => updateItem(item.id, "quantity", Number.parseInt(e.target.value) || 0)}
                            className="table-input quantity"
                            min="1"
                          />
                        </td>
                        <td>
                          <input
                            type="number"
                            value={item.rate}
                            onChange={(e) => updateItem(item.id, "rate", Number.parseFloat(e.target.value) || 0)}
                            className="table-input rate"
                            min="0"
                            step="0.01"
                          />
                        </td>
                        <td>
                          <span className="amount-display">Rs. {item.amount.toFixed(2)}</span>
                        </td>
                        <td>
                          {billItems.length > 1 && (
                            <button onClick={() => removeItem(item.id)} className="delete-button">
                              <Trash2 size={16} />
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Total */}
            <div className="total-section">
              <div className="total-card">
                <div className="total-amount">Total: Rs. {getTotalAmount().toFixed(2)}</div>
              </div>
            </div>

            {/* Actions */}
            <div className="actions-section">
              <button onClick={handleSaveBill} className="save-button">
                <Save className="save-icon" />
                <span>Save Bill</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default NewBill
