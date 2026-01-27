/**
 * Blood Bank Dashboard - Manage Inventory and Fulfill Requests
 * Shows inventory, incoming requests, and provides approval/fulfillment actions
 */

"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";

interface BloodRequest {
  id: string;
  bloodGroup: string;
  quantityNeeded: number;
  purpose: string;
  urgency: string;
  status: string;
  requiredBy: string;
  patientName: string;
  patientAge?: number;
  createdAt: string;
  requester: {
    firstName: string;
    lastName: string;
    email: string;
  };
  hospital?: {
    name: string;
    city: string;
    phone: string;
  };
}

interface InventoryItem {
  id: string;
  bloodGroup: string;
  quantity: number;
  lastUpdated: string;
}

export default function BloodBankDashboard() {
  const { user } = useAuth();
  const router = useRouter();
  const [incomingRequests, setIncomingRequests] = useState<BloodRequest[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [approvedCount, setApprovedCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState<"requests" | "inventory">(
    "requests"
  );
  const [processingRequestId, setProcessingRequestId] = useState<string | null>(
    null
  );

  useEffect(() => {
    if (user?.role !== "BLOOD_BANK" && user?.role !== "ADMIN") {
      router.push("/unauthorized");
      return;
    }
    fetchDashboardData();
  }, [user, router]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Fetch incoming blood requests (PENDING_APPROVAL, ESCALATED_TO_DONORS, and legacy PENDING)
      const requestsRes = await fetch("/api/blood-requests");
      if (requestsRes.ok) {
        const data = await requestsRes.json();
        const requests = Array.isArray(data.data)
          ? data.data
          : data.data?.requests || [];
        // Filter for PENDING_APPROVAL, ESCALATED_TO_DONORS, and legacy PENDING requests
        const pendingRequests = requests.filter(
          (r: BloodRequest) =>
            r.status === "PENDING_APPROVAL" ||
            r.status === "ESCALATED_TO_DONORS" ||
            r.status === "PENDING"
        );
        setIncomingRequests(pendingRequests);
        // Compute approved/fulfilled counts from all requests (not just incoming)
        const approved = requests.filter((r: BloodRequest) =>
          ["FULFILLED", "DONATION_CONFIRMED", "APPROVED"].includes(r.status)
        ).length;
        setApprovedCount(approved);
      }

      // Fetch blood inventory
      const inventoryRes = await fetch("/api/blood-inventory");
      if (inventoryRes.ok) {
        const data = await inventoryRes.json();
        setInventory(data.data || []);
      }
    } catch (err) {
      setError("Failed to load dashboard data");
      // eslint-disable-next-line no-console
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleApproveRequest = async (
    requestId: string,
    bloodGroup: string,
    quantity: number
  ) => {
    const confirmed = confirm(
      `Approve this request?\n\nBlood Group: ${bloodGroup}\nQuantity: ${quantity} units\n\nIf inventory is sufficient, the request will be fulfilled automatically.\nOtherwise, it will be escalated to donors.`
    );

    if (!confirmed) return;

    try {
      setProcessingRequestId(requestId);
      const response = await fetch(`/api/blood-requests/${requestId}/approve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      if (response.ok) {
        const data = await response.json();
        await fetchDashboardData();
        alert(data.message || "Request approved and fulfilled successfully!");
      } else {
        const data = await response.json();
        if (response.status === 400 && data.error?.includes("insufficient")) {
          // Insufficient inventory - offer to escalate
          const escalate = confirm(
            `${data.error}\n\nWould you like to escalate this request to donors?`
          );
          if (escalate) {
            await handleEscalateRequest(requestId);
          }
        } else {
          alert(data.error || "Failed to approve request");
        }
      }
    } catch (err) {
      alert("Error approving request");
      // eslint-disable-next-line no-console
      console.error(err);
    } finally {
      setProcessingRequestId(null);
    }
  };

  const handleEscalateRequest = async (requestId: string) => {
    try {
      setProcessingRequestId(requestId);
      const response = await fetch(
        `/api/blood-requests/${requestId}/escalate`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
        }
      );

      if (response.ok) {
        const data = await response.json();
        await fetchDashboardData();
        alert(data.message || "Request escalated to donors successfully!");
      } else {
        const data = await response.json();
        alert(data.error || "Failed to escalate request");
      }
    } catch (err) {
      alert("Error escalating request");
      // eslint-disable-next-line no-console
      console.error(err);
    } finally {
      setProcessingRequestId(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "FULFILLED":
        return "bg-green-100 text-green-800 border-green-300";
      case "PENDING_APPROVAL":
        return "bg-yellow-100 text-yellow-800 border-yellow-300";
      case "ESCALATED_TO_DONORS":
        return "bg-orange-100 text-orange-800 border-orange-300";
      case "APPROVED":
        return "bg-blue-100 text-blue-800 border-blue-300";
      case "PENDING":
        return "bg-yellow-100 text-yellow-800 border-yellow-300";
      case "REJECTED":
        return "bg-red-100 text-red-800 border-red-300";
      default:
        return "bg-gray-100 text-gray-800 border-gray-300";
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case "CRITICAL":
        return "text-red-600 font-bold";
      case "HIGH":
        return "text-orange-600 font-semibold";
      case "NORMAL":
        return "text-green-600";
      default:
        return "text-gray-600";
    }
  };

  const getTotalInventory = () => {
    return inventory.reduce((sum, item) => sum + item.quantity, 0);
  };

  const getPendingRequests = () => {
    return incomingRequests.filter(
      (r) => r.status === "PENDING" || r.status === "PENDING_APPROVAL"
    ).length;
  };

  const getApprovedRequests = () => {
    return approvedCount;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading blood bank dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">
          🏦 Blood Bank Dashboard
        </h1>
        <p className="text-lg text-gray-600">
          Manage inventory and fulfill blood requests.
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
          {error}
        </div>
      )}

      {/* Quick Stats */}
      <div className="grid md:grid-cols-4 gap-6 mb-8">
        <div className="bg-gradient-to-br from-red-50 to-white p-6 rounded-xl shadow-lg border-l-4 border-red-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Inventory</p>
              <p className="text-3xl font-bold text-gray-900">
                {getTotalInventory()} units
              </p>
            </div>
            <div className="text-4xl">🩸</div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-yellow-50 to-white p-6 rounded-xl shadow-lg border-l-4 border-yellow-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Pending Requests</p>
              <p className="text-3xl font-bold text-gray-900">
                {getPendingRequests()}
              </p>
            </div>
            <div className="text-4xl">⏳</div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-white p-6 rounded-xl shadow-lg border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Approved</p>
              <p className="text-3xl font-bold text-gray-900">
                {getApprovedRequests()}
              </p>
            </div>
            <div className="text-4xl">✓</div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-white p-6 rounded-xl shadow-lg border-l-4 border-purple-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Blood Groups</p>
              <p className="text-3xl font-bold text-gray-900">
                {inventory.length}
              </p>
            </div>
            <div className="text-4xl">📊</div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-6 border-b border-gray-200">
        <div className="flex gap-4">
          <button
            onClick={() => setActiveTab("requests")}
            className={`pb-4 px-4 font-semibold transition-colors ${
              activeTab === "requests"
                ? "border-b-2 border-red-600 text-red-600"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            📋 Incoming Requests ({incomingRequests.length})
          </button>
          <button
            onClick={() => setActiveTab("inventory")}
            className={`pb-4 px-4 font-semibold transition-colors ${
              activeTab === "inventory"
                ? "border-b-2 border-red-600 text-red-600"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            🩸 Blood Inventory ({inventory.length})
          </button>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === "requests" && (
        <div>
          {incomingRequests.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <p className="text-xl text-gray-600">📭 No incoming requests</p>
              <p className="text-sm text-gray-500 mt-2">
                All requests have been processed
              </p>
            </div>
          ) : (
            <div className="grid gap-6">
              {incomingRequests.map((request) => (
                <div
                  key={request.id}
                  className="bg-white border-2 border-gray-200 rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 mb-1">
                        Blood Group: {request.bloodGroup}
                      </h3>
                      <p className="text-gray-600">
                        Patient:{" "}
                        <span className="font-semibold">
                          {request.patientName}
                        </span>
                        {request.patientAge && `, Age: ${request.patientAge}`}
                      </p>
                    </div>
                    <div className="text-right">
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-sm font-semibold border ${getStatusColor(
                          request.status
                        )}`}
                      >
                        {request.status}
                      </span>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-sm text-gray-600">
                        <span className="font-semibold">Quantity:</span>{" "}
                        {request.quantityNeeded} units
                      </p>
                      <p className="text-sm text-gray-600">
                        <span className="font-semibold">Urgency:</span>{" "}
                        <span className={getUrgencyColor(request.urgency)}>
                          {request.urgency}
                        </span>
                      </p>
                      <p className="text-sm text-gray-600">
                        <span className="font-semibold">Required By:</span>{" "}
                        {new Date(request.requiredBy).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">
                        <span className="font-semibold">Requester:</span>{" "}
                        {request.requester.firstName}{" "}
                        {request.requester.lastName}
                      </p>
                      <p className="text-sm text-gray-600">
                        <span className="font-semibold">Email:</span>{" "}
                        {request.requester.email}
                      </p>
                      {request.hospital && (
                        <p className="text-sm text-gray-600">
                          <span className="font-semibold">Hospital:</span>{" "}
                          {request.hospital.name}, {request.hospital.city}
                        </p>
                      )}
                    </div>
                  </div>

                  {request.purpose && (
                    <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-700">
                        <span className="font-semibold">Purpose:</span>{" "}
                        {request.purpose}
                      </p>
                    </div>
                  )}

                  <div className="flex gap-3">
                    {(request.status === "PENDING_APPROVAL" ||
                      request.status === "PENDING") && (
                      <>
                        <button
                          onClick={() =>
                            handleApproveRequest(
                              request.id,
                              request.bloodGroup,
                              request.quantityNeeded
                            )
                          }
                          disabled={processingRequestId === request.id}
                          className="flex-1 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {processingRequestId === request.id
                            ? "Processing..."
                            : "✓ Approve & Fulfill"}
                        </button>
                        <button
                          onClick={() => handleEscalateRequest(request.id)}
                          disabled={processingRequestId === request.id}
                          className="flex-1 bg-orange-600 hover:bg-orange-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {processingRequestId === request.id
                            ? "Processing..."
                            : "⚠️ Escalate to Donors"}
                        </button>
                      </>
                    )}
                    {request.status === "ESCALATED_TO_DONORS" && (
                      <div className="flex-1 bg-orange-50 border border-orange-300 text-orange-800 px-6 py-3 rounded-lg font-semibold text-center">
                        🩸 Waiting for donor volunteers
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === "inventory" && (
        <div>
          {inventory.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <p className="text-xl text-gray-600">📦 No inventory data</p>
              <p className="text-sm text-gray-500 mt-2">
                Add blood units to get started
              </p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {inventory.map((item) => (
                <div
                  key={item.id}
                  className="bg-gradient-to-br from-white to-red-50 border-2 border-red-200 rounded-xl p-6 shadow-md hover:shadow-lg transition-all"
                >
                  <div className="text-center">
                    <div className="text-4xl mb-3">🩸</div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">
                      {item.bloodGroup}
                    </h3>
                    <p className="text-3xl font-bold text-red-600 mb-2">
                      {item.quantity}
                    </p>
                    <p className="text-sm text-gray-600">units available</p>
                    <p className="text-xs text-gray-500 mt-2">
                      Updated: {new Date(item.lastUpdated).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-blue-900 mb-2">
              💡 Inventory Management
            </h3>
            <p className="text-sm text-blue-800">
              When you fulfill a blood request, the inventory is automatically
              updated. The system will deduct the fulfilled quantity from your
              available stock.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
