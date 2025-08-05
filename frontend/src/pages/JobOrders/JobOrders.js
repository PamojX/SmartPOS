"use client"
import { useState, useEffect } from "react"
import { Plus, CheckCircle } from "lucide-react"
import "./JobOrders.css"

const JobOrders = () => {
  const [jobList, setJobList] = useState([])
  const [availableJobs, setAvailableJobs] = useState([])

  useEffect(() => {
    fetchAvailableJobs()
    addJob() // start with one job row
  }, [])

  const fetchAvailableJobs = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/items")
      if (res.ok) {
        const jobs = await res.json()
        setAvailableJobs(jobs)
      } else {
        console.error("Failed to fetch job types.")
      }
    } catch (err) {
      console.error("Error loading job types:", err)
    }
  }

  const addJob = () => {
    const newJob = {
      id: Date.now(),
      customerName: "",
      jobType: "",
      jobTypeId: null,
      quantity: 1,
      pricePerUnit: 0,
      totalPrice: 0,
      dueDate: new Date().toISOString().split("T")[0],
      itemType: null,
    }
    setJobList((prev) => [...prev, newJob])
  }

  const deleteJob = (id) => {
    setJobList((prev) => prev.filter((job) => job.id !== id))
  }


  const updateJob = (id, field, value) => {
    setJobList((prev) =>
      prev.map((job) => {
        if (job.id !== id) return job

        const updatedJob = { ...job, [field]: value }

        if (field === "jobType") {
          const selected = availableJobs.find((j) => j.name === value)
          if (selected) {
            updatedJob.pricePerUnit = selected.price
            updatedJob.jobTypeId = selected.id
            updatedJob.itemType = selected.type
          }
        }

        if (field === "quantity" || field === "jobType") {
          updatedJob.totalPrice = (updatedJob.quantity || 0) * (updatedJob.pricePerUnit || 0)
        }

        return updatedJob
      })
    )
  }

  const handleJobComplete = async (job) => {
  if (!job.customerName || !job.jobType || job.quantity <= 0 || !job.dueDate) {
    alert("Please complete all required fields.")
    return
  }

  const transaction = {
    customerName: job.customerName,
    billDate: job.dueDate, // backend expects this field
    total: job.totalPrice,
    items: [
      {
        id: job.jobTypeId,
        name: job.jobType,
        qty: job.quantity,
        price: job.pricePerUnit,
        type: job.itemType,
      },
    ],
  }

  try {
    const res = await fetch("http://localhost:5000/api/transactions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(transaction),
    })

    let result;
    try {
      result = await res.json()
    } catch (e) {
      const text = await res.text()
      console.error("Non-JSON response from server:", text)
      alert("❌ Server returned invalid response.")
      return
    }

    if (res.ok) {
      alert(`✅ Job completed! ID: ${result.transactionId || "N/A"}`)
      setJobList((prev) => prev.filter((j) => j.id !== job.id))
    } else {
      alert("❌ Error: " + (result.error || "Unknown Error"))
    }
  } catch (err) {
    console.error("Job submission failed:", err)
    alert("❌ Failed to complete job.")
  }
}

  return (
    <div className="job-orders-container">
      <h2 className="job-orders-title">Job Orders</h2>

      <table className="job-table">
        <thead>
          <tr>
            <th>Customer Name</th>
            <th>Job Type</th>
            <th>Quantity</th>
            <th>Total Price</th>
            <th>Due Date</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {jobList.map((job) => (
            <tr key={job.id}>
              <td>
                <input
                  type="text"
                  value={job.customerName}
                  onChange={(e) => updateJob(job.id, "customerName", e.target.value)}
                  placeholder="Enter customer name"
                  className="table-input"
                />
              </td>
              <td>
                <select
                  value={job.jobType}
                  onChange={(e) => updateJob(job.id, "jobType", e.target.value)}
                  className="table-input"
                >
                  <option value="">Select job</option>
                  {availableJobs.map((item) => (
                    <option key={`${item.id}-${item.type}`} value={item.name}>
                      {item.name} - Rs.{item.price}
                    </option>
                  ))}
                </select>
              </td>
              <td>
                <input
                  type="number"
                  value={job.quantity}
                  onChange={(e) => updateJob(job.id, "quantity", Number(e.target.value))}
                  min="1"
                  className="table-input"
                />
              </td>
              <td>Rs. {job.totalPrice.toFixed(2)}</td>
              <td>
                <input
                  type="date"
                  value={job.dueDate}
                  onChange={(e) => updateJob(job.id, "dueDate", e.target.value)}
                  className="table-input"
                />
              </td>
              <td>
                <button onClick={() => handleJobComplete(job)} className="button-green">
                  Mark as Completed
                </button>


                 {jobList.length > 1 && (
                  <button onClick={() => deleteJob(job.id)} className="delete-button" style={{ marginLeft: "0.5rem" }}>
                        🗑️
                  <span>Delete</span>
                  </button>
                  )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Add Job Button */}
      <div className="add-job-button-container">
        <button onClick={addJob} className="add-job-button">
          <Plus />
          <span>Add Job</span>
        </button>
      </div>
    </div>
  )
}

export default JobOrders
