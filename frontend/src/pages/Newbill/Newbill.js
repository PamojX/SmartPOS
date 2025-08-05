"use client"
import { useState, useEffect } from "react"
import { Save, Plus, Trash2 } from "lucide-react"
import "./Newbill.css"

const NewBill = () => {
  const [billItems, setBillItems] = useState([{ id: 1, item: "", quantity: 1, rate: 0, amount: 0 }])
  const [customerName, setCustomerName] = useState("")
  const [billDate, setBillDate] = useState(new Date().toISOString().split("T")[0])
  const [availableItems, setAvailableItems] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState("")

  // Fetch available items (services + products) on component mount
  useEffect(() => {
    fetchAvailableItems()
  }, [])

  //http://localhost:5000/api/items

  const fetchAvailableItems = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/items")
      if (response.ok) {
        const items = await response.json()
        setAvailableItems(items)
        console.log("succesfully loaditems")
      } else {
        console.error("Failed to fetch items")
      }
    } catch (error) {
      console.error("Error fetching items:", error)
    }
  }

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

          // If item name is selected, auto-fill the rate
          if (field === "item") {
            const selectedItem = availableItems.find((availItem) => availItem.name === value)
            if (selectedItem) {
              updatedItem.rate = selectedItem.price
              updatedItem.itemId = selectedItem.id
              updatedItem.itemType = selectedItem.type
              updatedItem.stock = selectedItem.stock
            }
          }

          // Calculate amount when quantity or rate changes
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

  const handleSaveBill = async () => {
    // Validate form
    if (!customerName.trim()) {
      setMessage("Please enter customer name")
      return
    }

    const validItems = billItems.filter((item) => item.item && item.quantity > 0 && item.rate > 0)
    if (validItems.length === 0) {
      setMessage("Please add at least one valid item")
      return
    }

    // Check stock for products
    for (const item of validItems) {
      if (item.itemType === "product" && item.stock < item.quantity) {
        setMessage(`Insufficient stock for ${item.item}. Available: ${item.stock}`)
        return
      }
    }

    setIsLoading(true)
    setMessage("")

    try {
      // Prepare transaction data
      const transactionData = {
        customerName,
        billDate,
        total: getTotalAmount(),
        items: validItems.map((item) => ({
          id: item.itemId,
          name: item.item,
          qty: item.quantity,
          price: item.rate,
          type: item.itemType,
        })),
      }

      const response = await fetch("http://localhost:5000/api/transactions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(transactionData),
      })

      const result = await response.json()

      if (response.ok) {
        setMessage(`✅ Bill saved successfully! Transaction ID: ${result.transactionId}`)

        // Reset form
        setBillItems([{ id: 1, item: "", quantity: 1, rate: 0, amount: 0 }])
        setCustomerName("")
        setBillDate(new Date().toISOString().split("T")[0])

        // Refresh available items to get updated stock
        fetchAvailableItems()

        // Clear message after 3 seconds
        setTimeout(() => setMessage(""), 3000)
      } else {
        setMessage(`❌ Error: ${result.error}`)
      }
    } catch (error) {
      console.error("Error saving bill:", error)
      setMessage("❌ Failed to save bill. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="new-bill">
      <div className="new-bill-container">
        <div className="new-bill-card">
          <div className="new-bill-header">
            <h1 className="new-bill-title">New Bill</h1>
          </div>
          <div className="new-bill-content">
            {/* Message Display */}
            {message && <div className={`message ${message.includes("✅") ? "success" : "error"}`}>{message}</div>}

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
                          <select
                            value={item.item}
                            onChange={(e) => updateItem(item.id, "item", e.target.value)}
                            className="table-input"
                          >
                            <option value="">Select item</option>
                            {availableItems.map((availItem) => (
                              <option key={`${availItem.type}-${availItem.id}`} value={availItem.name}>
                                {availItem.name} - Rs.{availItem.price}
                                {availItem.type === "product" ? ` (Stock: ${availItem.stock})` : " (Service)"}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td>
                          <input
                            type="number"
                            value={item.quantity}
                            onChange={(e) => updateItem(item.id, "quantity", Number.parseInt(e.target.value) || 0)}
                            className="table-input quantity"
                            min="1"
                            max={item.itemType === "product" ? item.stock : 999}
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
              <button onClick={handleSaveBill} className="save-button" disabled={isLoading}>
                <Save className="save-icon" />
                <span>{isLoading ? "Saving..." : "Save Bill"}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default NewBill
