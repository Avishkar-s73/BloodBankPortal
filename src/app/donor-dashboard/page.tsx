/**
 * Donor Dashboard - Complete Donor Experience
 * - Active blood requests matching donor's blood group
 * - Donation history with stats
 * - Eligibility checker
 * - Profile statistics and badges
 */

"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import Link from "next/link";

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
  patientGender?: string;
  createdAt: string;
  bloodBank: {
    id: string;
    name: string;
    address: string;
    city: string;
    state: string;
    phone: string;
  };
  hospital?: {
    id: string;
    name: string;
    address: string;
    city: string;
    phone: string;
  };
  requester: string | null;
}

interface DonationIntent {
  id: string;
  scheduledDate: string;
  bloodGroup: string;
  status: string;
  bloodBank: {
    name: string;
    address: string;
    city: string;
    phone: string;
    operatingHours?: string;
  };
}

interface DonationHistory {
  id: string;
  donationDate: string;
  bloodGroup: string;
  quantity: number;
  status: string;
  bloodBank: {
    name: string;
    city: string;
  };
}

interface DonorStats {
  totalDonations: number;
  nextEligibleDate: string | null;
  isEligible: boolean;
  daysSinceLastDonation: number | null;
  lifetimeUnits: number;
}

export default function DonorDashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<"requests" | "history" | "stats">(
    "requests"
  );
  const [activeRequests, setActiveRequests] = useState<BloodRequest[]>([]);
  const [scheduledDonations, setScheduledDonations] = useState<
    DonationIntent[]
  >([]);
  const [donationHistory, setDonationHistory] = useState<DonationHistory[]>([]);
  const [donorStats, setDonorStats] = useState<DonorStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedRequest, setSelectedRequest] = useState<BloodRequest | null>(
    null
  );
  const [showDonationModal, setShowDonationModal] = useState(false);

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        fetchActiveRequests(),
        fetchScheduledDonations(),
        fetchDonationHistory(),
        fetchDonorStats(),
      ]);
    } catch (err) {
      setError("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  const fetchActiveRequests = async () => {
    try {
      const response = await fetch("/api/donors/active-requests");
      if (response.ok) {
        const data = await response.json();
        setActiveRequests(data.data.requests);
      }
    } catch (err) {
      console.error("Failed to load active requests");
    }
  };

  const fetchScheduledDonations = async () => {
    try {
      const response = await fetch("/api/donors/donation-intent");
      if (response.ok) {
        const data = await response.json();
        setScheduledDonations(data.data.donations);
      }
    } catch (err) {
      console.error("Failed to load scheduled donations");
    }
  };

  const fetchDonationHistory = async () => {
    try {
      const response = await fetch("/api/donations?my=true&status=COMPLETED");
      if (response.ok) {
        const data = await response.json();
        setDonationHistory(data.data || []);
      }
    } catch (err) {
      console.error("Failed to load donation history");
    }
  };

  const fetchDonorStats = async () => {
    try {
      const response = await fetch("/api/donors/stats");
      if (response.ok) {
        const data = await response.json();
        setDonorStats(data.data);
      }
    } catch (err) {
      console.error("Failed to load donor stats");
    }
  };

  const handleDonateClick = (request: BloodRequest) => {
    setSelectedRequest(request);
    setShowDonationModal(true);
  };

  const confirmDonation = async () => {
    if (!selectedRequest) return;

    try {
      const response = await fetch("/api/donors/donation-intent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bloodBankId: selectedRequest.bloodBank.id,
          requestId: selectedRequest.id,
          notes: `Responding to request for ${selectedRequest.patientName}`,
        }),
      });

      if (response.ok) {
        const data = await response.json();

        // Show detailed success message with contact info
        alert(
          `✅ ${data.message}\n\n` +
            `📍 Blood Bank: ${selectedRequest.bloodBank.name}\n` +
            `📞 Contact: ${selectedRequest.bloodBank.phone}\n` +
            `📧 Address: ${selectedRequest.bloodBank.address}, ${selectedRequest.bloodBank.city}\n\n` +
            "⏰ Next Steps:\n" +
            "1. The blood bank will contact you within 24 hours\n" +
            "2. They will schedule your donation appointment\n" +
            "3. Please arrive 15 minutes early\n" +
            "4. Bring a valid ID and eat well before donation\n\n" +
            "💡 You can also call them directly at the number above to schedule!"
        );

        setShowDonationModal(false);
        fetchScheduledDonations();
        fetchActiveRequests();
      } else {
        const error = await response.json();
        alert("❌ " + (error.error || "Failed to schedule donation"));
      }
    } catch (err) {
      alert("❌ Failed to schedule donation. Please try again.");
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case "CRITICAL":
        return "bg-red-100 text-red-800 border-red-300";
      case "HIGH":
        return "bg-orange-100 text-orange-800 border-orange-300";
      case "NORMAL":
        return "bg-green-100 text-green-800 border-green-300";
      default:
        return "bg-gray-100 text-gray-800 border-gray-300";
    }
  };

  const getBadge = (totalDonations: number) => {
    if (totalDonations >= 50)
      return { icon: "🏆", name: "Legend", color: "text-yellow-600" };
    if (totalDonations >= 25)
      return { icon: "💎", name: "Hero", color: "text-blue-600" };
    if (totalDonations >= 10)
      return { icon: "⭐", name: "Champion", color: "text-purple-600" };
    if (totalDonations >= 5)
      return { icon: "🎖️", name: "Warrior", color: "text-green-600" };
    if (totalDonations >= 1)
      return { icon: "🩸", name: "Lifesaver", color: "text-red-600" };
    return { icon: "🌱", name: "Beginner", color: "text-gray-600" };
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading donor dashboard...</p>
        </div>
      </div>
    );
  }

  const badge = donorStats ? getBadge(donorStats.totalDonations) : null;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header with Stats */}
      <div className="mb-8">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              🩸 Donor Dashboard
            </h1>
            <p className="text-lg text-gray-600">
              Welcome back,{" "}
              <span className="font-semibold text-red-600">
                {user?.name.split(" ")[0]}
              </span>
              !
            </p>
          </div>
          {badge && (
            <div className="text-center">
              <div className="text-5xl mb-2">{badge.icon}</div>
              <div className={`text-sm font-bold ${badge.color}`}>
                {badge.name}
              </div>
            </div>
          )}
        </div>

        {/* Quick Stats Cards */}
        <div className="grid md:grid-cols-4 gap-4 mb-6">
          <div className="bg-gradient-to-br from-red-50 to-white p-4 rounded-xl shadow-md border-l-4 border-red-500">
            <div className="text-xs text-gray-600 mb-1">Blood Group</div>
            <div className="text-2xl font-bold text-red-600">
              {user?.bloodGroup?.replace("_", " ") || "Not Set"}
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-50 to-white p-4 rounded-xl shadow-md border-l-4 border-blue-500">
            <div className="text-xs text-gray-600 mb-1">Total Donations</div>
            <div className="text-2xl font-bold text-blue-600">
              {donorStats?.totalDonations || 0}
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {donorStats?.lifetimeUnits || 0} units saved
            </div>
          </div>

          <div
            className={`bg-gradient-to-br ${
              donorStats?.isEligible ? "from-green-50" : "from-yellow-50"
            } to-white p-4 rounded-xl shadow-md border-l-4 ${
              donorStats?.isEligible ? "border-green-500" : "border-yellow-500"
            }`}
          >
            <div className="text-xs text-gray-600 mb-1">Eligibility</div>
            <div
              className={`text-lg font-bold ${
                donorStats?.isEligible ? "text-green-600" : "text-yellow-600"
              }`}
            >
              {donorStats?.isEligible ? "✅ Eligible" : "⏳ Not Yet"}
            </div>
            {donorStats?.nextEligibleDate && !donorStats.isEligible && (
              <div className="text-xs text-gray-500 mt-1">
                {new Date(donorStats.nextEligibleDate).toLocaleDateString()}
              </div>
            )}
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-white p-4 rounded-xl shadow-md border-l-4 border-purple-500">
            <div className="text-xs text-gray-600 mb-1">Scheduled</div>
            <div className="text-2xl font-bold text-purple-600">
              {scheduledDonations.length}
            </div>
            <div className="text-xs text-gray-500 mt-1">upcoming</div>
          </div>
        </div>

        {/* Eligibility Alert */}
        {donorStats && !donorStats.isEligible && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <div className="flex items-start gap-3">
              <div className="text-2xl">⏰</div>
              <div>
                <p className="font-semibold text-yellow-900 mb-1">
                  You{"'"}re not eligible to donate yet
                </p>
                <p className="text-sm text-yellow-800">
                  You can donate again on{" "}
                  <strong>
                    {donorStats.nextEligibleDate &&
                      new Date(
                        donorStats.nextEligibleDate
                      ).toLocaleDateString()}
                  </strong>
                  . Donors must wait 90 days between donations for safety.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
          {error}
        </div>
      )}

      {/* Tabs */}
      <div className="mb-6 border-b border-gray-200">
        <div className="flex gap-6">
          <button
            onClick={() => setActiveTab("requests")}
            className={`pb-3 px-2 font-semibold transition-colors relative ${
              activeTab === "requests"
                ? "text-red-600 border-b-2 border-red-600"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            🔴 Active Requests
            {activeRequests.length > 0 && (
              <span className="ml-2 bg-red-100 text-red-600 text-xs px-2 py-1 rounded-full">
                {activeRequests.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab("history")}
            className={`pb-3 px-2 font-semibold transition-colors ${
              activeTab === "history"
                ? "text-red-600 border-b-2 border-red-600"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            📜 Donation History
          </button>
          <button
            onClick={() => setActiveTab("stats")}
            className={`pb-3 px-2 font-semibold transition-colors ${
              activeTab === "stats"
                ? "text-red-600 border-b-2 border-red-600"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            📊 My Stats
          </button>
        </div>
      </div>

      {/* Scheduled Donations Section */}
      {scheduledDonations.length > 0 && (
        <div className="mb-8 bg-green-50 border border-green-200 rounded-xl p-6">
          <h2 className="text-2xl font-bold text-green-900 mb-4 flex items-center gap-2">
            ✅ Your Scheduled Donations
          </h2>
          <div className="space-y-3">
            {scheduledDonations.map((donation) => (
              <div
                key={donation.id}
                className="bg-white rounded-lg p-4 shadow-sm border border-green-200"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-semibold text-gray-900">
                      {donation.bloodBank.name}
                    </p>
                    <p className="text-sm text-gray-600">
                      {donation.bloodBank.address}
                    </p>
                    <p className="text-sm text-gray-600">
                      📞 {donation.bloodBank.phone}
                    </p>
                    {donation.bloodBank.operatingHours && (
                      <p className="text-sm text-gray-600">
                        🕐 {donation.bloodBank.operatingHours}
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-green-700">
                      {new Date(donation.scheduledDate).toLocaleDateString()}
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(donation.scheduledDate).toLocaleTimeString()}
                    </p>
                    <span className="inline-block mt-2 px-3 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                      {donation.status}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab Content */}
      {activeTab === "requests" && (
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            🔴 Active Blood Requests Near You
          </h2>

          {activeRequests.length === 0 ? (
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-12 text-center">
              <div className="text-6xl mb-4">🎉</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No Active Requests
              </h3>
              <p className="text-gray-600">
                There are currently no pending blood requests matching your
                blood group in your area.
              </p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-6">
              {activeRequests.map((request) => (
                <div
                  key={request.id}
                  className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden hover:shadow-xl transition-shadow"
                >
                  {/* Urgency Banner */}
                  <div
                    className={`px-4 py-2 ${getUrgencyColor(
                      request.urgency
                    )} border-b`}
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-sm">
                        🚨 {request.urgency} URGENCY
                      </span>
                      <span className="text-xs">
                        Needed by:{" "}
                        {new Date(request.requiredBy).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  <div className="p-6">
                    {/* Patient Info */}
                    <div className="mb-4">
                      <h3 className="text-xl font-bold text-gray-900 mb-2">
                        Patient: {request.patientName}
                      </h3>
                      <div className="flex gap-4 text-sm text-gray-600">
                        {request.patientAge && (
                          <span>Age: {request.patientAge}</span>
                        )}
                        {request.patientGender && (
                          <span>Gender: {request.patientGender}</span>
                        )}
                      </div>
                    </div>

                    {/* Blood Details */}
                    <div className="mb-4 flex items-center gap-4">
                      <div className="bg-red-100 text-red-800 px-4 py-2 rounded-lg font-bold text-lg">
                        {request.bloodGroup.replace("_", " ")}
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-gray-900">
                          {request.quantityNeeded} Units
                        </p>
                        <p className="text-sm text-gray-600">Required</p>
                      </div>
                    </div>

                    {/* Purpose */}
                    <div className="mb-4">
                      <p className="text-sm font-semibold text-gray-700">
                        Purpose:
                      </p>
                      <p className="text-gray-900">{request.purpose}</p>
                    </div>

                    {/* Location */}
                    <div className="mb-4 bg-gray-50 rounded-lg p-3">
                      <p className="font-semibold text-gray-900 mb-1">
                        🏥 {request.bloodBank.name}
                      </p>
                      <p className="text-sm text-gray-600">
                        {request.bloodBank.address}
                      </p>
                      <p className="text-sm text-gray-600">
                        📍 {request.bloodBank.city}, {request.bloodBank.state}
                      </p>
                      <p className="text-sm text-gray-600">
                        📞 {request.bloodBank.phone}
                      </p>
                    </div>

                    {/* Action Button */}
                    <button
                      onClick={() => handleDonateClick(request)}
                      disabled={!donorStats?.isEligible}
                      className={`w-full font-semibold py-3 px-6 rounded-lg transition-all transform ${
                        donorStats?.isEligible
                          ? "bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white hover:scale-[1.02] shadow-lg"
                          : "bg-gray-300 text-gray-500 cursor-not-allowed"
                      }`}
                    >
                      {donorStats?.isEligible
                        ? "🩸 I Want to Donate"
                        : "⏳ Not Eligible Yet"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === "history" && (
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            📜 Donation History
          </h2>

          {donationHistory.length === 0 ? (
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-12 text-center">
              <div className="text-6xl mb-4">🩸</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No Donations Yet
              </h3>
              <p className="text-gray-600 mb-6">
                Start your lifesaving journey by responding to blood requests
                above!
              </p>
              <button
                onClick={() => setActiveTab("requests")}
                className="bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white font-semibold py-3 px-6 rounded-lg transition-all"
              >
                View Active Requests
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {donationHistory.map((donation, index) => (
                <div
                  key={donation.id}
                  className="bg-white rounded-xl shadow-md border border-gray-200 p-6 hover:shadow-lg transition-shadow"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="text-3xl">
                        {index === 0
                          ? "🏆"
                          : index === 1
                          ? "🥈"
                          : index === 2
                          ? "🥉"
                          : "🩸"}
                      </div>
                      <div>
                        <p className="font-semibold text-lg text-gray-900">
                          Donation #{donationHistory.length - index}
                        </p>
                        <p className="text-sm text-gray-600">
                          {new Date(donation.donationDate).toLocaleDateString()}{" "}
                          at {donation.bloodBank.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {donation.bloodBank.city}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="bg-red-100 text-red-800 px-4 py-2 rounded-lg font-bold">
                        {donation.bloodGroup.replace("_", " ")}
                      </div>
                      <p className="text-sm text-gray-600 mt-2">
                        {donation.quantity}{" "}
                        {donation.quantity === 1 ? "unit" : "units"}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === "stats" && (
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            📊 Your Impact
          </h2>

          <div className="grid md:grid-cols-2 gap-6 mb-8">
            {/* Lives Saved Card */}
            <div className="bg-gradient-to-br from-red-500 to-rose-600 text-white rounded-2xl p-8 shadow-xl">
              <div className="text-6xl mb-4">❤️</div>
              <h3 className="text-3xl font-bold mb-2">
                {(donorStats?.totalDonations || 0) * 3}
              </h3>
              <p className="text-red-100 text-lg">Potential lives saved</p>
              <p className="text-red-200 text-sm mt-2">
                Each donation can save up to 3 lives!
              </p>
            </div>

            {/* Lifetime Contribution */}
            <div className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white rounded-2xl p-8 shadow-xl">
              <div className="text-6xl mb-4">💉</div>
              <h3 className="text-3xl font-bold mb-2">
                {donorStats?.lifetimeUnits || 0} Units
              </h3>
              <p className="text-blue-100 text-lg">Total blood donated</p>
              <p className="text-blue-200 text-sm mt-2">
                That{"'"}s {(donorStats?.lifetimeUnits || 0) * 450} ml of life!
              </p>
            </div>
          </div>

          {/* Achievement Badges */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 mb-8">
            <h3 className="text-xl font-bold text-gray-900 mb-6">
              🏆 Your Badges
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
              {[
                { count: 1, icon: "🩸", name: "Lifesaver", color: "red" },
                { count: 5, icon: "🎖️", name: "Warrior", color: "green" },
                { count: 10, icon: "⭐", name: "Champion", color: "purple" },
                { count: 25, icon: "💎", name: "Hero", color: "blue" },
                { count: 50, icon: "🏆", name: "Legend", color: "yellow" },
              ].map((badge) => {
                const unlocked =
                  (donorStats?.totalDonations || 0) >= badge.count;
                return (
                  <div
                    key={badge.name}
                    className={`text-center p-4 rounded-xl border-2 transition-all ${
                      unlocked
                        ? "bg-gradient-to-br from-yellow-50 to-white border-yellow-300 shadow-md"
                        : "bg-gray-50 border-gray-200 opacity-50"
                    }`}
                  >
                    <div
                      className={`text-4xl mb-2 ${
                        unlocked ? "animate-bounce" : "grayscale"
                      }`}
                    >
                      {badge.icon}
                    </div>
                    <p
                      className={`text-xs font-bold ${
                        unlocked ? `text-${badge.color}-600` : "text-gray-500"
                      }`}
                    >
                      {badge.name}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {badge.count}{" "}
                      {badge.count === 1 ? "donation" : "donations"}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Eligibility Info */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              📅 Donation Eligibility
            </h3>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="text-2xl">
                  {donorStats?.isEligible ? "✅" : "⏰"}
                </div>
                <div>
                  <p className="font-semibold text-gray-900">
                    {donorStats?.isEligible
                      ? "You're eligible to donate!"
                      : "Not eligible yet"}
                  </p>
                  <p className="text-sm text-gray-600">
                    {donorStats?.daysSinceLastDonation !== null
                      ? `It's been ${donorStats.daysSinceLastDonation} days since your last donation.`
                      : "You haven't donated yet."}
                  </p>
                  {donorStats?.nextEligibleDate && !donorStats.isEligible && (
                    <p className="text-sm text-gray-600 mt-1">
                      You can donate again on:{" "}
                      <strong>
                        {new Date(
                          donorStats.nextEligibleDate
                        ).toLocaleDateString()}
                      </strong>
                    </p>
                  )}
                </div>
              </div>

              <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                <p className="text-sm text-blue-900 font-semibold mb-2">
                  💡 Did you know?
                </p>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• You must wait 90 days (3 months) between donations</li>
                  <li>• Men can donate up to 4 times per year</li>
                  <li>• Women can donate up to 3 times per year</li>
                  <li>
                    • Your body replenishes donated blood within 24-48 hours
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Donation Confirmation Modal */}
      {showDonationModal && selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto">
            <h3 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              🩸 Confirm Donation Intent
            </h3>

            <div className="mb-6 space-y-4">
              {/* Patient Details */}
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-sm font-semibold text-red-900 mb-2">
                  Patient Information
                </p>
                <p className="text-gray-700">
                  <strong>Name:</strong> {selectedRequest.patientName}
                </p>
                <p className="text-gray-700">
                  <strong>Blood Group Needed:</strong>{" "}
                  {selectedRequest.bloodGroup.replace("_", " ")}
                </p>
                <p className="text-gray-700">
                  <strong>Units Required:</strong>{" "}
                  {selectedRequest.quantityNeeded}
                </p>
                <p className="text-gray-700">
                  <strong>Urgency:</strong>{" "}
                  <span
                    className={`font-bold ${
                      selectedRequest.urgency === "CRITICAL"
                        ? "text-red-600"
                        : selectedRequest.urgency === "HIGH"
                        ? "text-orange-600"
                        : "text-green-600"
                    }`}
                  >
                    {selectedRequest.urgency}
                  </span>
                </p>
              </div>

              {/* Blood Bank Contact Info */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm font-semibold text-blue-900 mb-2">
                  📍 Blood Bank Details
                </p>
                <p className="text-gray-800 font-semibold">
                  {selectedRequest.bloodBank.name}
                </p>
                <p className="text-gray-700 text-sm mt-1">
                  📍 {selectedRequest.bloodBank.address}
                </p>
                <p className="text-gray-700 text-sm">
                  {selectedRequest.bloodBank.city},{" "}
                  {selectedRequest.bloodBank.state}
                </p>
                <p className="text-gray-800 font-semibold mt-2 flex items-center gap-2">
                  📞{" "}
                  <a
                    href={`tel:${selectedRequest.bloodBank.phone}`}
                    className="text-blue-600 hover:underline"
                  >
                    {selectedRequest.bloodBank.phone}
                  </a>
                </p>
              </div>

              {/* Next Steps */}
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-sm font-semibold text-green-900 mb-2">
                  ✅ What Happens Next?
                </p>
                <ol className="text-sm text-gray-700 space-y-1 list-decimal list-inside">
                  <li>Your donation intent will be recorded</li>
                  <li>Blood bank will contact you within 24 hours</li>
                  <li>They{"'"}ll schedule your donation appointment</li>
                  <li>You can also call them directly at the number above</li>
                </ol>
              </div>

              {/* Important Information */}
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-sm font-semibold text-yellow-900 mb-2">
                  ⚠️ Before You Donate
                </p>
                <ul className="text-sm text-gray-700 space-y-1">
                  <li>• Bring a valid government ID</li>
                  <li>• Eat a healthy meal 2-3 hours before</li>
                  <li>• Drink plenty of water</li>
                  <li>• Get adequate sleep the night before</li>
                  <li>• Arrive 15 minutes early for paperwork</li>
                </ul>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowDonationModal(false)}
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-3 px-4 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmDonation}
                className="flex-1 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white font-semibold py-3 px-4 rounded-lg transition-all shadow-lg"
              >
                Confirm Donation
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
