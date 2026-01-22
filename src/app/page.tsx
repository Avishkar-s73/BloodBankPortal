/**
 * Home Page - Landing page for BloodLink with modern Tailwind CSS
 */

import Link from "next/link";

export default function HomePage() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      {/* Hero Section */}
      <div className="text-center mb-16">
        <h1 className="text-6xl font-bold bg-gradient-to-r from-[#C62828] to-[#E53935] bg-clip-text text-transparent mb-6">
          Welcome to BloodLink
        </h1>
        <p className="text-2xl text-gray-700 mb-3 font-semibold">
          Connecting Donors, Saving Lives
        </p>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          A professional platform to manage blood donations and inventory.
          Streamline your blood bank operations with real-time tracking and
          efficient request management.
        </p>
      </div>

      {/* Feature Cards */}
      <div className="grid md:grid-cols-4 gap-6 mb-16">
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

        {/* Hospitals Card - NEW */}
        <Link
          href="/hospitals"
          className="group block p-6 bg-gradient-to-br from-purple-50 to-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 border-l-4 border-[#7B1FA2] hover:-translate-y-1"
        >
          <h2 className="text-xl font-bold mb-3 text-gray-900">🏥 Hospitals</h2>
          <p className="text-gray-600 leading-relaxed text-sm">
            Browse registered hospitals and blood banks
          </p>
        </Link>
      </div>

      {/* Emergency Feature Banner */}
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
    </div>
  );
}
