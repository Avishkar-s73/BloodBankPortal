/**
 * Hospitals List Page
 *
 * Displays all registered hospitals in the system
 */

"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface Hospital {
  id: string;
  name: string;
  registrationNo: string;
  email: string;
  phone: string;
  alternatePhone?: string;
  emergencyPhone?: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  totalBeds?: number;
  hasBloodBank: boolean;
  isActive: boolean;
  isVerified: boolean;
  _count?: {
    bloodRequests: number;
  };
}

export default function HospitalsPage() {
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cityFilter, setCityFilter] = useState("");
  const [hasBloodBankFilter, setHasBloodBankFilter] = useState<string>("all");

  const fetchHospitals = async () => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        limit: "50",
        ...(cityFilter && { city: cityFilter }),
        ...(hasBloodBankFilter !== "all" && {
          hasBloodBank: hasBloodBankFilter,
        }),
      });

      const response = await fetch(`/api/hospitals?${params}`);
      const data = await response.json();

      if (data.success) {
        setHospitals(data.data);
      } else {
        setError(data.error || "Failed to fetch hospitals");
      }
    } catch (err) {
      setError("Failed to load hospitals");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHospitals();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cityFilter, hasBloodBankFilter]);

  const uniqueCities = Array.from(new Set(hospitals.map((h) => h.city))).sort();

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="bg-gradient-to-r from-green-600 to-teal-600 text-white rounded-2xl p-8 mb-8 shadow-xl">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-4xl font-bold mb-2">🏥 Hospital Network</h1>
              <p className="text-green-100 text-lg">
                Browse all registered hospitals in our blood donation network
              </p>
            </div>
            <div className="text-right">
              <div className="text-5xl font-bold">{hospitals.length}</div>
              <div className="text-green-100">Total Hospitals</div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Filters</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="cityFilter"
                className="block text-sm font-semibold text-gray-700 mb-2"
              >
                Filter by City
              </label>
              <select
                id="cityFilter"
                value={cityFilter}
                onChange={(e) => setCityFilter(e.target.value)}
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              >
                <option value="">All Cities</option>
                {uniqueCities.map((city) => (
                  <option key={city} value={city}>
                    {city}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="bloodBankFilter"
                className="block text-sm font-semibold text-gray-700 mb-2"
              >
                Has Blood Bank
              </label>
              <select
                id="bloodBankFilter"
                value={hasBloodBankFilter}
                onChange={(e) => setHasBloodBankFilter(e.target.value)}
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              >
                <option value="all">All Hospitals</option>
                <option value="true">With Blood Bank</option>
                <option value="false">Without Blood Bank</option>
              </select>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
            <span className="ml-3 text-gray-600 text-lg">
              Loading hospitals...
            </span>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border-2 border-red-200 rounded-xl p-6">
            <div className="flex items-center">
              <svg
                className="h-6 w-6 text-red-600 mr-3"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <div>
                <h3 className="text-red-800 font-semibold">Error</h3>
                <p className="text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Hospitals Grid */}
        {!loading && !error && (
          <>
            {hospitals.length === 0 ? (
              <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-8 text-center">
                <svg
                  className="h-16 w-16 text-yellow-600 mx-auto mb-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                  />
                </svg>
                <h3 className="text-xl font-bold text-yellow-900 mb-2">
                  No Hospitals Found
                </h3>
                <p className="text-yellow-700">
                  No hospitals match your current filters. Try adjusting the
                  filters or clearing them.
                </p>
              </div>
            ) : (
              <div className="grid lg:grid-cols-2 gap-6">
                {hospitals.map((hospital) => (
                  <div
                    key={hospital.id}
                    className="bg-white border-2 border-gray-200 rounded-xl p-6 hover:border-green-400 hover:shadow-xl transition-all duration-200"
                  >
                    {/* Hospital Header */}
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <h3 className="text-2xl font-bold text-gray-900 mb-2">
                          {hospital.name}
                        </h3>
                        <div className="flex flex-wrap gap-2 mb-3">
                          <span
                            className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                              hospital.hasBloodBank
                                ? "bg-red-100 text-red-800"
                                : "bg-gray-100 text-gray-800"
                            }`}
                          >
                            {hospital.hasBloodBank
                              ? "🩸 Has Blood Bank"
                              : "🏥 Hospital Only"}
                          </span>
                          {hospital.isVerified && (
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800">
                              ✓ Verified
                            </span>
                          )}
                          {hospital.totalBeds && (
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
                              🛏️ {hospital.totalBeds} Beds
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600">
                          Reg No: {hospital.registrationNo}
                        </p>
                      </div>
                    </div>

                    {/* Hospital Details */}
                    <div className="space-y-3 mb-4">
                      {/* Address */}
                      <div className="flex items-start">
                        <svg
                          className="h-5 w-5 text-gray-500 mr-3 mt-0.5 flex-shrink-0"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                        </svg>
                        <div className="text-sm">
                          <p className="text-gray-700 font-medium">
                            {hospital.address}
                          </p>
                          <p className="text-gray-600">
                            {hospital.city}, {hospital.state} -{" "}
                            {hospital.pincode}
                          </p>
                        </div>
                      </div>

                      {/* Phone */}
                      <div className="flex items-center">
                        <svg
                          className="h-5 w-5 text-gray-500 mr-3"
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
                        <a
                          href={`tel:${hospital.phone}`}
                          className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                        >
                          {hospital.phone}
                        </a>
                      </div>

                      {/* Emergency Phone */}
                      {hospital.emergencyPhone && (
                        <div className="flex items-center">
                          <svg
                            className="h-5 w-5 text-red-500 mr-3"
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
                          <a
                            href={`tel:${hospital.emergencyPhone}`}
                            className="text-sm text-red-600 hover:text-red-800 font-bold"
                          >
                            Emergency: {hospital.emergencyPhone}
                          </a>
                        </div>
                      )}

                      {/* Email */}
                      <div className="flex items-center">
                        <svg
                          className="h-5 w-5 text-gray-500 mr-3"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                          />
                        </svg>
                        <a
                          href={`mailto:${hospital.email}`}
                          className="text-sm text-blue-600 hover:text-blue-800"
                        >
                          {hospital.email}
                        </a>
                      </div>

                      {/* Blood Requests Count */}
                      {hospital._count && hospital._count.bloodRequests > 0 && (
                        <div className="flex items-center">
                          <svg
                            className="h-5 w-5 text-gray-500 mr-3"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                            />
                          </svg>
                          <span className="text-sm text-gray-700">
                            {hospital._count.bloodRequests} Blood Request
                            {hospital._count.bloodRequests !== 1 ? "s" : ""}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3 pt-4 border-t border-gray-200">
                      <a
                        href={`tel:${hospital.phone}`}
                        className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors text-center"
                      >
                        📞 Call
                      </a>
                      <a
                        href={`mailto:${hospital.email}`}
                        className="flex-1 bg-gray-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-gray-700 transition-colors text-center"
                      >
                        ✉️ Email
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* Quick Links */}
        <div className="mt-12 grid md:grid-cols-2 gap-6">
          <Link
            href="/emergency-blood-finder"
            className="block bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl p-6 hover:shadow-xl transition-all"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold mb-2">
                  🚨 Emergency Blood Finder
                </h3>
                <p className="text-red-100">
                  Find hospitals with available blood instantly
                </p>
              </div>
              <svg
                className="h-8 w-8"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </div>
          </Link>

          <Link
            href="/requests"
            className="block bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl p-6 hover:shadow-xl transition-all"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold mb-2">📋 Blood Requests</h3>
                <p className="text-blue-100">
                  View and manage all blood requests
                </p>
              </div>
              <svg
                className="h-8 w-8"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </div>
          </Link>
        </div>
      </main>
    </div>
  );
}
