/**
 * Inventory Page - Blood Inventory Management
 * Allows viewing and adding/updating blood inventory
 * Fetches inventory from API and provides form to add new stock
 */

"use client";

import { useEffect, useState } from "react";

// Type definition for blood inventory items
interface BloodInventory {
  id: string;
  bloodGroup: string;
  quantityMl: number;
  lastUpdated: string;
  bloodBank: {
    id: string;
    name: string;
    city: string;
    state: string;
  };
}

export default function InventoryPage() {
  // State management
  const [inventory, setInventory] = useState<BloodInventory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Form state
  const [bloodGroup, setBloodGroup] = useState("A_POSITIVE");
  const [quantityMl, setQuantityMl] = useState("");
  const [bloodBankId, setBloodBankId] = useState("");

  // Blood group options
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

  // Fetch inventory on component mount
  useEffect(() => {
    fetchInventory();
  }, []);

  // Function to fetch inventory from API
  const fetchInventory = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch("/api/blood-inventory");

      if (!response.ok) {
        throw new Error("Failed to fetch inventory");
      }

      const data = await response.json();
      setInventory(data.data || []);
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

    if (!bloodBankId.trim()) {
      setError("Please enter a blood bank ID");
      return;
    }

    try {
      setSubmitting(true);

      const response = await fetch("/api/blood-inventory", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          bloodGroup,
          quantityMl: parseInt(quantityMl),
          bloodBankId: bloodBankId.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to update inventory");
      }

      // Success - show message and refresh inventory
      setSuccessMessage("Inventory updated successfully!");
      setQuantityMl("");
      setBloodBankId("");

      // Refresh inventory list
      await fetchInventory();
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">🏥 Blood Inventory</h1>

      {/* Add/Update Inventory Form */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Add/Update Inventory</h2>

        {/* Success Message */}
        {successMessage && (
          <div className="mb-4 p-3 bg-green-100 text-green-800 rounded">
            {successMessage}
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-800 rounded">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid md:grid-cols-3 gap-4">
            {/* Blood Group Dropdown */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Blood Group
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

            {/* Quantity Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Quantity (ml)
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

            {/* Blood Bank ID Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Blood Bank ID
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
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={submitting}
            className={`px-6 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors ${
              submitting ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            {submitting ? "Submitting..." : "Add/Update Inventory"}
          </button>
        </form>

        <p className="text-sm text-gray-500 mt-4">
          💡 Tip: If the blood group already exists for this blood bank, the
          quantity will be added to the existing stock.
        </p>
      </div>

      {/* Inventory List */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Current Inventory</h2>
          <button
            onClick={fetchInventory}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
          >
            🔄 Refresh
          </button>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="text-center py-8 text-gray-600">
            Loading inventory...
          </div>
        ) : inventory.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No inventory data available. Add some stock to get started!
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-gray-200">
                  <th className="text-left py-3 px-4 font-semibold">
                    Blood Group
                  </th>
                  <th className="text-left py-3 px-4 font-semibold">
                    Quantity (ml)
                  </th>
                  <th className="text-left py-3 px-4 font-semibold">Units</th>
                  <th className="text-left py-3 px-4 font-semibold">
                    Blood Bank
                  </th>
                  <th className="text-left py-3 px-4 font-semibold">
                    Location
                  </th>
                  <th className="text-left py-3 px-4 font-semibold">
                    Last Updated
                  </th>
                </tr>
              </thead>
              <tbody>
                {inventory.map((item) => (
                  <tr key={item.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <span className="font-semibold text-red-600 text-lg">
                        {item.bloodGroup.replace("_", " ")}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      {item.quantityMl.toLocaleString()} ml
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-semibold">
                        {Math.floor(item.quantityMl / 450)} units
                      </span>
                    </td>
                    <td className="py-3 px-4">{item.bloodBank.name}</td>
                    <td className="py-3 px-4 text-gray-600">
                      {item.bloodBank.city}, {item.bloodBank.state}
                    </td>
                    <td className="py-3 px-4 text-gray-500">
                      {new Date(item.lastUpdated).toLocaleString()}
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
