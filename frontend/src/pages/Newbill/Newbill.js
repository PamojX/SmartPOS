
import { useState, useEffect } from "react"
import { Save, Plus, Trash2 } from "lucide-react"
import "./Newbill.css";

const NewBill = () => {
  const [billItems, setBillItems] = useState([{ id: 1, item: "", quantity: 1, rate: 0, amount: 0 }])
  const [customerName, setCustomerName] = useState("")
  const [billDate, setBillDate] = useState(new Date().toISOString().split("T")[0])
  const [invoiceNumber, setInvoiceNumber] = useState(`INV-${Date.now()}`)
  const [paymentMethod, setPaymentMethod] = useState("Cash")
  const [discount, setDiscount] = useState(0)
  const [amountPaid, setAmountPaid] = useState(0)
  const [availableItems, setAvailableItems] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState("")

  useEffect(() => {
    fetchAvailableItems()
  }, [])

  const fetchAvailableItems = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/items")
      if (response.ok) {
        const items = await response.json()
        setAvailableItems(items)
      } else {
        console.error("Failed to fetch items")
      }
    } catch (error) {
      console.error("Error fetching items:", error)
    }
  }

  const addNewItem = () => {
    setBillItems([...billItems, { id: Date.now(), item: "", quantity: 1, rate: 0, amount: 0 }])
  }

  const removeItem = (id) => {
    setBillItems(billItems.filter((item) => item.id !== id))
  }

  const updateItem = (id, field, value) => {
    setBillItems(billItems.map((item) => {
      if (item.id === id) {
        const updated = { ...item, [field]: value }

        if (field === "item") {
          const selectedItem = availableItems.find((i) => i.name === value)
          if (selectedItem) {
            updated.rate = selectedItem.price
            updated.itemId = selectedItem.id
            updated.itemType = selectedItem.type
            updated.stock = selectedItem.stock
          }
        }

        if (field === "quantity" || field === "rate") {
          updated.amount = (updated.quantity || 0) * (updated.rate || 0)
        }

        return updated
      }
      return item
    }))
  }
  const handlePrint = () => {
    if (window.electron && window.electron.ipcRenderer) {
      window.electron.ipcRenderer.send("print-bill");
    } else {
      console.error("Electron ipcRenderer not available");
    }
  };
  const getSubtotal = () => {
    return billItems.reduce((total, item) => total + item.amount, 0)
  }

  const getTotalAmount = () => {
    return getSubtotal() - discount
  }

  const getChangeDue = () => {
    return amountPaid - getTotalAmount()
  }

  const handleSaveBill = async () => {
    if (!customerName.trim()) {
      setMessage("Please enter customer name")
      return
    }

    const validItems = billItems.filter((item) => item.item && item.quantity > 0 && item.rate > 0)
    if (validItems.length === 0) {
      setMessage("Please add at least one valid item")
      return
    }

    for (const item of validItems) {
      if (item.itemType === "product" && item.stock < item.quantity) {
        setMessage(`Insufficient stock for ${item.item}. Available: ${item.stock}`)
        return
      }
    }

    setIsLoading(true)
    setMessage("")

    try {
      const transactionData = {
        invoiceNumber,
        customerName,
        billDate,
        paymentMethod,
        discount,
        amountPaid,
        changeDue: getChangeDue(),
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
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(transactionData),
      })

      const result = await response.json()

      if (response.ok) {
        setMessage(`✅ Bill saved! Invoice: ${invoiceNumber}`)
        setBillItems([{ id: 1, item: "", quantity: 1, rate: 0, amount: 0 }])
        setCustomerName("")
        setBillDate(new Date().toISOString().split("T")[0])
        setInvoiceNumber(`INV-${Date.now()}`)
        setPaymentMethod("Cash")
        setDiscount(0)
        setAmountPaid(0)
        fetchAvailableItems()
      } else {
        setMessage(`❌ Error: ${result.error}`)
      }
    } catch (error) {
      console.error("Error saving bill:", error)
      setMessage("❌ Failed to save bill.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="new-bill">
      <div className="new-bill-card">
        <h1>New Bill</h1>
        {message && <div className={`message ${message.includes("✅") ? "success" : "error"}`}>{message}</div>}

        <div className="form-row">
          <label>Invoice No:</label>
          <input value={invoiceNumber} readOnly />
        </div>
        <div className="form-row">
          <label>Customer Name</label>
          <input value={customerName} onChange={(e) => setCustomerName(e.target.value)} />
        </div>
        <div className="form-row">
          <label>Bill Date</label>
          <input type="date" value={billDate} onChange={(e) => setBillDate(e.target.value)} />
        </div>
        <div className="form-row">
          <label>Payment Method</label>
          <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}>
            <option>Cash</option>
            <option>Card</option>
          </select>
        </div>

        <h3>Bill Items</h3>
        <table>
          <thead>
            <tr>
              <th>Item</th>
              <th>Qty</th>
              <th>Rate</th>
              <th>Amount</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {billItems.map((item) => (
              <tr key={item.id}>
                <td>
                  <select value={item.item} onChange={(e) => updateItem(item.id, "item", e.target.value)}>
                    <option value="">Select</option>
                    {availableItems.map((availItem) => (
                      <option key={`${availItem.type}-${availItem.id}`} value={availItem.name}>
                        {availItem.name} - Rs.{availItem.price}
                      </option>
                    ))}
                  </select>
                </td>
                <td>
                  <input
                    type="number"
                    value={item.quantity}
                    onChange={(e) => updateItem(item.id, "quantity", Number(e.target.value))}
                    min="1"
                  />
                </td>
                <td>
                  <input
                    type="number"
                    value={item.rate}
                    onChange={(e) => updateItem(item.id, "rate", Number(e.target.value))}
                  />
                </td>
                <td>Rs. {item.amount.toFixed(2)}</td>
                <td>{billItems.length > 1 && <button onClick={() => removeItem(item.id)}><Trash2 size={16} /></button>}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <button onClick={addNewItem} className="add-item-button"><Plus size={16} /> Add Item</button>

        <div className="totals">
          <div>
            Subtotal: 
          <input type="number" value={getSubtotal().toFixed(2)} readOnly />
              </div>
              <div>
                Discount: 
                <input type="number" value={discount} onChange={(e) => setDiscount(Number(e.target.value))} />
              </div>
              <div>
                Total: 
                <input type="number" value={getTotalAmount().toFixed(2)} readOnly />
              </div>
              <div>
                Amount Paid: 
                <input type="number" value={amountPaid} onChange={(e) => setAmountPaid(Number(e.target.value))} />
              </div>
              <div>
                Change Due: 
                <input type="number" value={getChangeDue().toFixed(2)} readOnly />
              </div>
        </div>

        <button onClick={handleSaveBill}  className="save-button" disabled={isLoading}>
          <Save size={16} /> {isLoading ? "Saving..." : "Save Bill"}
        </button>
        <button className="print-btn" onClick={handlePrint}>
          Print Bill
        </button>
      </div>
    </div>
  )
}

export default NewBill
