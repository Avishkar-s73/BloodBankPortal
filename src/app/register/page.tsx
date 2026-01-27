/**
 * Registration Page
 * New user registration with role selection
 */

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuth();

  const [formData, setFormData] = useState({
    name: "",
    bankName: "",
    registrationNo: "",
    bankPhone: "",
    bankAddress: "",
    bankCity: "",
    bankState: "",
    bankPincode: "",
    operatingHours: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "DONOR" as "DONOR" | "HOSPITAL" | "BLOOD_BANK",
    bloodGroup: "A_POSITIVE",
    phone: "",
    address: "",
    city: "",
    state: "",
    bloodBankId: "",
    hospitalId: "",
    // hospital-specific fields for creating a new hospital during signup
    hospitalName: "",
    hospitalPhone: "",
    hospitalAddress: "",
    hospitalCity: "",
    hospitalState: "",
    hospitalPincode: "",
    hospitalEmergencyPhone: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [bloodBanks, setBloodBanks] = useState<
    Array<{ id: string; name: string; city: string }>
  >([]);
  const [hospitals, setHospitals] = useState<
    Array<{ id: string; name: string; city: string }>
  >([]);
  const [loadingOrgs, setLoadingOrgs] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<{
    email?: string;
    phone?: string;
  }>({});

  // Fetch blood banks and hospitals when component mounts
  useEffect(() => {
    fetchOrganizations();
  }, []);

  const fetchOrganizations = async () => {
    try {
      setLoadingOrgs(true);
      const [bloodBanksRes, hospitalsRes] = await Promise.all([
        fetch("/api/blood-banks"),
        fetch("/api/hospitals"),
      ]);

      if (bloodBanksRes.ok) {
        const data = await bloodBanksRes.json();
        setBloodBanks(data.data || []);
      }

      if (hospitalsRes.ok) {
        const data = await hospitalsRes.json();
        setHospitals(data.data || []);
      }
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error("Failed to fetch organizations:", err);
    } finally {
      setLoadingOrgs(false);
    }
  };

  const bloodGroups = [
    "A_POSITIVE",
    "A_NEGATIVE",
    "B_POSITIVE",
    "B_NEGATIVE",
    "AB_POSITIVE",
    "AB_NEGATIVE",
    "O_POSITIVE",
    "O_NEGATIVE",
  ];

  // Password strength calculator
  const getPasswordStrength = (password: string) => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (password.length >= 12) strength++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[^a-zA-Z\d]/.test(password)) strength++;
    return strength;
  };

  const passwordStrength = getPasswordStrength(formData.password);
  const strengthLabels = ["Very Weak", "Weak", "Fair", "Good", "Strong"];
  const strengthColors = [
    "bg-red-500",
    "bg-orange-500",
    "bg-yellow-500",
    "bg-lime-500",
    "bg-green-500",
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (fieldErrors.email || fieldErrors.phone) {
      setError("Please fix highlighted fields before submitting");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    // Validate organization selection for HOSPITAL and BLOOD_BANK
    if (
      formData.role === "BLOOD_BANK" &&
      !formData.bloodBankId &&
      !formData.bankName
    ) {
      setError(
        "Please select an existing blood bank or enter new bank details"
      );
      return;
    }
    if (formData.role === "HOSPITAL" && !formData.hospitalName) {
      setError(
        "Please enter your hospital name or select an existing hospital"
      );
      return;
    }

    setLoading(true);

    try {
      const { confirmPassword, name, ...registerData } = formData;

      // Split name into firstName and lastName when provided
      let firstName = "";
      let lastName = "";
      if (name && name.trim()) {
        const nameParts = name.trim().split(" ");
        firstName = nameParts[0] || "";
        lastName = nameParts.slice(1).join(" ") || "";
      }

      // If registering a blood bank and no personal name was provided,
      // use the bank name as the account display name so the user can log in.
      if (formData.role === "BLOOD_BANK" && !firstName && formData.bankName) {
        firstName = formData.bankName;
        lastName = "";
      }

      // If registering a hospital and no personal name was provided,
      // use the hospital name as the account display name.
      if (formData.role === "HOSPITAL" && !firstName && formData.hospitalName) {
        firstName = formData.hospitalName;
        lastName = "";
      }

      // Prepare data for API
      const apiData: any = {
        ...registerData,
        firstName,
        lastName,
      };

      // Add organization information based on role
      if (formData.role === "BLOOD_BANK") {
        if (formData.bloodBankId) {
          apiData.bloodBankId = formData.bloodBankId;
        } else {
          apiData.bloodBankData = {
            name: formData.bankName,
            phone: formData.bankPhone,
            // Use specific bank address if provided, otherwise fall back to user's address fields
            address: formData.bankAddress || formData.address,
            city: formData.bankCity || formData.city,
            state: formData.bankState || formData.state,
            pincode: formData.bankPincode || formData.pincode,
            operatingHours: formData.operatingHours,
          };
        }
      } else if (formData.role === "HOSPITAL") {
        if (formData.hospitalId) {
          apiData.hospitalId = formData.hospitalId;
        } else {
          apiData.hospitalData = {
            name: formData.hospitalName,
            phone: formData.hospitalPhone,
            address: formData.hospitalAddress || formData.address,
            city: formData.hospitalCity || formData.city,
            state: formData.hospitalState || formData.state,
            pincode: formData.hospitalPincode || formData.pincode,
            emergencyPhone: formData.hospitalEmergencyPhone,
          };
        }
      }

      await register(apiData);

      // Redirect based on user role
      switch (formData.role) {
        case "DONOR":
          router.push("/donor-dashboard");
          break;
        case "HOSPITAL":
          router.push("/hospital-dashboard");
          break;
        case "BLOOD_BANK":
          router.push("/blood-bank-dashboard");
          break;
        default:
          router.push("/");
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Registration failed";
      if (msg.includes("Email already")) {
        setFieldErrors((s) => ({ ...s, email: msg }));
      } else if (msg.includes("Phone number")) {
        setFieldErrors((s) => ({ ...s, phone: msg }));
      } else {
        setError(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const checkField = async (field: "email" | "phone", value: string) => {
    try {
      if (!value) return;
      const res = await fetch("/api/auth/check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [field]: value }),
      });
      if (!res.ok) return;
      const json = await res.json();
      const data = json.data || {};
      if (field === "email") {
        setFieldErrors((s) => ({
          ...s,
          email: data.existsEmail ? "Email already registered" : undefined,
        }));
      } else {
        setFieldErrors((s) => ({
          ...s,
          phone: data.existsPhone
            ? "Phone number already registered"
            : undefined,
        }));
      }
    } catch (e) {
      // ignore check failures
    }
  };

  const validatePhoneFormat = (value: string) => {
    if (!value) return false;
    // Remove non-digit characters
    const digits = value.replace(/\D/g, "");
    return digits.length === 10;
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 via-pink-50 to-rose-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl w-full space-y-8">
        <div>
          <div className="flex justify-center">
            <div className="bg-gradient-to-br from-red-600 to-rose-600 text-white rounded-full p-4 shadow-lg animate-pulse">
              <svg
                className="h-12 w-12"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
                />
              </svg>
            </div>
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Join 🩸 BloodLink Today
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Register to be a lifesaver in our community
          </p>
        </div>

        <div className="bg-white py-8 px-4 shadow-xl rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm">
                {error}
              </div>
            )}

            {/* Role Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                I want to register as
              </label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { value: "DONOR", label: "Donor", icon: "🩸" },
                  { value: "HOSPITAL", label: "Hospital", icon: "🏥" },
                  { value: "BLOOD_BANK", label: "Blood Bank", icon: "🏦" },
                ].map((role) => (
                  <label
                    key={role.value}
                    className={`cursor-pointer ${
                      formData.role === role.value
                        ? "ring-2 ring-red-600 bg-red-50 border-red-200"
                        : "ring-1 ring-gray-300 hover:ring-red-300"
                    } border rounded-lg p-4 flex flex-col items-center transition-all hover:bg-red-50 transform hover:scale-105`}
                  >
                    <input
                      type="radio"
                      name="role"
                      value={role.value}
                      checked={formData.role === role.value}
                      onChange={handleChange}
                      className="sr-only"
                    />
                    <span className="text-3xl mb-2">{role.icon}</span>
                    <span className="text-sm font-medium text-gray-900">
                      {role.label}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Blood Bank selection removed: new bank signups provide bank details */}

            {/* Hospital selection removed: new hospital signups collect hospital details instead */}

            {/* Basic Information */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              {formData.role === "BLOOD_BANK" ? (
                <>
                  <div>
                    <label
                      htmlFor="bankName"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Bank Name *
                    </label>
                    <input
                      id="bankName"
                      name="bankName"
                      type="text"
                      required
                      value={formData.bankName}
                      onChange={handleChange}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="bankPhone"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Contact Phone *
                    </label>
                    <input
                      id="bankPhone"
                      name="bankPhone"
                      type="text"
                      required
                      value={formData.bankPhone}
                      onChange={handleChange}
                      onBlur={() => {
                        const v = formData.bankPhone || "";
                        if (!validatePhoneFormat(v)) {
                          setFieldErrors((s) => ({
                            ...s,
                            phone: "Phone must be exactly 10 digits",
                          }));
                        } else {
                          setFieldErrors((s) => ({ ...s, phone: undefined }));
                          checkField("phone", v);
                        }
                      }}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm"
                    />
                    {fieldErrors.phone && (
                      <p className="mt-1 text-sm text-red-600">
                        {fieldErrors.phone}
                      </p>
                    )}
                  </div>
                </>
              ) : formData.role === "HOSPITAL" ? (
                <>
                  <div>
                    <label
                      htmlFor="hospitalName"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Hospital Name *
                    </label>
                    <input
                      id="hospitalName"
                      name="hospitalName"
                      type="text"
                      required
                      value={formData.hospitalName}
                      onChange={handleChange}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="hospitalPhone"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Contact Phone *
                    </label>
                    <input
                      id="hospitalPhone"
                      name="hospitalPhone"
                      type="text"
                      required
                      value={formData.hospitalPhone}
                      onChange={handleChange}
                      onBlur={() => {
                        const v = formData.hospitalPhone || "";
                        if (!validatePhoneFormat(v)) {
                          setFieldErrors((s) => ({
                            ...s,
                            phone: "Phone must be exactly 10 digits",
                          }));
                        } else {
                          setFieldErrors((s) => ({ ...s, phone: undefined }));
                          checkField("phone", v);
                        }
                      }}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm"
                    />
                    {fieldErrors.phone && (
                      <p className="mt-1 text-sm text-red-600">
                        {fieldErrors.phone}
                      </p>
                    )}
                  </div>
                </>
              ) : (
                <div>
                  <label
                    htmlFor="name"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Full Name *
                  </label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm"
                  />
                </div>
              )}

              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700"
                >
                  Email *
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  onBlur={() => checkField("email", formData.email)}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm"
                />
                {fieldErrors.email && (
                  <p className="mt-1 text-sm text-red-600">
                    {fieldErrors.email}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-700"
                >
                  Password *
                </label>
                <div className="mt-1 relative">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    required
                    value={formData.password}
                    onChange={handleChange}
                    className="block w-full px-3 py-2 pr-10 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? (
                      <svg
                        className="h-5 w-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                        />
                      </svg>
                    ) : (
                      <svg
                        className="h-5 w-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                        />
                      </svg>
                    )}
                  </button>
                </div>
                {formData.password && (
                  <div className="mt-2">
                    <div className="flex gap-1 mb-1">
                      {[0, 1, 2, 3, 4].map((i) => (
                        <div
                          key={i}
                          className={`h-1 flex-1 rounded-full transition-all ${
                            i < passwordStrength
                              ? strengthColors[passwordStrength - 1]
                              : "bg-gray-200"
                          }`}
                        />
                      ))}
                    </div>
                    <p className="text-xs text-gray-600">
                      Password strength:{" "}
                      <span className="font-medium">
                        {strengthLabels[passwordStrength]}
                      </span>
                    </p>
                  </div>
                )}
              </div>

              <div>
                <label
                  htmlFor="confirmPassword"
                  className="block text-sm font-medium text-gray-700"
                >
                  Confirm Password *
                </label>
                <div className="mt-1 relative">
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    required
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="block w-full px-3 py-2 pr-10 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                  >
                    {showConfirmPassword ? (
                      <svg
                        className="h-5 w-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                        />
                      </svg>
                    ) : (
                      <svg
                        className="h-5 w-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                        />
                      </svg>
                    )}
                  </button>
                </div>
                {formData.confirmPassword && (
                  <p
                    className={`mt-1 text-xs ${
                      formData.password === formData.confirmPassword
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    {formData.password === formData.confirmPassword
                      ? "✓ Passwords match"
                      : "✗ Passwords do not match"}
                  </p>
                )}
              </div>

              {formData.role === "DONOR" && (
                <div>
                  <label
                    htmlFor="bloodGroup"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Blood Group
                  </label>
                  <select
                    id="bloodGroup"
                    name="bloodGroup"
                    value={formData.bloodGroup}
                    onChange={handleChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm"
                  >
                    {bloodGroups.map((group) => (
                      <option key={group} value={group}>
                        {group.replace("_", " ")}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {formData.role === "DONOR" && (
                <div>
                  <label
                    htmlFor="phone"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Phone
                  </label>
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleChange}
                    onBlur={() => {
                      const v = formData.phone || "";
                      if (!validatePhoneFormat(v)) {
                        setFieldErrors((s) => ({
                          ...s,
                          phone: "Phone must be exactly 10 digits",
                        }));
                      } else {
                        setFieldErrors((s) => ({ ...s, phone: undefined }));
                        checkField("phone", v);
                      }
                    }}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm"
                  />
                  {fieldErrors.phone && (
                    <p className="mt-1 text-sm text-red-600">
                      {fieldErrors.phone}
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Address Information */}
            <div>
              <label
                htmlFor="address"
                className="block text-sm font-medium text-gray-700"
              >
                Address
              </label>
              <input
                id="address"
                name="address"
                type="text"
                value={formData.address}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm"
              />
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="city"
                  className="block text-sm font-medium text-gray-700"
                >
                  City
                </label>
                <input
                  id="city"
                  name="city"
                  type="text"
                  value={formData.city}
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm"
                />
              </div>

              <div>
                <label
                  htmlFor="state"
                  className="block text-sm font-medium text-gray-700"
                >
                  State
                </label>
                <input
                  id="state"
                  name="state"
                  type="text"
                  value={formData.state}
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-[1.02]"
              >
                {loading ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Creating your account...
                  </>
                ) : (
                  "🩸 Create BloodLink Account"
                )}
              </button>
            </div>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">
                  Already have an account?
                </span>
              </div>
            </div>

            <div className="mt-6">
              <Link
                href="/login"
                className="w-full flex justify-center py-2 px-4 border border-red-600 rounded-md shadow-sm text-sm font-medium text-red-600 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                Sign in instead
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
