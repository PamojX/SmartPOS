"use client"

import { useState } from "react"
import axios from "axios"
import "./signup.css"

//import { useNavigate } from "react-router-dom"

export default function Signup() {
 // const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    nic: "",
    phone: "",
    gender: "",
    address: "",
    role: "",
    username: "",
    password: "",
    confirmPassword: "",
    otp: "",
  })

  const handleChange = (e) => {
    const { name, value } = e.target

    let formattedValue = value

    // Format phone number as user types
    if (name === "phone") {
      formattedValue = formatPhoneNumber(value)
    }

    setFormData((s) => ({ ...s, [name]: formattedValue }))
    if (error) setError("")
  }

  const handleSelectChange = (e) => {
    const { name, value } = e.target
    setFormData((s) => ({ ...s, [name]: value }))
    if (error) setError("")
  }

  // Phone number validation for Sri Lankan format
  const validatePhoneNumber = (phone) => {
    // Remove all spaces, dashes, and plus signs for validation
    const cleanPhone = phone.replace(/[\s\-+]/g, "")

    // Sri Lankan phone number patterns:
    // Mobile: 07XXXXXXXX (10 digits starting with 07)
    // Landline: 0XXXXXXXXX (10 digits starting with 0, area codes like 011, 021, 023, etc.)
    // International mobile: 94XXXXXXXXX (11 digits starting with 94)
    // International landline: 94XXXXXXXXX (11 digits starting with 94)

    const patterns = [
      /^07[0-9]{8}$/, // Mobile: 07XXXXXXXX
      /^0[1-9][0-9]{8}$/, // Landline: 0XXXXXXXXX (area code + number)
      /^947[0-9]{8}$/, // International mobile: 947XXXXXXXX
      /^94[1-9][0-9]{8}$/, // International landline: 94XXXXXXXXX
    ]

    return patterns.some((pattern) => pattern.test(cleanPhone))
  }

  // Format phone number as user types
  const formatPhoneNumber = (value) => {
    // Remove all non-digits except + at the beginning
    let cleaned = value.replace(/[^\d+]/g, "")

    // If starts with +94, format as +94 XX XXX XXXX
    if (cleaned.startsWith("+94")) {
      cleaned = cleaned.substring(0, 13) // Limit to +94 + 10 digits
      if (cleaned.length > 3) {
        cleaned = cleaned.replace(/(\+94)(\d{2})(\d{3})(\d{4})/, "$1 $2 $3 $4")
      }
    }
    // If starts with 94, format as 94 XX XXX XXXX
    else if (cleaned.startsWith("94")) {
      cleaned = cleaned.substring(0, 11) // Limit to 94 + 9 digits
      if (cleaned.length > 2) {
        cleaned = cleaned.replace(/^(94)(\d{2})(\d{3})(\d{4})/, "$1 $2 $3 $4")
      }
    }
    // If starts with 0, format as 0XX XXX XXXX
    else if (cleaned.startsWith("0")) {
      cleaned = cleaned.substring(0, 10) // Limit to 10 digits
      if (cleaned.length > 3) {
        cleaned = cleaned.replace(/^(0\d{2})(\d{3})(\d{4})/, "$1 $2 $3")
      }
    }

    return cleaned
  }

  // Password validation
  const validatePassword = (password) => {
    const minLength = 6
    const hasUpperCase = /[A-Z]/.test(password)
    const hasLowerCase = /[a-z]/.test(password)
    const hasNumbers = /\d/.test(password)
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password)

    return {
      isValid: password.length >= minLength && hasUpperCase && hasLowerCase && hasNumbers,
      minLength: password.length >= minLength,
      hasUpperCase,
      hasLowerCase,
      hasNumbers,
      hasSpecialChar,
    }
  }

  // Get password strength
  const getPasswordStrength = (password) => {
    if (password.length === 0) return { strength: 0, label: "", color: "" }

    const validation = validatePassword(password)
    let score = 0

    if (validation.minLength) score += 1
    if (validation.hasLowerCase) score += 1
    if (validation.hasUpperCase) score += 1
    if (validation.hasNumbers) score += 1
    if (validation.hasSpecialChar) score += 1

    if (score <= 2) return { strength: 25, label: "Weak", color: "#ef4444" }
    if (score === 3) return { strength: 50, label: "Fair", color: "#f59e0b" }
    if (score === 4) return { strength: 75, label: "Good", color: "#10b981" }
    return { strength: 100, label: "Strong", color: "#059669" }
  }

  // Step 1: send request + OTP to owner
  const requestAccess = async () => {
    try {
      setLoading(true)
      setError("")
      const { firstName, lastName, nic, phone, gender, address, role } = formData

      // basic frontend validation
      if (!firstName || !lastName || !nic || !phone || !gender || !address || !role) {
        setError("Please fill all fields.")
        return
      }

      // Validate phone number format
      if (!validatePhoneNumber(phone)) {
        setError("Please enter a valid Sri Lankan phone number (e.g., 077 123 4567, 011 234 5678, or +94 77 123 4567)")
        return
      }

      await axios.post("http://localhost:5000/api/auth/request-access", {
        firstName,
        lastName,
        nic,
        phone,
        gender,
        address,
        role,
      })

      setSuccess("OTP was emailed to the owner. Ask them for it.")
      setStep(2)
    } catch (err) {
      console.error("Request access error:", err.response?.data || err.message)
      setError(err.response?.data?.error || "Failed to send request.")
    } finally {
      setLoading(false)
    }
  }

  // Step 2: verify OTP & create account
  const verifyAndCreate = async () => {
    try {
      setLoading(true)
      setError("")
      const { nic, otp, username, password, confirmPassword } = formData

      if (!otp || !username || !password || !confirmPassword) {
        setError("Please enter OTP, username and passwords.")
        return
      }

      // Validate password strength
      const passwordValidation = validatePassword(password)
      if (!passwordValidation.isValid) {
        setError("Password must be at least 6 characters and contain uppercase, lowercase, and numbers.")
        return
      }

      if (password !== confirmPassword) {
        setError("Passwords do not match.")
        return
      }

      const res = await axios.post("http://localhost:5000/api/auth/verify-otp", {
        nic,
        otp,
        username,
        password,
        confirmPassword,
      })

     
      setSuccess("Account created! Redirecting to login...")
       setTimeout(() => window.location.replace("/login"), 1200);
      //navigate("./Login", { replace: true })
      // optionally store token/role:
      // localStorage.setItem("token", res.data.token);
      // localStorage.setItem("role", res.data.role);
      // redirect or switch to login here...
    } catch (err) {
      console.error("Verify/create error:", err.response?.data || err.message)
      setError(err.response?.data?.error || "Verification failed.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="signup-container">
      <div className="signup-wrapper">
        {/* Progress indicator */}
        <div className="progress-section">
          <div className="progress-header">
            <span className="step-text">Step {step} of 2</span>
            <span className="step-description">{step === 1 ? "Personal Details" : "Account Setup"}</span>
          </div>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${step * 50}%` }}></div>
          </div>
        </div>

        <div className="signup-card">
          <div className="card-header">
            <div className="header-content">
              <div className="icon-container">
                {step === 1 ? (
                  <svg className="step-icon user-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                ) : (
                  <svg className="step-icon shield-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                    />
                  </svg>
                )}
              </div>
              <h1 className="card-title">Create Account</h1>
            </div>
            <p className="card-description">
              {step === 1
                ? "Fill in your details to create your account"
                : "Enter the OTP and create your login credentials"}
            </p>
          </div>

          <div className="card-content">
            {error && (
              <div className="alert error-alert">
                <span>{error}</span>
              </div>
            )}

            {success && (
              <div className="alert success-alert">
                <div className="success-content">
                  <svg className="check-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <span>{success}</span>
                </div>
              </div>
            )}

            {step === 1 && (
              <div className="form-section">
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="firstName" className="form-label">
                      First Name
                    </label>
                    <input
                      id="firstName"
                      name="firstName"
                      type="text"
                      placeholder="John"
                      value={formData.firstName}
                      onChange={handleChange}
                      className="form-input"
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="lastName" className="form-label">
                      Last Name
                    </label>
                    <input
                      id="lastName"
                      name="lastName"
                      type="text"
                      placeholder="Doe"
                      value={formData.lastName}
                      onChange={handleChange}
                      className="form-input"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="nic" className="form-label">
                    NIC
                  </label>
                  <input
                    id="nic"
                    name="nic"
                    type="text"
                    placeholder="123456789V"
                    value={formData.nic}
                    onChange={handleChange}
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="phone" className="form-label">
                    Phone Number
                  </label>
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    placeholder="077 123 4567"
                    value={formData.phone}
                    onChange={handleChange}
                    className="form-input"
                  />
                  <small style={{ color: "#9ca3af", fontSize: "0.75rem", marginTop: "0.25rem" }}>
                    Enter Sri Lankan phone number (Mobile: 07X XXX XXXX, Landline: 0XX XXX XXXX, or International: +94
                    XX XXX XXXX)
                  </small>
                </div>

                <div className="form-group">
                  <label htmlFor="gender" className="form-label">
                    Gender
                  </label>
                  <select
                    id="gender"
                    name="gender"
                    value={formData.gender}
                    onChange={handleSelectChange}
                    className="form-select"
                  >
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="address" className="form-label">
                    Address
                  </label>
                  <input
                    id="address"
                    name="address"
                    type="text"
                    placeholder="123 Main Street, City"
                    value={formData.address}
                    onChange={handleChange}
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="role" className="form-label">
                    Role
                  </label>
                  <select
                    id="role"
                    name="role"
                    value={formData.role}
                    onChange={handleSelectChange}
                    className="form-select"
                  >
                    <option value="">Select Role</option>
                    <option value="employee">Employee</option>
                    <option value="co-owner">Co-Owner</option>
                    <option value="owner">Owner</option>
                  </select>
                </div>

                <button onClick={requestAccess} disabled={loading} className="form-button primary-button">
                  {loading ? "Sending Request..." : "Request Access"}
                </button>
              </div>
            )}

            {step === 2 && (
              <div className="form-section">
                <div className="otp-info">
                  <svg className="mail-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                  <p>An OTP has been sent to the owner's email. Please ask them for the verification code.</p>
                </div>

                <div className="form-group">
                  <label htmlFor="otp" className="form-label">
                    OTP Code
                  </label>
                  <input
                    id="otp"
                    name="otp"
                    type="text"
                    placeholder="Enter 6-digit OTP"
                    value={formData.otp}
                    onChange={handleChange}
                    className="form-input otp-input"
                    maxLength={6}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="username" className="form-label">
                    Username
                  </label>
                  <input
                    id="username"
                    name="username"
                    type="text"
                    placeholder="Choose a username"
                    value={formData.username}
                    onChange={handleChange}
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="password" className="form-label">
                    Password
                  </label>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    placeholder="Create a strong password"
                    value={formData.password}
                    onChange={handleChange}
                    className="form-input"
                  />
                  {formData.password && (
                    <div className="password-strength">
                      <div className="strength-bar">
                        <div
                          className="strength-fill"
                          style={{
                            width: `${getPasswordStrength(formData.password).strength}%`,
                            backgroundColor: getPasswordStrength(formData.password).color,
                          }}
                        ></div>
                      </div>
                      <span className="strength-label" style={{ color: getPasswordStrength(formData.password).color }}>
                        {getPasswordStrength(formData.password).label}
                      </span>
                    </div>
                  )}
                  <div className="password-requirements">
                    <small style={{ color: "#9ca3af", fontSize: "0.75rem" }}>Password must contain:</small>
                    <ul className="requirements-list">
                      <li className={formData.password.length >= 6 ? "requirement-met" : "requirement-unmet"}>
                        At least 6 characters
                      </li>
                      <li className={/[A-Z]/.test(formData.password) ? "requirement-met" : "requirement-unmet"}>
                        One uppercase letter
                      </li>
                      <li className={/[a-z]/.test(formData.password) ? "requirement-met" : "requirement-unmet"}>
                        One lowercase letter
                      </li>
                      <li className={/\d/.test(formData.password) ? "requirement-met" : "requirement-unmet"}>
                        One number
                      </li>
                    </ul>
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="confirmPassword" className="form-label">
                    Confirm Password
                  </label>
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    placeholder="Confirm your password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="form-input"
                  />
                </div>

                <button onClick={verifyAndCreate} disabled={loading} className="form-button success-button">
                  {loading ? "Creating Account..." : "Verify & Create Account"}
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="footer-text">
          <p>Need help? Contact your system administrator</p>
        </div>

        <div className="login-section">
          <p className="login-text">
            Already have an account?
            <a href="/login" className="login-link">
              Login
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}
