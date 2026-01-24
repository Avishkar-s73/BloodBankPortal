/**
 * Home Page - Landing page for BloodLink with modern Tailwind CSS
 */

"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import CreateBloodRequestModal from "@/components/features/CreateBloodRequestModal";
import { Droplet, ClipboardList, Building2, Plus, Package } from "lucide-react";

export default function HomePage() {
  const { user, loading } = useAuth();
  const [modalOpen, setModalOpen] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Show landing page for non-authenticated users
  if (!user) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-12">
        {/* Hero Section for Non-Authenticated Users */}
        <div className="text-center mb-16">
          <div className="flex justify-center mb-8">
            <div className="bg-gradient-to-br from-red-600 to-rose-600 text-white rounded-full p-6 shadow-2xl animate-pulse">
              <svg
                className="h-20 w-20"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                />
              </svg>
            </div>
          </div>
          <h1 className="text-6xl font-bold bg-gradient-to-r from-[#C62828] to-[#E53935] bg-clip-text text-transparent mb-6 flex items-center justify-center gap-3">
            Welcome to <Droplet className="w-12 h-12 text-red-600" /> BloodLink
          </h1>
          <p className="text-2xl text-gray-700 mb-3 font-semibold">
            Connecting Donors, Saving Lives
          </p>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-8">
            A professional platform to manage blood donations and inventory.
            Streamline your blood bank operations with real-time tracking and
            efficient request management.
          </p>

          {/* CTA Buttons */}
          <div className="flex gap-4 justify-center items-center mt-8">
            <Link
              href="/register"
              className="inline-flex items-center gap-3 bg-gradient-to-r from-[#C62828] to-[#E53935] hover:from-[#B71C1C] hover:to-[#C62828] text-white font-semibold px-10 py-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 text-lg"
            >
              <span>Get Started</span>
              <span className="text-2xl">→</span>
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center gap-3 bg-white border-2 border-red-600 text-red-600 hover:bg-red-50 font-semibold px-10 py-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 text-lg"
            >
              <span>Login</span>
            </Link>
          </div>
        </div>

        {/* Features Section */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <div className="bg-gradient-to-br from-red-50 to-white p-8 rounded-2xl shadow-lg text-center">
            <Droplet className="w-12 h-12 text-red-600 mb-4 mx-auto" />
            <h3 className="text-xl font-bold mb-3 text-gray-900">Blood Inventory</h3>
            <p className="text-gray-600">
              Real-time tracking of blood units across multiple blood banks and hospitals
            </p>
          </div>
          <div className="bg-gradient-to-br from-blue-50 to-white p-8 rounded-2xl shadow-lg text-center">
            <ClipboardList className="w-12 h-12 text-blue-600 mb-4 mx-auto" />
            <h3 className="text-xl font-bold mb-3 text-gray-900">Request Management</h3>
            <p className="text-gray-600">
              Efficient blood request processing with workflow compliance
            </p>
          </div>
          <div className="bg-gradient-to-br from-green-50 to-white p-8 rounded-2xl shadow-lg text-center">
            <Building2 className="w-12 h-12 text-green-600 mb-4 mx-auto" />
            <h3 className="text-xl font-bold mb-3 text-gray-900">Emergency Network</h3>
            <p className="text-gray-600">
              Find alternative hospitals and blood banks instantly during emergencies
            </p>
          </div>
        </div>

        {/* How It Works Section */}
        <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-10 shadow-inner">
          <h3 className="text-3xl font-bold mb-8 text-center text-gray-900">
            How It Works
          </h3>
          <div className="grid md:grid-cols-3 gap-10">
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-[#2E7D32] to-[#4CAF50] text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4 shadow-lg">
                1
              </div>
              <div className="font-bold text-xl mb-3 text-[#2E7D32]">
                Register Account
              </div>
              <p className="text-gray-600 leading-relaxed">
                Sign up as a Donor, Hospital, or Blood Bank to access the platform
              </p>
            </div>
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-[#2196F3] to-[#42A5F5] text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4 shadow-lg">
                2
              </div>
              <div className="font-bold text-xl mb-3 text-[#2196F3]">
                Manage Resources
              </div>
              <p className="text-gray-600 leading-relaxed">
                Track inventory, create requests, and manage blood donations efficiently
              </p>
            </div>
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-[#C62828] to-[#E53935] text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4 shadow-lg">
                3
              </div>
              <div className="font-bold text-xl mb-3 text-[#C62828]">
                Save Lives
              </div>
              <p className="text-gray-600 leading-relaxed">
                Connect with the network to fulfill blood needs and save lives together
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show dashboard view for authenticated users
  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      {/* Hero Section */}
      <div className="text-center mb-16">
        <h1 className="text-6xl font-bold bg-gradient-to-r from-[#C62828] to-[#E53935] bg-clip-text text-transparent mb-6">
          Welcome Back, {user.name.split(' ')[0]}! 👋
        </h1>
        <p className="text-2xl text-gray-700 mb-3 font-semibold">
          Ready to Make a Difference Today
        </p>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Access your tools to manage blood donations, track inventory, and fulfill requests.
        </p>
      </div>

      {/* Feature Cards */}
      <div className="grid md:grid-cols-4 gap-6 mb-16">
        {user.role === "DONOR" ? (
          <>
            {/* Donor Dashboard Card */}
            <Link
              href="/donor-dashboard"
              className="group block p-6 bg-gradient-to-br from-red-50 to-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 border-l-4 border-[#C62828] hover:-translate-y-1 md:col-span-2"
            >
              <h2 className="text-xl font-bold mb-3 text-gray-900 flex items-center gap-2">
                <Droplet className="w-6 h-6 text-red-600" />
                Donor Dashboard
              </h2>
              <p className="text-gray-600 leading-relaxed text-sm">
                View active blood requests and donate to save lives
              </p>
            </Link>

            {/* Hospitals Card */}
            <Link
              href="/hospitals"
              className="group block p-6 bg-gradient-to-br from-purple-50 to-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 border-l-4 border-[#7B1FA2] hover:-translate-y-1 md:col-span-2"
            >
              <h2 className="text-xl font-bold mb-3 text-gray-900">🏥 Hospitals</h2>
              <p className="text-gray-600 leading-relaxed text-sm">
                Browse registered hospitals and blood banks
              </p>
            </Link>
          </>
        ) : user.role === "HOSPITAL" ? (
          <>
            {/* Hospital Dashboard Card */}
            <Link
              href="/hospital-dashboard"
              className="group block p-6 bg-gradient-to-br from-blue-50 to-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 border-l-4 border-[#2196F3] hover:-translate-y-1 md:col-span-2"
            >
              <h2 className="text-xl font-bold mb-3 text-gray-900 flex items-center gap-2">
                <Building2 className="w-6 h-6 text-blue-600" />
                Hospital Dashboard
              </h2>
              <p className="text-gray-600 leading-relaxed text-sm">
                Manage blood requests and track inventory
              </p>
            </Link>

            {/* Blood Requests Card */}
            <button
              onClick={() => setModalOpen(true)}
              className="group block p-6 bg-gradient-to-br from-red-50 to-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 border-l-4 border-[#C62828] hover:-translate-y-1 md:col-span-2 w-full text-left"
            >
              <h2 className="text-xl font-bold mb-3 text-gray-900 flex items-center gap-2">
                <Plus className="w-6 h-6 text-red-600" />
                Create Request
              </h2>
              <p className="text-gray-600 leading-relaxed text-sm">
                Request blood for patients in need
              </p>
            </button>
          </>
        ) : user.role === "BLOOD_BANK" ? (
          <>
            {/* Blood Bank Dashboard Card */}
            <Link
              href="/blood-bank-dashboard"
              className="group block p-6 bg-gradient-to-br from-purple-50 to-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 border-l-4 border-[#7B1FA2] hover:-translate-y-1 md:col-span-2"
            >
              <h2 className="text-xl font-bold mb-3 text-gray-900 flex items-center gap-2">
                <Building2 className="w-6 h-6 text-purple-600" />
                Blood Bank Dashboard
              </h2>
              <p className="text-gray-600 leading-relaxed text-sm">
                Manage inventory and fulfill blood requests
              </p>
            </Link>

            {/* Blood Inventory Card */}
            <Link
              href="/inventory"
              className="group block p-6 bg-gradient-to-br from-green-50 to-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 border-l-4 border-[#2E7D32] hover:-translate-y-1 md:col-span-2"
            >
              <h2 className="text-xl font-bold mb-3 text-gray-900 flex items-center gap-2">
                <Package className="w-6 h-6 text-green-600" />
                Blood Inventory
              </h2>
              <p className="text-gray-600 leading-relaxed text-sm">
                View and manage blood bank inventory levels
              </p>
            </Link>
          </>
        ) : (
          <>
            {/* Dashboard Card */}
            <Link
              href="/dashboard"
              className="group block p-6 bg-gradient-to-br from-blue-50 to-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 border-l-4 border-[#2196F3] hover:-translate-y-1"
            >
              <h2 className="text-xl font-bold mb-3 text-gray-900">Dashboard</h2>
              <p className="text-gray-600 leading-relaxed text-sm">
                Monitor blood availability and track donations
              </p>
            </Link>

            {/* Inventory Card */}
            <Link
              href="/inventory"
              className="group block p-6 bg-gradient-to-br from-green-50 to-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 border-l-4 border-[#2E7D32] hover:-translate-y-1"
            >
              <h2 className="text-xl font-bold mb-3 text-gray-900">
                Blood Inventory
              </h2>
              <p className="text-gray-600 leading-relaxed text-sm">
                Manage blood units and track expiration dates
              </p>
            </Link>

            {/* Blood Requests Card */}
            <Link
              href="/requests"
              className="group block p-6 bg-gradient-to-br from-red-50 to-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 border-l-4 border-[#C62828] hover:-translate-y-1"
            >
              <h2 className="text-xl font-bold mb-3 text-gray-900">
                Blood Requests
              </h2>
              <p className="text-gray-600 leading-relaxed text-sm">
                Create and manage blood requests efficiently
              </p>
            </Link>

            {/* Hospitals Card */}
            <Link
              href="/hospitals"
              className="group block p-6 bg-gradient-to-br from-purple-50 to-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 border-l-4 border-[#7B1FA2] hover:-translate-y-1"
            >
              <h2 className="text-xl font-bold mb-3 text-gray-900 flex items-center gap-2">
                <Building2 className="w-6 h-6 text-purple-600" />
                Hospitals
              </h2>
              <p className="text-gray-600 leading-relaxed text-sm">
                Browse registered hospitals and blood banks
              </p>
            </Link>
          </>
        )}
      </div>

      {/* Emergency Feature Banner - Not shown to Donors or Blood Banks */}
      {user.role !== "DONOR" && user.role !== "BLOOD_BANK" && (
        <div className="mb-16">
          <Link
            href="/emergency-blood-finder"
            className="group block bg-gradient-to-r from-red-600 to-red-700 text-white rounded-2xl shadow-2xl hover:shadow-3xl transition-all duration-300 overflow-hidden hover:-translate-y-1"
          >
            <div className="p-8 flex items-center justify-between">
              <div className="flex items-center">
                <div className="bg-white/20 p-4 rounded-full mr-6">
                  <svg
                    className="h-12 w-12 text-white"
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
                </div>
                <div>
                  <h2 className="text-3xl font-bold mb-2">
                    🚨 Emergency Blood Finder
                  </h2>
                  <p className="text-red-100 text-lg">
                    Find alternative hospitals and blood banks with available
                    blood instantly
                  </p>
                </div>
              </div>
              <svg
                className="h-8 w-8 text-white group-hover:translate-x-2 transition-transform"
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
      )}

      {/* How It Works Section */}
      <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-10 shadow-inner">
        <h3 className="text-3xl font-bold mb-8 text-center text-gray-900">
          How It Works
        </h3>
        <div className="grid md:grid-cols-3 gap-10">
          <div className="text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-[#2E7D32] to-[#4CAF50] text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4 shadow-lg">
              1
            </div>
            <div className="font-bold text-xl mb-3 text-[#2E7D32]">
              Check Inventory
            </div>
            <p className="text-gray-600 leading-relaxed">
              View available blood units by blood group and location with
              real-time inventory tracking
            </p>
          </div>
          <div className="text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-[#2196F3] to-[#42A5F5] text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4 shadow-lg">
              2
            </div>
            <div className="font-bold text-xl mb-3 text-[#2196F3]">
              Create Request
            </div>
            <p className="text-gray-600 leading-relaxed">
              Submit blood requests with patient details and urgency level for
              efficient processing
            </p>
          </div>
          <div className="text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-[#C62828] to-[#E53935] text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4 shadow-lg">
              3
            </div>
            <div className="font-bold text-xl mb-3 text-[#C62828]">
              Track Status
            </div>
            <p className="text-gray-600 leading-relaxed">
              Monitor request fulfillment and inventory updates through your
              centralized dashboard
            </p>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="mt-16 text-center bg-gradient-to-r from-red-50 to-pink-50 rounded-2xl p-12">
        <h3 className="text-3xl font-bold mb-4 text-gray-900">
          Ready to Get Started?
        </h3>
        <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
          Access your dashboard to manage blood inventory and requests
          efficiently.
        </p>
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-3 bg-gradient-to-r from-[#C62828] to-[#E53935] hover:from-[#B71C1C] hover:to-[#C62828] text-white font-semibold px-10 py-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 text-lg"
        >
          <span>Get Started</span>
          <span className="text-2xl">→</span>
        </Link>
      </div>

      <CreateBloodRequestModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSuccess={() => {
          setModalOpen(false);
        }}
      />
    </div>
  );
}
