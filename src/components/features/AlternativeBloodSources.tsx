/**
 * Alternative Blood Sources Component
 *
 * Displays a list of alternative hospitals and blood banks
 * that have the required blood type available
 */

"use client";

import { useState, useEffect } from "react";

interface BloodSource {
  id: string;
  name: string;
  type: "blood_bank" | "hospital";
  email: string;
  phone: string;
  alternatePhone?: string;
  emergencyPhone?: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  availableUnits?: number;
  bloodGroup: string;
  operatingHours?: string;
  totalBeds?: number;
  hasBloodBank?: boolean;
  lastUpdated?: string;
}

interface AlternativeBloodSourcesProps {
  bloodGroup: string;
  city?: string;
  minQuantity?: number;
  onSourceSelect?: (source: BloodSource) => void;
}

export default function AlternativeBloodSources({
  bloodGroup,
  city,
  minQuantity = 1,
  onSourceSelect,
}: AlternativeBloodSourcesProps) {
  const [sources, setSources] = useState<BloodSource[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [contactingId, setContactingId] = useState<string | null>(null);

  const fetchAlternativeSources = async () => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        bloodGroup,
        ...(city && { city }),
        minQuantity: minQuantity.toString(),
        limit: "5",
      });

      const response = await fetch(
        `/api/hospitals/alternative-blood-sources?${params}`
      );
      const data = await response.json();

      if (data.success) {
        setSources(data.data);
      } else {
        setError(data.error || "Failed to fetch alternative sources");
      }
    } catch (err) {
      setError("Failed to load alternative blood sources");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (bloodGroup) {
      fetchAlternativeSources();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bloodGroup, city, minQuantity]);

  const formatBloodGroup = (bg: string) => {
    return bg.replace("_", " ");
  };

  if (loading) {
    return (
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-blue-700">
            Searching for alternative blood sources...
          </span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <div className="flex items-start">
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
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
          <div>
            <h3 className="text-red-800 font-semibold">Error</h3>
            <p className="text-red-700 mt-1">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (sources.length === 0) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
        <div className="flex items-start">
          <svg
            className="h-6 w-6 text-yellow-600 mr-3"
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
            <h3 className="text-yellow-800 font-semibold">
              No Alternative Sources Found
            </h3>
            <p className="text-yellow-700 mt-1">
              Currently, there are no alternative hospitals or blood banks with{" "}
              {formatBloodGroup(bloodGroup)} blood type available
              {city && ` in ${city}`}.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center">
          <svg
            className="h-6 w-6 text-blue-600 mr-3"
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
          <div>
            <h3 className="text-lg font-bold text-blue-900">
              Alternative Blood Sources Found
            </h3>
            <p className="text-blue-700 text-sm">
              {sources.length} {sources.length === 1 ? "source" : "sources"}{" "}
              with {formatBloodGroup(bloodGroup)} blood type available
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-4">
        {sources.map((source, index) => (
          <div
            key={source.id}
            className="bg-white border-2 border-gray-200 rounded-lg p-6 hover:border-blue-400 hover:shadow-lg transition-all duration-200"
          >
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white font-bold text-sm">
                    {index + 1}
                  </span>
                  <h4 className="text-xl font-bold text-gray-900">
                    {source.name}
                  </h4>
                </div>
                <div className="flex items-center gap-2 mb-3">
                  <span
                    className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                      source.type === "blood_bank"
                        ? "bg-red-100 text-red-800"
                        : "bg-green-100 text-green-800"
                    }`}
                  >
                    {source.type === "blood_bank"
                      ? "🩸 Blood Bank"
                      : "🏥 Hospital"}
                  </span>
                  {source.availableUnits && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
                      {source.availableUnits} units available
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <div>
                <div className="flex items-start mb-2">
                  <svg
                    className="h-5 w-5 text-gray-500 mr-2 mt-0.5"
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
                  <div>
                    <p className="text-gray-700">{source.address}</p>
                    <p className="text-gray-600">
                      {source.city}, {source.state} - {source.pincode}
                    </p>
                  </div>
                </div>

                {source.operatingHours && (
                  <div className="flex items-center text-gray-700 mb-2">
                    <svg
                      className="h-5 w-5 text-gray-500 mr-2"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <span>{source.operatingHours}</span>
                  </div>
                )}
              </div>

              <div>
                <div className="flex items-center text-gray-700 mb-2">
                  <svg
                    className="h-5 w-5 text-gray-500 mr-2"
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
                    href={`tel:${source.phone}`}
                    className="text-blue-600 hover:text-blue-800 font-medium"
                  >
                    {source.phone}
                  </a>
                </div>

                {source.emergencyPhone && (
                  <div className="flex items-center text-gray-700 mb-2">
                    <svg
                      className="h-5 w-5 text-red-500 mr-2"
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
                      href={`tel:${source.emergencyPhone}`}
                      className="text-red-600 hover:text-red-800 font-medium"
                    >
                      Emergency: {source.emergencyPhone}
                    </a>
                  </div>
                )}

                <div className="flex items-center text-gray-700 mb-2">
                  <svg
                    className="h-5 w-5 text-gray-500 mr-2"
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
                    href={`mailto:${source.email}`}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    {source.email}
                  </a>
                </div>
              </div>
            </div>

            {onSourceSelect && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <button
                  onClick={() => {
                    setContactingId(source.id);
                    onSourceSelect(source);
                    setTimeout(() => setContactingId(null), 3000);
                  }}
                  disabled={contactingId === source.id}
                  className={`w-full px-6 py-3 rounded-lg font-semibold transition-all duration-200 shadow-md hover:shadow-lg flex items-center justify-center gap-2 ${
                    contactingId === source.id
                      ? 'bg-green-600 text-white cursor-default'
                      : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700'
                  }`}
                >
                  {contactingId === source.id ? (
                    <>
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Contact Initiated!
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                      Contact This Source
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
