/**
 * Blood Request Details Page
 * View and manage individual blood request
 */

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import Link from "next/link";

interface BloodRequest {
  id: string;
  bloodGroup: string;
  quantityUnits: number;
  urgency: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  status: "PENDING" | "APPROVED" | "FULFILLED" | "REJECTED" | "CANCELLED";
  purpose: string;
  requestDate: string;
  requiredBy: string;
  notes?: string;
  hospital: {
    id: string;
    name: string;
    phone: string;
    email: string;
    address: string;
    city: string;
    state: string;
  };
  bloodBank?: {
    id: string;
    name: string;
    phone: string;
    city: string;
  };
  fulfillmentDate?: string;
  fulfillmentNotes?: string;
}

export default function RequestDetailsPage({
  params,
}: {
  params: { id: string };
}) {
  const router = useRouter();
  const { user } = useAuth();
  const [request, setRequest] = useState<BloodRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  // Status update form
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [newStatus, setNewStatus] = useState("");
  const [statusNotes, setStatusNotes] = useState("");

  useEffect(() => {
    fetchRequest();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.id]);

  const fetchRequest = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/blood-requests/${params.id}`, {
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Failed to fetch request details");
      }

      const data = await response.json();
      setRequest(data.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async () => {
    if (!newStatus) return;

    try {
      setActionLoading(true);
      const response = await fetch(`/api/blood-requests/${params.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          status: newStatus,
          fulfillmentNotes: statusNotes,
          fulfillmentDate: newStatus === "FULFILLED" ? new Date() : undefined,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update status");
      }

      await fetchRequest();
      setShowStatusModal(false);
      setNewStatus("");
      setStatusNotes("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update status");
    } finally {
      setActionLoading(false);
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case "CRITICAL":
        return "bg-red-600 text-white";
      case "HIGH":
        return "bg-orange-500 text-white";
      case "MEDIUM":
        return "bg-yellow-500 text-white";
      case "LOW":
        return "bg-green-500 text-white";
      default:
        return "bg-gray-500 text-white";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PENDING":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "APPROVED":
        return "bg-green-100 text-green-800 border-green-200";
      case "FULFILLED":
        return "bg-teal-100 text-teal-800 border-teal-200";
      case "REJECTED":
        return "bg-red-100 text-red-800 border-red-200";
      case "CANCELLED":
        return "bg-gray-100 text-gray-800 border-gray-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const canUpdateStatus = () => {
    return user?.role === "BLOOD_BANK" || user?.role === "ADMIN";
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    );
  }

  if (error || !request) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
          {error || "Request not found"}
        </div>
        <Link
          href="/requests"
          className="mt-4 inline-block text-red-600 hover:text-red-800"
        >
          ← Back to Requests
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-6">
        <Link
          href="/requests"
          className="text-red-600 hover:text-red-800 flex items-center mb-4"
        >
          <svg
            className="w-5 h-5 mr-1"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
          Back to Requests
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">
          Blood Request Details
        </h1>
        <p className="text-gray-600 mt-1">Request ID: {request.id}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Request Information */}
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="bg-red-600 px-6 py-4">
              <h2 className="text-xl font-semibold text-white">
                Request Information
              </h2>
            </div>
            <div className="p-6 space-y-6">
              {/* Blood Group and Quantity */}
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="text-sm text-gray-500">Blood Group</label>
                  <div className="text-3xl font-bold text-red-600 mt-1">
                    {request.bloodGroup.replace("_", " ")}
                  </div>
                </div>
                <div>
                  <label className="text-sm text-gray-500">
                    Quantity Needed
                  </label>
                  <div className="text-3xl font-bold text-gray-900 mt-1">
                    {request.quantityUnits} units
                  </div>
                  <div className="text-sm text-gray-500">
                    ({request.quantityUnits * 450} ml)
                  </div>
                </div>
              </div>

              {/* Status and Urgency */}
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="text-sm text-gray-500">Status</label>
                  <div className="mt-2">
                    <span
                      className={`px-4 py-2 inline-flex text-sm font-semibold rounded-full border ${getStatusColor(
                        request.status
                      )}`}
                    >
                      {request.status}
                    </span>
                  </div>
                </div>
                <div>
                  <label className="text-sm text-gray-500">Urgency Level</label>
                  <div className="mt-2">
                    <span
                      className={`px-4 py-2 inline-flex text-sm font-semibold rounded-full ${getUrgencyColor(
                        request.urgency
                      )}`}
                    >
                      {request.urgency}
                    </span>
                  </div>
                </div>
              </div>

              {/* Dates */}
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="text-sm text-gray-500">Request Date</label>
                  <div className="text-lg font-medium text-gray-900 mt-1">
                    {new Date(request.requestDate).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </div>
                </div>
                <div>
                  <label className="text-sm text-gray-500">Required By</label>
                  <div className="text-lg font-medium text-gray-900 mt-1">
                    {new Date(request.requiredBy).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </div>
                </div>
              </div>

              {/* Purpose */}
              <div>
                <label className="text-sm text-gray-500">Purpose</label>
                <div className="text-lg text-gray-900 mt-1">
                  {request.purpose}
                </div>
              </div>

              {/* Notes */}
              {request.notes && (
                <div>
                  <label className="text-sm text-gray-500">
                    Additional Notes
                  </label>
                  <div className="text-gray-900 mt-1 p-4 bg-gray-50 rounded-md">
                    {request.notes}
                  </div>
                </div>
              )}

              {/* Fulfillment Info */}
              {request.status === "FULFILLED" && (
                <div className="border-t pt-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Fulfillment Details
                  </h3>
                  {request.fulfillmentDate && (
                    <div className="mb-3">
                      <label className="text-sm text-gray-500">
                        Fulfilled On
                      </label>
                      <div className="text-gray-900 mt-1">
                        {new Date(request.fulfillmentDate).toLocaleString()}
                      </div>
                    </div>
                  )}
                  {request.fulfillmentNotes && (
                    <div>
                      <label className="text-sm text-gray-500">Notes</label>
                      <div className="text-gray-900 mt-1 p-4 bg-gray-50 rounded-md">
                        {request.fulfillmentNotes}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Hospital Information */}
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="bg-gray-800 px-6 py-4">
              <h2 className="text-xl font-semibold text-white">
                Hospital Information
              </h2>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="text-sm text-gray-500">Hospital Name</label>
                <div className="text-lg font-medium text-gray-900 mt-1">
                  {request.hospital.name}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-gray-500">Phone</label>
                  <div className="text-gray-900 mt-1">
                    {request.hospital.phone}
                  </div>
                </div>
                <div>
                  <label className="text-sm text-gray-500">Email</label>
                  <div className="text-gray-900 mt-1">
                    {request.hospital.email}
                  </div>
                </div>
              </div>
              <div>
                <label className="text-sm text-gray-500">Address</label>
                <div className="text-gray-900 mt-1">
                  {request.hospital.address}
                  <br />
                  {request.hospital.city}, {request.hospital.state}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Actions */}
          {canUpdateStatus() && request.status === "PENDING" && (
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Actions
              </h3>
              <div className="space-y-3">
                <button
                  onClick={() => {
                    setNewStatus("APPROVED");
                    setShowStatusModal(true);
                  }}
                  className="w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  Approve Request
                </button>
                <button
                  onClick={() => {
                    setNewStatus("FULFILLED");
                    setShowStatusModal(true);
                  }}
                  className="w-full px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-500"
                >
                  Mark as Fulfilled
                </button>
                <button
                  onClick={() => {
                    setNewStatus("REJECTED");
                    setShowStatusModal(true);
                  }}
                  className="w-full px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  Reject Request
                </button>
              </div>
            </div>
          )}

          {/* Blood Bank Info */}
          {request.bloodBank && (
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Assigned Blood Bank
              </h3>
              <div className="space-y-3">
                <div>
                  <label className="text-sm text-gray-500">Name</label>
                  <div className="text-gray-900 mt-1">
                    {request.bloodBank.name}
                  </div>
                </div>
                <div>
                  <label className="text-sm text-gray-500">Contact</label>
                  <div className="text-gray-900 mt-1">
                    {request.bloodBank.phone}
                  </div>
                </div>
                <div>
                  <label className="text-sm text-gray-500">Location</label>
                  <div className="text-gray-900 mt-1">
                    {request.bloodBank.city}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Request Timeline */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Timeline
            </h3>
            <div className="space-y-4">
              <div className="flex items-start">
                <div className="bg-green-500 rounded-full p-2 mr-3">
                  <svg
                    className="w-4 h-4 text-white"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="flex-1">
                  <div className="text-sm font-medium text-gray-900">
                    Request Created
                  </div>
                  <div className="text-xs text-gray-500">
                    {new Date(request.requestDate).toLocaleString()}
                  </div>
                </div>
              </div>

              {request.status !== "PENDING" && (
                <div className="flex items-start">
                  <div
                    className={`${
                      request.status === "FULFILLED"
                        ? "bg-teal-500"
                        : request.status === "APPROVED"
                        ? "bg-green-500"
                        : "bg-red-500"
                    } rounded-full p-2 mr-3`}
                  >
                    <svg
                      className="w-4 h-4 text-white"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-medium text-gray-900">
                      {request.status}
                    </div>
                    <div className="text-xs text-gray-500">
                      {request.fulfillmentDate &&
                        new Date(request.fulfillmentDate).toLocaleString()}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Status Update Modal */}
      {showStatusModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Update Request Status
            </h3>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                New Status: <span className="text-red-600">{newStatus}</span>
              </label>
              <textarea
                value={statusNotes}
                onChange={(e) => setStatusNotes(e.target.value)}
                rows={4}
                placeholder="Add notes about this status update..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowStatusModal(false);
                  setNewStatus("");
                  setStatusNotes("");
                }}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleStatusUpdate}
                disabled={actionLoading}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
              >
                {actionLoading ? "Updating..." : "Confirm"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
