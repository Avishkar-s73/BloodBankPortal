/**
 * Dashboard Page - System Overview
 * Displays blood inventory summary and recent blood requests
 * Uses client-side data fetching to get real-time data from APIs
 */

"use client";

import { useEffect, useState } from "react";

// Type definitions for API responses
interface BloodInventory {
  id: string;
  bloodGroup: string;
  quantity: number; // Changed from quantityMl to quantity (units)
  bloodBank: {
    name: string;
    city: string;
  };
}

interface BloodRequest {
  id: string;
  bloodGroup: string;
  quantityNeeded: number; // Changed from quantityMl to quantityNeeded (units)
  urgency: string;
  status: string;
  createdAt: string;
  requester: {
    firstName: string;
    lastName: string;
  };
}

export default function DashboardPage() {
  // State management for inventory, requests, and loading states
  const [inventory, setInventory] = useState<BloodInventory[]>([]);
  const [requests, setRequests] = useState<BloodRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch data on component mount
  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Function to fetch both inventory and requests data
  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch inventory and requests in parallel for better performance
      const [inventoryRes, requestsRes] = await Promise.all([
        fetch("/api/blood-inventory"),
        fetch("/api/blood-requests?limit=5"),
      ]);

      if (!inventoryRes.ok || !requestsRes.ok) {
        throw new Error("Failed to fetch dashboard data");
      }

      const inventoryData = await inventoryRes.json();
      const requestsData = await requestsRes.json();

      setInventory(inventoryData.data || []);
      setRequests(requestsData.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  // Calculate total blood units across all blood groups
  const totalUnits = inventory.reduce(
    (sum, item) => sum + (item.quantity || 0),
    0
  );

  // Group inventory by blood group and sum quantities
  const inventoryByBloodGroup = inventory.reduce((acc, item) => {
    if (!acc[item.bloodGroup]) {
      acc[item.bloodGroup] = 0;
    }
    acc[item.bloodGroup] += item.quantity || 0;
    return acc;
  }, {} as Record<string, number>);

  // Loading state
  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="text-xl text-gray-600">Loading dashboard...</div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-xl text-red-600">Error: {error}</div>
        <button
          onClick={fetchDashboardData}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-[#C62828] to-[#E53935] bg-clip-text text-transparent">
          Dashboard
        </h1>
        <p className="text-gray-600 mt-2">
          Blood inventory and request management overview
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        {/* Total Blood Units Card */}
        <div className="bg-gradient-to-br from-red-50 to-white p-6 rounded-2xl shadow-lg border-l-4 border-red-500 hover:shadow-xl transition-all">
          <div className="text-gray-600 text-sm font-semibold uppercase mb-2">
            Total Blood Units
          </div>
          <div className="text-4xl font-bold text-red-600 mt-2">
            {totalUnits}
          </div>
          <div className="text-gray-500 text-sm mt-1">units available</div>
        </div>

        {/* Blood Groups Card */}
        <div className="bg-gradient-to-br from-blue-50 to-white p-6 rounded-2xl shadow-lg border-l-4 border-blue-500 hover:shadow-xl transition-all">
          <div className="text-gray-600 text-sm font-semibold uppercase mb-2">
            Blood Groups
          </div>
          <div className="text-4xl font-bold text-blue-600 mt-2">
            {Object.keys(inventoryByBloodGroup).length}
          </div>
          <div className="text-gray-500 text-sm mt-1">types available</div>
        </div>

        {/* Recent Requests Card */}
        <div className="bg-gradient-to-br from-green-50 to-white p-6 rounded-2xl shadow-lg border-l-4 border-green-500 hover:shadow-xl transition-all">
          <div className="text-gray-600 text-sm font-semibold uppercase mb-2">
            Active Requests
          </div>
          <div className="text-4xl font-bold text-green-600 mt-2">
            {requests.length}
          </div>
          <div className="text-gray-500 text-sm mt-1">pending requests</div>
        </div>
      </div>

      {/* Blood Inventory by Group */}
      <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          Blood Inventory by Group
        </h2>
        {Object.keys(inventoryByBloodGroup).length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500 text-lg">No inventory data available</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(inventoryByBloodGroup).map(([group, units]) => (
              <div
                key={group}
                className="border-2 border-gray-200 rounded-xl p-5 text-center hover:border-red-400 hover:shadow-md transition-all cursor-pointer"
              >
                <div className="text-3xl font-bold text-red-600 mb-1">
                  {group}
                </div>
                <div className="text-gray-600 font-medium">{units} units</div>
                <div className="text-xs text-gray-400 mt-1">Available</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recent Blood Requests */}
      <div className="bg-white rounded-2xl shadow-lg p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          Recent Blood Requests
        </h2>
        {requests.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500 text-lg">No pending requests</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-gray-200">
                  <th className="text-left py-3 px-4 font-bold text-gray-700">
                    Blood Group
                  </th>
                  <th className="text-left py-3 px-4 font-bold text-gray-700">
                    Quantity
                  </th>
                  <th className="text-left py-3 px-4 font-bold text-gray-700">
                    Urgency
                  </th>
                  <th className="text-left py-3 px-4 font-bold text-gray-700">
                    Status
                  </th>
                  <th className="text-left py-3 px-4 font-bold text-gray-700">
                    Patient
                  </th>
                  <th className="text-left py-3 px-4 font-bold text-gray-700">
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
                    <td className="py-3 px-4 font-semibold text-red-600">
                      {request.bloodGroup}
                    </td>
                    <td className="py-3 px-4">
                      {request.quantityNeeded} units
                    </td>
                    <td className="py-3 px-4">
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
                    <td className="py-3 px-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          request.status === "FULFILLED"
                            ? "bg-green-100 text-green-800"
                            : request.status === "APPROVED"
                            ? "bg-blue-100 text-blue-800"
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
