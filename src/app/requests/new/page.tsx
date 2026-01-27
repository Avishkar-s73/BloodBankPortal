/**
 * New Blood Request Page
 * Create a new blood request following the exact workflow specification
 *
 * WORKFLOW COMPLIANCE:
 * 1. Fetch User ID from auth context (never create IDs on frontend)
 * 2. Fetch Blood Bank IDs from backend
 * 3. Submit request with ALL required fields
 * 4. Backend handles atomic transaction (inventory check + deduction)
 */

"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";

interface Hospital {
  id: string;
  name: string;
  city: string;
  state: string;
}

interface BloodBank {
  id: string;
  name: string;
  city: string;
  state: string;
  phone: string;
}

interface InventoryCheck {
  availableUnits: number;
  canFulfill: boolean;
  message: string;
}

export default function NewRequestPage() {
  return (
    <ProtectedRoute allowedRoles={["HOSPITAL", "ADMIN", "DONOR"]}>
      <NewRequestForm />
    </ProtectedRoute>
  );
}

function NewRequestForm() {
  const router = useRouter();
  const { user } = useAuth();
  const searchParams = useSearchParams();

  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [bloodBanks, setBloodBanks] = useState<BloodBank[]>([]);
  const [inventoryCheck, setInventoryCheck] = useState<InventoryCheck | null>(
    null
  );
  const [checkingInventory, setCheckingInventory] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  // WORKFLOW REQUIREMENT: All fields the API expects
  const [formData, setFormData] = useState({
    // Patient Information (REQUIRED by API)
    patientName: "",
    patientAge: "",
    patientGender: "MALE",

    // Request Details (REQUIRED by API)
    bloodGroup: "A_POSITIVE",
    quantityNeeded: "1", // Note: API expects 'quantityNeeded', not 'quantityUnits'
    urgency: "NORMAL",
    purpose: "",
    requiredBy: "",

    // Medical Details (OPTIONAL but good practice)
    medicalNotes: "",
    doctorName: "",
    doctorContact: "",

    // IDs - WORKFLOW REQUIREMENT: Fetch from backend, never generate
    bloodBankId: "",
    hospitalId: "",
  });

  // Fetch hospitals and blood banks on component mount
  useEffect(() => {
    fetchHospitals();
    fetchBloodBanks();
    // If bloodBankId provided in query (from Blood Banks tab), preselect it
    const bankId = searchParams?.get("bloodBankId");
    if (bankId) {
      setFormData((s) => ({ ...s, bloodBankId: bankId }));
    }
  }, []);

  const fetchHospitals = async () => {
    try {
      const response = await fetch("/api/hospitals");
      if (response.ok) {
        const data = await response.json();
        setHospitals(data.data || []);
      }
    } catch (err) {
      // Failed to fetch hospitals
    }
  };

  const fetchBloodBanks = async () => {
    try {
      const response = await fetch("/api/blood-banks");
      if (response.ok) {
        const data = await response.json();
        setBloodBanks(data.data || []);
      }
    } catch (err) {
      // Failed to fetch blood banks
    }
  };

  // WORKFLOW ENHANCEMENT: Check inventory availability before submission
  useEffect(() => {
    if (
      formData.bloodBankId &&
      formData.bloodGroup &&
      formData.quantityNeeded
    ) {
      checkInventoryAvailability();
    } else {
      setInventoryCheck(null);
    }
  }, [formData.bloodBankId, formData.bloodGroup, formData.quantityNeeded]);

  const checkInventoryAvailability = async () => {
    setCheckingInventory(true);
    try {
      const params = new URLSearchParams({
        bloodBankId: formData.bloodBankId,
        bloodGroup: formData.bloodGroup,
      });

      const response = await fetch(`/api/blood-inventory?${params}`);
      const data = await response.json();

      if (data.success && data.data.length > 0) {
        const inventory = data.data[0];
        const requestedQty = parseInt(formData.quantityNeeded);
        const available = inventory.quantity;
        const canFulfill = available >= requestedQty;

        setInventoryCheck({
          availableUnits: available,
          canFulfill,
          message: canFulfill
            ? `✅ ${requestedQty} units can be fulfilled immediately`
            : `⚠️ Only ${available} units available. Request will be marked as PENDING.`,
        });
      } else {
        setInventoryCheck({
          availableUnits: 0,
          canFulfill: false,
          message:
            "⚠️ No inventory available. Request will be marked as PENDING.",
        });
      }
    } catch (err) {
      setInventoryCheck(null);
    } finally {
      setCheckingInventory(false);
    }
  };

  // WORKFLOW REQUIREMENT: Submit with ALL required fields matching API contract
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // CRITICAL: Ensure user is authenticated and has an ID
      if (!user?.id) {
        throw new Error("User not authenticated. Please log in.");
      }

      // Build payload matching EXACT API expectations
      const payload = {
        // WORKFLOW REQUIREMENT: User ID from auth context (never generated on frontend)
        requesterId: user.id,

        // WORKFLOW REQUIREMENT: Blood Bank ID from dropdown
        bloodBankId: formData.bloodBankId,

        // Hospital ID (optional but recommended)
        hospitalId: formData.hospitalId || undefined,

        // Blood details
        bloodGroup: formData.bloodGroup,
        quantityNeeded: parseInt(formData.quantityNeeded), // API expects number

        // Patient information (REQUIRED by API)
        patientName: formData.patientName,
        patientAge: parseInt(formData.patientAge),
        patientGender: formData.patientGender,

        // Request details (REQUIRED by API)
        purpose: formData.purpose,
        requiredBy: new Date(formData.requiredBy).toISOString(),
        urgency: formData.urgency,

        // Medical details (OPTIONAL)
        medicalNotes: formData.medicalNotes || undefined,
        doctorName: formData.doctorName || undefined,
        doctorContact: formData.doctorContact || undefined,
      };

      console.log("Submitting blood request:", payload);

      const response = await fetch("/api/blood-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error?.message || data.error || "Failed to create request"
        );
      }

      setSuccess(true);
      setTimeout(() => {
        router.push("/requests");
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // Set minimum date to today
  const today = new Date().toISOString().split("T")[0];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          🩸 New Blood Request
        </h1>
        <p className="mt-2 text-gray-600">
          Submit a request for blood units. Our system will check inventory and
          fulfill immediately if available.
        </p>
      </div>

      <div className="bg-white rounded-lg shadow-lg p-8">
        {success && (
          <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md">
            ✅ Request created successfully! Redirecting...
          </div>
        )}

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md">
            ❌ {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Patient Information Section */}
          <div className="border-b border-gray-200 pb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Patient Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Patient Name *
                </label>
                <input
                  type="text"
                  name="patientName"
                  value={formData.patientName}
                  onChange={handleChange}
                  required
                  placeholder="Full name"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Patient Age *
                </label>
                <input
                  type="number"
                  name="patientAge"
                  min="0"
                  max="150"
                  value={formData.patientAge}
                  onChange={handleChange}
                  required
                  placeholder="Age in years"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Patient Gender *
                </label>
                <select
                  name="patientGender"
                  value={formData.patientGender}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  <option value="MALE">Male</option>
                  <option value="FEMALE">Female</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>
            </div>
          </div>

          {/* Blood Request Details Section */}
          <div className="border-b border-gray-200 pb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Blood Request Details
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Blood Group *
                </label>
                <select
                  name="bloodGroup"
                  value={formData.bloodGroup}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  <option value="A_POSITIVE">A+</option>
                  <option value="A_NEGATIVE">A-</option>
                  <option value="B_POSITIVE">B+</option>
                  <option value="B_NEGATIVE">B-</option>
                  <option value="AB_POSITIVE">AB+</option>
                  <option value="AB_NEGATIVE">AB-</option>
                  <option value="O_POSITIVE">O+</option>
                  <option value="O_NEGATIVE">O-</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Quantity Needed (Units) *
                </label>
                <input
                  type="number"
                  name="quantityNeeded"
                  min="1"
                  value={formData.quantityNeeded}
                  onChange={handleChange}
                  required
                  placeholder="Number of units"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                />
                <p className="mt-1 text-xs text-gray-500">
                  1 unit ≈ 450ml of blood
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Urgency Level *
                </label>
                <select
                  name="urgency"
                  value={formData.urgency}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  <option value="NORMAL">Normal - Routine</option>
                  <option value="URGENT">Urgent - Priority</option>
                  <option value="CRITICAL">Critical - Emergency</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Required By Date *
                </label>
                <input
                  type="date"
                  name="requiredBy"
                  min={today}
                  value={formData.requiredBy}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>
            </div>
          </div>

          {/* Blood Bank & Hospital Selection */}
          <div className="border-b border-gray-200 pb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Blood Bank & Hospital
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Blood Bank * (Source)
                </label>
                <select
                  name="bloodBankId"
                  value={formData.bloodBankId}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  <option value="">Select a blood bank</option>
                  {bloodBanks.map((bank) => (
                    <option key={bank.id} value={bank.id}>
                      {bank.name} - {bank.city}, {bank.state}
                    </option>
                  ))}
                </select>
                <p className="mt-1 text-xs text-gray-500">
                  Blood bank that will fulfill this request
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Hospital (Optional)
                </label>
                <select
                  name="hospitalId"
                  value={formData.hospitalId}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  <option value="">Select a hospital</option>
                  {hospitals.map((hospital) => (
                    <option key={hospital.id} value={hospital.id}>
                      {hospital.name} - {hospital.city}
                    </option>
                  ))}
                </select>
                <p className="mt-1 text-xs text-gray-500">
                  Hospital making the request (if applicable)
                </p>
              </div>
            </div>

            {/* Real-time Inventory Check */}
            {checkingInventory && (
              <div className="mt-4 bg-blue-50 border border-blue-200 rounded-md p-4">
                <p className="text-sm text-blue-700">
                  🔍 Checking inventory availability...
                </p>
              </div>
            )}

            {inventoryCheck && !checkingInventory && (
              <div
                className={`mt-4 border rounded-md p-4 ${
                  inventoryCheck.canFulfill
                    ? "bg-green-50 border-green-200"
                    : "bg-yellow-50 border-yellow-200"
                }`}
              >
                <div className="flex items-start">
                  <div className="flex-1">
                    <p
                      className={`text-sm font-medium ${
                        inventoryCheck.canFulfill
                          ? "text-green-800"
                          : "text-yellow-800"
                      }`}
                    >
                      {inventoryCheck.message}
                    </p>
                    <p
                      className={`text-xs mt-1 ${
                        inventoryCheck.canFulfill
                          ? "text-green-600"
                          : "text-yellow-600"
                      }`}
                    >
                      Available: {inventoryCheck.availableUnits} units |
                      Requested: {formData.quantityNeeded} units
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Medical Details Section */}
          <div className="border-b border-gray-200 pb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Medical Details
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Purpose of Request *
                </label>
                <input
                  type="text"
                  name="purpose"
                  value={formData.purpose}
                  onChange={handleChange}
                  required
                  placeholder="e.g., Surgery, Emergency, Cancer Treatment"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Doctor Name (Optional)
                  </label>
                  <input
                    type="text"
                    name="doctorName"
                    value={formData.doctorName}
                    onChange={handleChange}
                    placeholder="Dr. Name"
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Doctor Contact (Optional)
                  </label>
                  <input
                    type="tel"
                    name="doctorContact"
                    value={formData.doctorContact}
                    onChange={handleChange}
                    placeholder="Phone number"
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Medical Notes (Optional)
                </label>
                <textarea
                  name="medicalNotes"
                  value={formData.medicalNotes}
                  onChange={handleChange}
                  rows={4}
                  placeholder="Any additional medical information..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>
            </div>
          </div>

          {/* Workflow Information */}
          <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
            <div className="flex">
              <svg
                className="h-5 w-5 text-blue-400 mt-0.5 flex-shrink-0"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                  clipRule="evenodd"
                />
              </svg>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-blue-800">
                  How it works:
                </h3>
                <div className="mt-2 text-sm text-blue-700 space-y-1">
                  <p>
                    1️⃣ System checks real-time inventory at the selected blood
                    bank
                  </p>
                  <p>
                    2️⃣ If available: Request is FULFILLED immediately +
                    inventory is reduced
                  </p>
                  <p>
                    3️⃣ If unavailable: Request is marked PENDING + no inventory
                    change
                  </p>
                  <p className="font-medium mt-2">
                    ⚛️ All operations are atomic - either everything succeeds or
                    nothing changes
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-4 pt-4">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 border border-transparent rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              {loading ? "Submitting..." : "Submit Blood Request"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
