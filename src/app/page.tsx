/**
 * Home Page - Landing page for BloodLink with modern Tailwind CSS
 */

import Link from "next/link";

export default function HomePage() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      {/* Hero Section */}
      <div className="text-center mb-16">
        <h1 className="text-6xl font-bold text-[#C62828] mb-6 flex items-center justify-center gap-4">
          <span className="text-7xl">🩸</span>
          Welcome to BloodLink
        </h1>
        <p className="text-2xl text-gray-700 mb-3 font-semibold">
          Blood Donation & Inventory Management System
        </p>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Efficiently manage blood inventory and requests to save lives through
          our professional healthcare platform
        </p>
      </div>

      {/* Feature Cards */}
      <div className="grid md:grid-cols-3 gap-8 mb-16">
        {/* Dashboard Card */}
        <Link
          href="/dashboard"
          className="group block p-8 bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 border-t-4 border-[#2196F3] hover:-translate-y-1"
        >
          <div className="text-5xl mb-6 transform group-hover:scale-110 transition-transform duration-300">
            📊
          </div>
          <h2 className="text-2xl font-bold mb-3 text-gray-900">Dashboard</h2>
          <p className="text-gray-600 leading-relaxed">
            View system overview, inventory status, and recent blood requests
            with real-time updates
          </p>
        </Link>

        {/* Inventory Card */}
        <Link
          href="/inventory"
          className="group block p-8 bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 border-t-4 border-[#2E7D32] hover:-translate-y-1"
        >
          <div className="text-5xl mb-6 transform group-hover:scale-110 transition-transform duration-300">
            🏥
          </div>
          <h2 className="text-2xl font-bold mb-3 text-gray-900">Inventory</h2>
          <p className="text-gray-600 leading-relaxed">
            Manage blood inventory, add new stock, and track availability across
            all blood types
          </p>
        </Link>

        {/* Blood Requests Card */}
        <Link
          href="/requests"
          className="group block p-8 bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 border-t-4 border-[#C62828] hover:-translate-y-1"
        >
          <div className="text-5xl mb-6 transform group-hover:scale-110 transition-transform duration-300">
            📝
          </div>
          <h2 className="text-2xl font-bold mb-3 text-gray-900">
            Blood Requests
          </h2>
          <p className="text-gray-600 leading-relaxed">
            Create and manage blood requests for patients in need with instant
            notifications
          </p>
        </Link>
      </div>

      {/* How It Works Section */}
      <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-10 shadow-inner">
        <h3 className="text-3xl font-bold mb-8 text-center text-gray-900">
          How It Works
        </h3>
        <div className="grid md:grid-cols-3 gap-10">
          <div className="text-center">
            <div className="w-16 h-16 bg-[#2E7D32] text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4 shadow-lg">
              1
            </div>
            <div className="font-bold text-xl mb-3 text-[#2E7D32]">
              Check Inventory
            </div>
            <p className="text-gray-600 leading-relaxed">
              View available blood units by blood group, location, and
              expiration dates
            </p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-[#2196F3] text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4 shadow-lg">
              2
            </div>
            <div className="font-bold text-xl mb-3 text-[#2196F3]">
              Create Request
            </div>
            <p className="text-gray-600 leading-relaxed">
              Submit blood requests for patients when needed with priority
              tracking
            </p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-[#C62828] text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4 shadow-lg">
              3
            </div>
            <div className="font-bold text-xl mb-3 text-[#C62828]">
              Track Status
            </div>
            <p className="text-gray-600 leading-relaxed">
              Monitor request status and inventory updates in real-time
              dashboard
            </p>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="mt-16 text-center">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-3 bg-[#C62828] hover:bg-[#B71C1C] text-white font-semibold px-8 py-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 text-lg"
        >
          <span>Get Started</span>
          <span className="text-2xl">→</span>
        </Link>
      </div>
    </div>
  );
}
