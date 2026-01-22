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
  quantity?: number; // Quantity in units (1 unit = 450ml)
  lastUpdated?: string;
  bloodBank?: {
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
  const [quantity, setQuantity] = useState("");
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
    if (!quantity || parseInt(quantity) <= 0) {
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
          quantity: parseInt(quantity),
          bloodBankId: bloodBankId.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to update inventory");
      }

      // Success - show message and refresh inventory
      setSuccessMessage("Inventory updated successfully!");
      setQuantity("");
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
      <div className="mb-8">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-[#2E7D32] to-[#4CAF50] bg-clip-text text-transparent">
          Blood Inventory
        </h1>
        <p className="text-gray-600 mt-2">
          Manage blood donations and inventory levels
        </p>
      </div>

      {/* Add/Update Inventory Form */}
      <div className="bg-gradient-to-br from-green-50 to-white rounded-2xl shadow-lg p-8 mb-8 border-l-4 border-green-500">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          Add Blood Donation
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
          <div className="grid md:grid-cols-3 gap-4">
            {/* Blood Group Dropdown */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Blood Group
              </label>
              <select
                value={bloodGroup}
                onChange={(e) => setBloodGroup(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
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
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Quantity (units)
              </label>
              <input
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                placeholder="e.g., 2"
                min="1"
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                1 unit = 450 ml of blood
              </p>
            </div>

            {/* Blood Bank ID Input */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Blood Bank ID
              </label>
              <input
                type="text"
                value={bloodBankId}
                onChange={(e) => setBloodBankId(e.target.value)}
                placeholder="Enter blood bank UUID"
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
                required
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={submitting}
            className={`px-8 py-3 bg-gradient-to-r from-[#2E7D32] to-[#4CAF50] text-white rounded-lg font-semibold hover:from-[#1B5E20] hover:to-[#2E7D32] transition-all shadow-md hover:shadow-lg ${
              submitting ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            {submitting ? "Adding to inventory..." : "Add Blood Donation"}
          </button>
        </form>

        <div className="text-sm text-gray-600 mt-4 p-3 bg-blue-50 rounded-lg border-l-4 border-blue-400">
          <strong>Note:</strong> If the blood group already exists for this
          blood bank, the quantity will be added to the existing stock.
        </div>
      </div>

      {/* Inventory List */}
      <div className="bg-white rounded-2xl shadow-lg p-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            Current Inventory
          </h2>
          <button
            onClick={fetchInventory}
            className="px-5 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg font-medium hover:from-blue-600 hover:to-blue-700 transition-all shadow-md hover:shadow-lg"
          >
            Refresh
          </button>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="text-center py-12 text-gray-600">
            <p className="text-lg">Loading inventory...</p>
          </div>
        ) : inventory.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <p className="text-lg font-medium">No inventory data available</p>
            <p className="text-sm mt-2">Add blood donations to get started</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-gray-200 bg-gray-50">
                  <th className="text-left py-4 px-4 font-bold text-gray-700">
                    Blood Group
                  </th>
                  <th className="text-left py-4 px-4 font-bold text-gray-700">
                    Units
                  </th>
                  <th className="text-left py-4 px-4 font-bold text-gray-700">
                    Volume (ml)
                  </th>
                  <th className="text-left py-4 px-4 font-bold text-gray-700">
                    Blood Bank
                  </th>
                  <th className="text-left py-4 px-4 font-bold text-gray-700">
                    Location
                  </th>
                  <th className="text-left py-4 px-4 font-bold text-gray-700">
                    Last Updated
                  </th>
                </tr>
              </thead>
              <tbody>
                {inventory.map((item) => (
                  <tr
                    key={item.id}
                    className="border-b hover:bg-gray-50 transition-colors"
                  >
                    <td className="py-4 px-4">
                      <span className="font-bold text-red-600 text-lg px-3 py-1 bg-red-50 rounded-full inline-block">
                        {item.bloodGroup.replace("_", " ")}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <span className="font-semibold text-gray-800">
                        {item.quantity?.toLocaleString() || "0"} units
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <span className="text-gray-600">
                        {item.quantity
                          ? (item.quantity * 450).toLocaleString()
                          : 0}{" "}
                        ml
                      </span>
                    </td>
                    <td className="py-4 px-4 font-medium">
                      {item.bloodBank?.name || "N/A"}
                    </td>
                    <td className="py-4 px-4 text-gray-600">
                      {item.bloodBank?.city || "N/A"},{" "}
                      {item.bloodBank?.state || "N/A"}
                    </td>
                    <td className="py-3 px-4 text-gray-500">
                      {item.lastUpdated
                        ? new Date(item.lastUpdated).toLocaleString()
                        : "N/A"}
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
