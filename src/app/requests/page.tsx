/**
 * Blood Requests Page - Create and View Blood Requests
 * Allows creating new blood requests and viewing existing ones
 * Implements complete end-to-end flow: check inventory → create request → see updates
 */

"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";

// Type definitions
interface BloodRequest {
  id: string;
  bloodGroup: string;
  quantityMl: number;
  urgency: string;
  status: string;
  reason?: string;
  createdAt: string;
  requester: {
    firstName: string;
    lastName: string;
  };
  bloodBank?: {
    name: string;
    city: string;
  };
}

export default function BloodRequestsPage() {
  const { user } = useAuth();
  // State management
  const [requests, setRequests] = useState<BloodRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Form state
  const [bloodGroup, setBloodGroup] = useState("A_POSITIVE");
  const [quantityNeeded, setQuantityNeeded] = useState("");
  const [urgency, setUrgency] = useState("NORMAL");
  const [patientName, setPatientName] = useState("");
  const [patientAge, setPatientAge] = useState("");
  const [purpose, setPurpose] = useState("");
  const [requiredBy, setRequiredBy] = useState("");
  const [requesterId, setRequesterId] = useState("");
  const [bloodBankId, setBloodBankId] = useState("");

  // Options
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

  const urgencyLevels = ["NORMAL", "URGENT", "CRITICAL"];

  // Fetch requests on component mount
  const router = useRouter();

  useEffect(() => {
    // If logged in as hospital, redirect to hospital dashboard and do not show requests page
    if (user && user.role === "HOSPITAL") {
      router.replace("/hospital-dashboard");
      return;
    }

    // refetch when auth user becomes available
    fetchRequests();
  }, [user]);

  // Function to fetch all blood requests
  const fetchRequests = async () => {
    try {
      setLoading(true);
      setError(null);

      // If logged-in hospital, request only its own requests
      let url = "/api/blood-requests";
      if (user && user.role === "HOSPITAL") {
        url += "?my=true";
      }

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error("Failed to fetch requests");
      }

      const data = await response.json();
      setRequests(data.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  // Function to handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Clear previous messages
    setSuccessMessage(null);
    setError(null);

    // Validate inputs
    if (!quantityNeeded || parseInt(quantityNeeded) <= 0) {
      setError("Please enter a valid quantity");
      return;
    }

    if (!patientName.trim()) {
      setError("Please enter patient name");
      return;
    }

    if (
      !patientAge ||
      parseInt(patientAge) <= 0 ||
      parseInt(patientAge) > 150
    ) {
      setError("Please enter a valid patient age (1-150)");
      return;
    }

    if (!purpose.trim()) {
      setError("Please enter the purpose");
      return;
    }

    if (!requiredBy) {
      setError("Please select when blood is required");
      return;
    }

    if (!requesterId.trim()) {
      setError("Please enter a requester ID");
      return;
    }

    if (!bloodBankId.trim()) {
      setError("Please enter a blood bank ID");
      return;
    }

    try {
      setSubmitting(true);

      const response = await fetch("/api/blood-requests", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          bloodGroup,
          quantityNeeded: parseInt(quantityNeeded),
          urgency,
          patientName: patientName.trim(),
          patientAge: parseInt(patientAge),
          purpose: purpose.trim(),
          requiredBy: new Date(requiredBy).toISOString(),
          requesterId: requesterId.trim(),
          bloodBankId: bloodBankId.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        // Handle error object properly
        const errorMessage =
          typeof data.error === "string"
            ? data.error
            : data.error?.message || data.message || "Failed to create request";

        const errorDetails = data.error?.details?.missingFields
          ? ` Missing fields: ${data.error.details.missingFields.join(", ")}`
          : "";

        throw new Error(errorMessage + errorDetails);
      }

      // Success - show message and refresh list
      setSuccessMessage(
        `Blood request created successfully! Request ID: ${data.data.id.substring(
          0,
          8
        )}...`
      );

      // Reset form
      setQuantityNeeded("");
      setPatientName("");
      setPatientAge("");
      setPurpose("");
      setRequiredBy("");
      setRequesterId("");
      setBloodBankId("");
      setUrgency("NORMAL");

      // Refresh requests list
      await fetchRequests();
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-[#C62828] to-[#E53935] bg-clip-text text-transparent">
          Blood Requests
        </h1>
        <p className="text-gray-600 mt-2">
          Create and manage blood requests for patients
        </p>
      </div>

      {/* Create Blood Request Form */}
      <div className="bg-gradient-to-br from-red-50 to-white rounded-2xl shadow-lg p-8 mb-8 border-l-4 border-red-500">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          Create Blood Request
        </h2>

        {/* Success Message */}
        {successMessage && (
          <div className="mb-4 p-4 bg-green-100 text-green-800 rounded-lg border-l-4 border-green-500">
            {successMessage}
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-4 bg-red-100 text-red-800 rounded-lg border-l-4 border-red-500">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            {/* Blood Group */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Blood Group <span className="text-red-500">*</span>
              </label>
              <select
                value={bloodGroup}
                onChange={(e) => setBloodGroup(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all"
              >
                {bloodGroups.map((group) => (
                  <option key={group} value={group}>
                    {group.replace("_", " ")}
                  </option>
                ))}
              </select>
            </div>

            {/* Quantity */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Quantity Needed (units) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                value={quantityNeeded}
                onChange={(e) => setQuantityNeeded(e.target.value)}
                placeholder="e.g., 2"
                min="1"
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all"
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                1 unit = 450 ml of blood
              </p>
            </div>

            {/* Urgency */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Urgency Level <span className="text-red-500">*</span>
              </label>
              <select
                value={urgency}
                onChange={(e) => setUrgency(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all"
              >
                {urgencyLevels.map((level) => (
                  <option key={level} value={level}>
                    {level}
                  </option>
                ))}
              </select>
            </div>

            {/* Patient Name */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Patient Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={patientName}
                onChange={(e) => setPatientName(e.target.value)}
                placeholder="Enter patient name"
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all"
                required
              />
            </div>

            {/* Patient Age */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Patient Age <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                value={patientAge}
                onChange={(e) => setPatientAge(e.target.value)}
                placeholder="Enter age"
                min="1"
                max="150"
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all"
                required
              />
            </div>

            {/* Purpose */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Medical Purpose <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={purpose}
                onChange={(e) => setPurpose(e.target.value)}
                placeholder="e.g., Emergency surgery, Treatment"
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all"
                required
              />
            </div>

            {/* Required By */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Required By <span className="text-red-500">*</span>
              </label>
              <input
                type="datetime-local"
                value={requiredBy}
                onChange={(e) => setRequiredBy(e.target.value)}
                min={new Date().toISOString().slice(0, 16)}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all"
                required
              />
            </div>

            {/* Requester ID */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Requester ID <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={requesterId}
                onChange={(e) => setRequesterId(e.target.value)}
                placeholder="Enter requester UUID"
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all"
                required
              />
            </div>

            {/* Blood Bank ID */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Blood Bank ID <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={bloodBankId}
                onChange={(e) => setBloodBankId(e.target.value)}
                placeholder="Enter blood bank UUID"
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all"
                required
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={submitting}
            className={`px-8 py-3 bg-gradient-to-r from-[#C62828] to-[#E53935] text-white rounded-lg font-semibold hover:from-[#B71C1C] hover:to-[#C62828] transition-all shadow-md hover:shadow-lg ${
              submitting ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            {submitting ? "Submitting request..." : "Submit Blood Request"}
          </button>
        </form>

        <div className="text-sm text-gray-600 mt-4 p-3 bg-blue-50 rounded-lg border-l-4 border-blue-400">
          <strong>Note:</strong> Ensure the requester and blood bank exist in
          the database before creating a request.
        </div>
      </div>

      {/* Blood Requests List */}
      <div className="bg-white rounded-2xl shadow-lg p-8">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <span className="text-3xl">📋</span>
            <h2 className="text-2xl font-bold text-gray-900">
              All Help Requests
            </h2>
          </div>
          <button
            onClick={fetchRequests}
            className="px-5 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg font-medium hover:from-blue-600 hover:to-blue-700 transition-all shadow-md hover:shadow-lg flex items-center gap-2"
          >
            <span>🔄</span>
            <span>Refresh</span>
          </button>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="text-center py-12 text-gray-600">
            <div className="text-5xl mb-4">⏳</div>
            <p className="text-lg">Loading help requests...</p>
          </div>
        ) : requests.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <div className="text-5xl mb-4">📝</div>
            <p className="text-lg font-medium">No blood requests found</p>
            <p className="text-sm mt-2">
              Create your first request to help save lives!
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-gray-200 bg-gray-50">
                  <th className="text-left py-4 px-4 font-bold text-gray-700">
                    ID
                  </th>
                  <th className="text-left py-4 px-4 font-bold text-gray-700">
                    Blood Group
                  </th>
                  <th className="text-left py-4 px-4 font-bold text-gray-700">
                    Quantity
                  </th>
                  <th className="text-left py-4 px-4 font-bold text-gray-700">
                    Urgency
                  </th>
                  <th className="text-left py-4 px-4 font-bold text-gray-700">
                    Status
                  </th>
                  <th className="text-left py-4 px-4 font-bold text-gray-700">
                    Requester
                  </th>
                  <th className="text-left py-4 px-4 font-bold text-gray-700">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody>
                {requests.map((request) => (
                  <tr
                    key={request.id}
                    className="border-b hover:bg-gray-50 transition-colors"
                  >
                    <td className="py-4 px-4 text-xs text-gray-500 font-mono">
                      {request.id.substring(0, 8)}...
                    </td>
                    <td className="py-4 px-4">
                      <span className="font-bold text-red-600 text-lg px-3 py-1 bg-red-50 rounded-full inline-block">
                        {request.bloodGroup.replace("_", " ")}
                      </span>
                    </td>
                    <td className="py-4 px-4 font-semibold">
                      {request.quantityMl} ml
                    </td>
                    <td className="py-4 px-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          request.urgency === "CRITICAL"
                            ? "bg-red-100 text-red-800"
                            : request.urgency === "URGENT"
                            ? "bg-orange-100 text-orange-800"
                            : "bg-blue-100 text-blue-800"
                        }`}
                      >
                        {request.urgency}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          request.status === "FULFILLED"
                            ? "bg-green-100 text-green-800"
                            : request.status === "APPROVED"
                            ? "bg-blue-100 text-blue-800"
                            : request.status === "REJECTED"
                            ? "bg-red-100 text-red-800"
                            : request.status === "CANCELLED"
                            ? "bg-gray-100 text-gray-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {request.status}
                      </span>
                    </td>
                    <td className="py-4 px-4 font-medium">
                      {request.requester.firstName} {request.requester.lastName}
                    </td>
                    <td className="py-4 px-4 text-gray-600">
                      {new Date(request.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
