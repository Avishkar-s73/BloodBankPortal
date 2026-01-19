/**
 * Blood Requests Page - Create and View Blood Requests
 * Allows creating new blood requests and viewing existing ones
 * Implements complete end-to-end flow: check inventory → create request → see updates
 */

"use client";

import { useEffect, useState } from "react";

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
  // State management
  const [requests, setRequests] = useState<BloodRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Form state
  const [bloodGroup, setBloodGroup] = useState("A_POSITIVE");
  const [quantityMl, setQuantityMl] = useState("");
  const [urgency, setUrgency] = useState("NORMAL");
  const [reason, setReason] = useState("");
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
  useEffect(() => {
    fetchRequests();
  }, []);

  // Function to fetch all blood requests
  const fetchRequests = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch("/api/blood-requests");

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
    if (!quantityMl || parseInt(quantityMl) <= 0) {
      setError("Please enter a valid quantity");
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
          quantityMl: parseInt(quantityMl),
          urgency,
          reason: reason.trim() || undefined,
          requesterId: requesterId.trim(),
          bloodBankId: bloodBankId.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create request");
      }

      // Success - show message and refresh list
      setSuccessMessage(
        `Blood request created successfully! Request ID: ${data.data.id.substring(
          0,
          8
        )}...`
      );

      // Reset form
      setQuantityMl("");
      setReason("");
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
      <h1 className="text-3xl font-bold mb-8">📝 Blood Requests</h1>

      {/* Create Blood Request Form */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Create New Blood Request</h2>

        {/* Success Message */}
        {successMessage && (
          <div className="mb-4 p-3 bg-green-100 text-green-800 rounded">
            ✅ {successMessage}
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-800 rounded">
            ❌ {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            {/* Blood Group */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Blood Group <span className="text-red-500">*</span>
              </label>
              <select
                value={bloodGroup}
                onChange={(e) => setBloodGroup(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500"
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
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Quantity (ml) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                value={quantityMl}
                onChange={(e) => setQuantityMl(e.target.value)}
                placeholder="e.g., 450"
                min="1"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500"
                required
              />
            </div>

            {/* Urgency */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Urgency Level <span className="text-red-500">*</span>
              </label>
              <select
                value={urgency}
                onChange={(e) => setUrgency(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500"
              >
                {urgencyLevels.map((level) => (
                  <option key={level} value={level}>
                    {level}
                  </option>
                ))}
              </select>
            </div>

            {/* Requester ID */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Requester ID <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={requesterId}
                onChange={(e) => setRequesterId(e.target.value)}
                placeholder="Enter requester UUID"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500"
                required
              />
            </div>

            {/* Blood Bank ID */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Blood Bank ID <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={bloodBankId}
                onChange={(e) => setBloodBankId(e.target.value)}
                placeholder="Enter blood bank UUID"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500"
                required
              />
            </div>

            {/* Reason (optional) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Reason (Optional)
              </label>
              <input
                type="text"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="e.g., Emergency surgery"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500"
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={submitting}
            className={`px-6 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors ${
              submitting ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            {submitting ? "Submitting..." : "Create Blood Request"}
          </button>
        </form>

        <p className="text-sm text-gray-500 mt-4">
          💡 Tip: Make sure the requester and blood bank exist in the database
          before creating a request.
        </p>
      </div>

      {/* Blood Requests List */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">All Blood Requests</h2>
          <button
            onClick={fetchRequests}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
          >
            🔄 Refresh
          </button>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="text-center py-8 text-gray-600">
            Loading requests...
          </div>
        ) : requests.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No blood requests found. Create your first request above!
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-gray-200">
                  <th className="text-left py-3 px-4 font-semibold">ID</th>
                  <th className="text-left py-3 px-4 font-semibold">
                    Blood Group
                  </th>
                  <th className="text-left py-3 px-4 font-semibold">
                    Quantity
                  </th>
                  <th className="text-left py-3 px-4 font-semibold">Urgency</th>
                  <th className="text-left py-3 px-4 font-semibold">Status</th>
                  <th className="text-left py-3 px-4 font-semibold">
                    Requester
                  </th>
                  <th className="text-left py-3 px-4 font-semibold">Date</th>
                </tr>
              </thead>
              <tbody>
                {requests.map((request) => (
                  <tr key={request.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4 text-xs text-gray-500 font-mono">
                      {request.id.substring(0, 8)}...
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-semibold text-red-600 text-lg">
                        {request.bloodGroup.replace("_", " ")}
                      </span>
                    </td>
                    <td className="py-3 px-4">{request.quantityMl} ml</td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-1 rounded text-xs font-semibold ${
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
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-1 rounded text-xs font-semibold ${
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
                    <td className="py-3 px-4">
                      {request.requester.firstName} {request.requester.lastName}
                    </td>
                    <td className="py-3 px-4 text-gray-600">
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
