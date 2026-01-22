/**
 * Emergency Blood Finder Page
 *
 * Helps find alternative hospitals and blood banks
 * when there's an urgent blood requirement
 */

"use client";

import { useState } from "react";
import AlternativeBloodSources from "@/components/features/AlternativeBloodSources";

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

export default function EmergencyBloodFinderPage() {
  const [selectedBloodGroup, setSelectedBloodGroup] = useState("");
  const [city, setCity] = useState("");
  const [minQuantity, setMinQuantity] = useState(1);
  const [showResults, setShowResults] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedBloodGroup) {
      setShowResults(true);
    }
  };

  const formatBloodGroup = (bg: string) => {
    return bg.replace("_", " ");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="bg-gradient-to-r from-red-600 to-red-700 text-white rounded-2xl p-8 mb-8 shadow-xl">
          <div className="flex items-center mb-4">
            <svg
              className="h-12 w-12 mr-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
            <div>
              <h1 className="text-4xl font-bold">Emergency Blood Finder</h1>
              <p className="text-red-100 text-lg mt-2">
                Find alternative hospitals and blood banks with available blood
              </p>
            </div>
          </div>
        </div>

        {/* Search Form */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Search for Blood Sources
          </h2>

          <form onSubmit={handleSearch} className="space-y-6">
            <div className="grid md:grid-cols-3 gap-6">
              {/* Blood Group Selection */}
              <div>
                <label
                  htmlFor="bloodGroup"
                  className="block text-sm font-semibold text-gray-700 mb-2"
                >
                  Blood Group Required <span className="text-red-600">*</span>
                </label>
                <select
                  id="bloodGroup"
                  value={selectedBloodGroup}
                  onChange={(e) => setSelectedBloodGroup(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
                  required
                >
                  <option value="">Select Blood Group</option>
                  {bloodGroups.map((bg) => (
                    <option key={bg} value={bg}>
                      {formatBloodGroup(bg)}
                    </option>
                  ))}
                </select>
              </div>

              {/* City Filter */}
              <div>
                <label
                  htmlFor="city"
                  className="block text-sm font-semibold text-gray-700 mb-2"
                >
                  City (Optional)
                </label>
                <input
                  type="text"
                  id="city"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="e.g., Mumbai, Delhi"
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Leave empty to search all cities
                </p>
              </div>

              {/* Minimum Quantity */}
              <div>
                <label
                  htmlFor="minQuantity"
                  className="block text-sm font-semibold text-gray-700 mb-2"
                >
                  Minimum Units Required
                </label>
                <input
                  type="number"
                  id="minQuantity"
                  value={minQuantity}
                  onChange={(e) =>
                    setMinQuantity(parseInt(e.target.value) || 1)
                  }
                  min="1"
                  max="100"
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
                />
                <p className="text-xs text-gray-500 mt-1">
                  1 unit = ~450ml blood
                </p>
              </div>
            </div>

            <div className="flex justify-center">
              <button
                type="submit"
                disabled={!selectedBloodGroup}
                className="bg-gradient-to-r from-red-600 to-red-700 text-white px-12 py-4 rounded-lg font-bold text-lg hover:from-red-700 hover:to-red-800 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                <div className="flex items-center">
                  <svg
                    className="h-6 w-6 mr-2"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                  Search Blood Sources
                </div>
              </button>
            </div>
          </form>
        </div>

        {/* Information Card */}
        {!showResults && (
          <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-6 mb-8">
            <div className="flex items-start">
              <svg
                className="h-6 w-6 text-blue-600 mr-3 mt-1 flex-shrink-0"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <div>
                <h3 className="text-lg font-bold text-blue-900 mb-2">
                  How It Works
                </h3>
                <ul className="space-y-2 text-blue-800">
                  <li className="flex items-start">
                    <span className="text-blue-600 mr-2">1.</span>
                    <span>
                      Select the required blood group from the dropdown
                    </span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-600 mr-2">2.</span>
                    <span>
                      Optionally filter by city to find nearby sources
                    </span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-600 mr-2">3.</span>
                    <span>Specify the minimum units of blood needed</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-600 mr-2">4.</span>
                    <span>
                      View up to 5 alternative hospitals and blood banks with
                      available blood
                    </span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-600 mr-2">5.</span>
                    <span>
                      Contact the sources directly using the provided contact
                      information
                    </span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Results */}
        {showResults && selectedBloodGroup && (
          <div>
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Search Results
              </h2>
              <p className="text-gray-600">
                Showing blood banks and hospitals with{" "}
                <span className="font-bold text-red-600">
                  {formatBloodGroup(selectedBloodGroup)}
                </span>{" "}
                blood type
                {city && (
                  <>
                    {" "}
                    in <span className="font-bold">{city}</span>
                  </>
                )}
              </p>
            </div>

            <AlternativeBloodSources
              bloodGroup={selectedBloodGroup}
              city={city || undefined}
              minQuantity={minQuantity}
              onSourceSelect={() => {
                // You can add additional functionality here
              }}
            />

            <div className="mt-8 text-center">
              <button
                onClick={() => setShowResults(false)}
                className="text-blue-600 hover:text-blue-800 font-semibold"
              >
                ← Back to Search
              </button>
            </div>
          </div>
        )}

        {/* Emergency Contact Info */}
        <div className="mt-12 bg-red-50 border-2 border-red-200 rounded-xl p-6">
          <div className="flex items-start">
            <svg
              className="h-6 w-6 text-red-600 mr-3 mt-1 flex-shrink-0"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
              />
            </svg>
            <div>
              <h3 className="text-lg font-bold text-red-900 mb-2">
                Emergency Helpline
              </h3>
              <p className="text-red-800 mb-3">
                For immediate assistance or life-threatening emergencies, please
                call:
              </p>
              <div className="space-y-2">
                <p className="text-2xl font-bold text-red-600">
                  📞 108 (Ambulance)
                </p>
                <p className="text-xl font-bold text-red-600">
                  📞 102 (Medical Emergency)
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
