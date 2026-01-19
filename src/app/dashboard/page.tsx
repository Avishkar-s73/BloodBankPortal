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
  quantityMl: number;
  bloodBank: {
    name: string;
    city: string;
  };
}

interface BloodRequest {
  id: string;
  bloodGroup: string;
  quantityMl: number;
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
    (sum, item) => sum + Math.floor(item.quantityMl / 450),
    0
  );

  // Group inventory by blood group and sum quantities
  const inventoryByBloodGroup = inventory.reduce((acc, item) => {
    if (!acc[item.bloodGroup]) {
      acc[item.bloodGroup] = 0;
    }
    acc[item.bloodGroup] += Math.floor(item.quantityMl / 450);
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
      <h1 className="text-3xl font-bold mb-8">📊 Dashboard</h1>

      {/* Summary Cards */}
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        {/* Total Blood Units Card */}
        <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-red-500">
          <div className="text-gray-600 text-sm font-semibold uppercase">
            Total Blood Units
          </div>
          <div className="text-4xl font-bold text-red-600 mt-2">
            {totalUnits}
          </div>
          <div className="text-gray-500 text-sm mt-1">units available</div>
        </div>

        {/* Blood Groups Card */}
        <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-blue-500">
          <div className="text-gray-600 text-sm font-semibold uppercase">
            Blood Groups
          </div>
          <div className="text-4xl font-bold text-blue-600 mt-2">
            {Object.keys(inventoryByBloodGroup).length}
          </div>
          <div className="text-gray-500 text-sm mt-1">types in stock</div>
        </div>

        {/* Recent Requests Card */}
        <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-green-500">
          <div className="text-gray-600 text-sm font-semibold uppercase">
            Recent Requests
          </div>
          <div className="text-4xl font-bold text-green-600 mt-2">
            {requests.length}
          </div>
          <div className="text-gray-500 text-sm mt-1">in last batch</div>
        </div>
      </div>

      {/* Blood Inventory by Group */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Blood Inventory by Group</h2>
        {Object.keys(inventoryByBloodGroup).length === 0 ? (
          <p className="text-gray-500">No inventory data available</p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(inventoryByBloodGroup).map(([group, units]) => (
              <div
                key={group}
                className="border rounded-lg p-4 text-center hover:bg-gray-50"
              >
                <div className="text-2xl font-bold text-red-600">{group}</div>
                <div className="text-gray-600 mt-1">{units} units</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recent Blood Requests */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">Recent Blood Requests</h2>
        {requests.length === 0 ? (
          <p className="text-gray-500">No recent requests</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4">Blood Group</th>
                  <th className="text-left py-3 px-4">Quantity</th>
                  <th className="text-left py-3 px-4">Urgency</th>
                  <th className="text-left py-3 px-4">Status</th>
                  <th className="text-left py-3 px-4">Requester</th>
                  <th className="text-left py-3 px-4">Date</th>
                </tr>
              </thead>
              <tbody>
                {requests.map((request) => (
                  <tr key={request.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4 font-semibold text-red-600">
                      {request.bloodGroup}
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
