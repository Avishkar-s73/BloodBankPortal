/**
 * CreateBloodRequestModal - Modal dialog for creating blood requests
 * Replaces the separate /requests/new page with a reusable modal component
 */

"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Droplet, CheckCircle, XCircle, Search, X } from "lucide-react";

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

interface CreateBloodRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  prefilledBloodBankId?: string;
  onSuccess?: () => void;
}

export default function CreateBloodRequestModal({
  isOpen,
  onClose,
  prefilledBloodBankId,
  onSuccess,
}: CreateBloodRequestModalProps) {
  const { user } = useAuth();

  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [bloodBanks, setBloodBanks] = useState<BloodBank[]>([]);
  const [inventoryCheck, setInventoryCheck] = useState<InventoryCheck | null>(null);
  const [checkingInventory, setCheckingInventory] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    patientName: "",
    patientAge: "",
    patientGender: "MALE",
    bloodGroup: "A_POSITIVE",
    quantityNeeded: "1",
    urgency: "NORMAL",
    purpose: "",
    requiredBy: "",
    medicalNotes: "",
    doctorName: "",
    doctorContact: "",
    bloodBankId: prefilledBloodBankId || "",
    hospitalId: "",
  });

  // Fetch hospitals and blood banks on mount
  useEffect(() => {
    if (isOpen) {
      fetchHospitals();
      fetchBloodBanks();
    }
  }, [isOpen]);

  // Update bloodBankId when prefilled prop changes
  useEffect(() => {
    if (prefilledBloodBankId) {
      setFormData((prev) => ({ ...prev, bloodBankId: prefilledBloodBankId }));
    }
  }, [prefilledBloodBankId]);

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      setFormData({
        patientName: "",
        patientAge: "",
        patientGender: "MALE",
        bloodGroup: "A_POSITIVE",
        quantityNeeded: "1",
        urgency: "NORMAL",
        purpose: "",
        requiredBy: "",
        medicalNotes: "",
        doctorName: "",
        doctorContact: "",
        bloodBankId: prefilledBloodBankId || "",
        hospitalId: "",
      });
      setError("");
      setSuccess(false);
      setInventoryCheck(null);
    }
  }, [isOpen, prefilledBloodBankId]);

  const fetchHospitals = async () => {
    try {
      const response = await fetch("/api/hospitals");
      if (response.ok) {
        const data = await response.json();
        setHospitals(data.data || []);
      }
    } catch (err) {
      console.error("Failed to fetch hospitals");
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
      console.error("Failed to fetch blood banks");
    }
  };

  // Check inventory availability
  useEffect(() => {
    if (formData.bloodBankId && formData.bloodGroup && formData.quantityNeeded) {
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
            ? `${requestedQty} units can be fulfilled immediately ✓`
            : `Only ${available} units available. Request will be marked as PENDING.`,
        });
      } else {
        setInventoryCheck({
          availableUnits: 0,
          canFulfill: false,
          message: "⚠️ No inventory available. Request will be marked as PENDING.",
        });
      }
    } catch (err) {
      setInventoryCheck(null);
    } finally {
      setCheckingInventory(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (!user?.id) {
        throw new Error("User not authenticated. Please log in.");
      }

      const payload = {
        requesterId: user.id,
        bloodBankId: formData.bloodBankId,
        hospitalId: formData.hospitalId || undefined,
        bloodGroup: formData.bloodGroup,
        quantityNeeded: parseInt(formData.quantityNeeded),
        patientName: formData.patientName,
        patientAge: parseInt(formData.patientAge),
        patientGender: formData.patientGender,
        purpose: formData.purpose,
        requiredBy: new Date(formData.requiredBy).toISOString(),
        urgency: formData.urgency,
        medicalNotes: formData.medicalNotes || undefined,
        doctorName: formData.doctorName || undefined,
        doctorContact: formData.doctorContact || undefined,
      };

      const response = await fetch("/api/blood-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message || data.error || "Failed to create request");
      }

      setSuccess(true);
      setTimeout(() => {
        onSuccess?.();
        onClose();
      }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const today = new Date().toISOString().split("T")[0];

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-7xl w-full my-8">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-6 py-3 flex justify-between items-center rounded-t-2xl">
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Droplet className="w-5 h-5 text-red-600" />
            New Blood Request
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Content */}
        <div className="px-6 py-4 max-h-[calc(90vh-80px)] overflow-y-auto">
          {success && (
            <div className="mb-3 bg-green-50 border border-green-200 text-green-700 px-3 py-2 rounded-md text-sm flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              Request created successfully!
            </div>
          )}

          {error && (
            <div className="mb-3 bg-red-50 border border-red-200 text-red-600 px-3 py-2 rounded-md text-sm flex items-center gap-2">
              <XCircle className="w-4 h-4" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Patient Information */}
            <div className="border-b border-gray-200 pb-3">
              <h3 className="text-base font-semibold text-gray-900 mb-2">Patient Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Patient Name *
                  </label>
                  <input
                    type="text"
                    name="patientName"
                    value={formData.patientName}
                    onChange={handleChange}
                    required
                    placeholder="Full name"
                    className="w-full px-2 py-1.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
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
                    placeholder="Age"
                    className="w-full px-2 py-1.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Gender *
                  </label>
                  <select
                    name="patientGender"
                    value={formData.patientGender}
                    onChange={handleChange}
                    required
                    className="w-full px-2 py-1.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 text-sm"
                  >
                    <option value="MALE">Male</option>
                    <option value="FEMALE">Female</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Purpose *
                  </label>
                  <input
                    type="text"
                    name="purpose"
                    value={formData.purpose}
                    onChange={handleChange}
                    required
                    placeholder="e.g., Surgery, Emergency"
                    className="w-full px-2 py-1.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 text-sm"
                  />
                </div>
              </div>
            </div>

            {/* Blood Request Details */}
            <div className="border-b border-gray-200 pb-3">
              <h3 className="text-base font-semibold text-gray-900 mb-2">Blood Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Blood Group *
                  </label>
                  <select
                    name="bloodGroup"
                    value={formData.bloodGroup}
                    onChange={handleChange}
                    required
                    className="w-full px-2 py-1.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 text-sm"
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
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Quantity (Units) *
                  </label>
                  <input
                    type="number"
                    name="quantityNeeded"
                    min="1"
                    value={formData.quantityNeeded}
                    onChange={handleChange}
                    required
                    className="w-full px-2 py-1.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Urgency *
                  </label>
                  <select
                    name="urgency"
                    value={formData.urgency}
                    onChange={handleChange}
                    required
                    className="w-full px-2 py-1.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 text-sm"
                  >
                    <option value="NORMAL">Normal</option>
                    <option value="URGENT">Urgent</option>
                    <option value="CRITICAL">Critical</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Required By *
                  </label>
                  <input
                    type="date"
                    name="requiredBy"
                    min={today}
                    value={formData.requiredBy}
                    onChange={handleChange}
                    required
                    className="w-full px-2 py-1.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 text-sm"
                  />
                </div>
              </div>
            </div>

            {/* Blood Bank & Hospital */}
            <div className="border-b border-gray-200 pb-3">
              <h3 className="text-base font-semibold text-gray-900 mb-2">Blood Bank & Hospital</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="md:col-span-1">
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Blood Bank *
                  </label>
                  <select
                    name="bloodBankId"
                    value={formData.bloodBankId}
                    onChange={handleChange}
                    required
                    className="w-full px-2 py-1.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 text-sm"
                  >
                    <option value="">Select blood bank</option>
                    {bloodBanks.map((bank) => (
                      <option key={bank.id} value={bank.id}>
                        {bank.name} - {bank.city}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="md:col-span-1">
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Hospital (Optional)
                  </label>
                  <select
                    name="hospitalId"
                    value={formData.hospitalId}
                    onChange={handleChange}
                    className="w-full px-2 py-1.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 text-sm"
                  >
                    <option value="">Select hospital</option>
                    {hospitals.map((hospital) => (
                      <option key={hospital.id} value={hospital.id}>
                        {hospital.name} - {hospital.city}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="md:col-span-1 flex items-end">
                  {checkingInventory && (
                    <div className="w-full bg-blue-50 border border-blue-200 rounded-md px-2 py-1.5">
                      <p className="text-xs text-blue-700 flex items-center gap-1">
                        <Search className="w-3 h-3" />
                        Checking...
                      </p>
                    </div>
                  )}
                  {inventoryCheck && !checkingInventory && (
                    <div
                      className={`w-full border rounded-md px-2 py-1.5 ${
                        inventoryCheck.canFulfill
                          ? "bg-green-50 border-green-200"
                          : "bg-yellow-50 border-yellow-200"
                      }`}
                    >
                      <p
                        className={`text-xs font-medium ${
                          inventoryCheck.canFulfill ? "text-green-800" : "text-yellow-800"
                        }`}
                      >
                        {inventoryCheck.message}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Medical Details */}
            <div>
              <h3 className="text-base font-semibold text-gray-900 mb-2">Medical Details (Optional)</h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Doctor Name
                  </label>
                  <input
                    type="text"
                    name="doctorName"
                    value={formData.doctorName}
                    onChange={handleChange}
                    className="w-full px-2 py-1.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Doctor Contact
                  </label>
                  <input
                    type="tel"
                    name="doctorContact"
                    value={formData.doctorContact}
                    onChange={handleChange}
                    className="w-full px-2 py-1.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 text-sm"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Medical Notes
                  </label>
                  <input
                    type="text"
                    name="medicalNotes"
                    value={formData.medicalNotes}
                    onChange={handleChange}
                    placeholder="Additional medical information..."
                    className="w-full px-2 py-1.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 text-sm"
                  />
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-3 pt-3 border-t">
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="px-4 py-1.5 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 text-sm font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-md text-sm font-medium disabled:opacity-50"
              >
                {loading ? "Submitting..." : "Create Request"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
