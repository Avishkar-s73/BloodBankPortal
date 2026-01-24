/**
 * Hospital Dashboard - View and Manage Blood Requests
 * Shows hospital's blood requests, nearby blood banks, and inventory
 */

"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import Link from "next/link";
import { useRouter } from "next/navigation";
import CreateBloodRequestModal from "@/components/features/CreateBloodRequestModal";
import { 
  Building2, 
  ClipboardList, 
  Clock, 
  CheckCircle, 
  Package,
  MapPin,
  Phone,
  Mail
} from "lucide-react";

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
  createdAt: string;
  bloodBank: {
    name: string;
    city: string;
    phone: string;
  };
}

interface BloodBank {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  phone: string;
  email: string;
  operatingHours?: string;
  distance?: number;
}

interface InventoryItem {
  bloodGroup: string;
  quantity: number;
  bloodBankName: string;
  bloodBankId: string;
}

export default function HospitalDashboard() {
  const { user } = useAuth();
  const router = useRouter();
  const [myRequests, setMyRequests] = useState<BloodRequest[]>([]);
  const [nearbyBloodBanks, setNearbyBloodBanks] = useState<BloodBank[]>([]);
  const [inventoryData, setInventoryData] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState<"requests" | "inventory" | "bloodbanks">("requests");
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    fetchHospitalData();
  }, []);

  const fetchHospitalData = async () => {
    try {
      // Fetch hospital's requests
      const requestsRes = await fetch("/api/blood-requests?my=true");
      if (requestsRes.ok) {
        const data = await requestsRes.json();
        setMyRequests(data.data || []);
      }

      // Fetch nearby blood banks
      const banksRes = await fetch("/api/blood-banks");
      if (banksRes.ok) {
        const data = await banksRes.json();
        setNearbyBloodBanks(data.data || []);
      }

      // Fetch blood inventory
      const inventoryRes = await fetch("/api/blood-inventory");
      if (inventoryRes.ok) {
        const data = await inventoryRes.json();
        setInventoryData(data.data || []);
      }
    } catch (err) {
      setError("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "FULFILLED":
        return "bg-green-100 text-green-800 border-green-300";
      case "APPROVED":
        return "bg-blue-100 text-blue-800 border-blue-300";
      case "PENDING":
        return "bg-yellow-100 text-yellow-800 border-yellow-300";
      case "REJECTED":
        return "bg-red-100 text-red-800 border-red-300";
      case "CANCELLED":
        return "bg-gray-100 text-gray-800 border-gray-300";
      default:
        return "bg-gray-100 text-gray-800 border-gray-300";
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case "CRITICAL":
        return "text-red-600 font-bold";
      case "HIGH":
        return "text-orange-600 font-semibold";
      case "NORMAL":
        return "text-green-600";
      default:
        return "text-gray-600";
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading hospital dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2 flex items-center gap-3">
          <Building2 className="w-10 h-10 text-red-600" />
          Hospital Dashboard
        </h1>
        <p className="text-lg text-gray-600">
          Manage your blood requests and track inventory.
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
          {error}
        </div>
      )}

      {/* Quick Stats */}
      <div className="grid md:grid-cols-4 gap-6 mb-8">
        <div className="bg-gradient-to-br from-blue-50 to-white p-6 rounded-xl shadow-lg border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Requests</p>
              <p className="text-3xl font-bold text-gray-900">{myRequests.length}</p>
            </div>
            <ClipboardList className="w-10 h-10 text-blue-600" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-yellow-50 to-white p-6 rounded-xl shadow-lg border-l-4 border-yellow-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Pending</p>
              <p className="text-3xl font-bold text-gray-900">
                {myRequests.filter(r => r.status === "PENDING").length}
              </p>
            </div>
            <Clock className="w-10 h-10 text-yellow-600" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-white p-6 rounded-xl shadow-lg border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Fulfilled</p>
              <p className="text-3xl font-bold text-gray-900">
                {myRequests.filter(r => r.status === "FULFILLED").length}
              </p>
            </div>
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-white p-6 rounded-xl shadow-lg border-l-4 border-purple-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Blood Banks</p>
              <p className="text-3xl font-bold text-gray-900">{nearbyBloodBanks.length}</p>
            </div>
            <Building2 className="w-10 h-10 text-red-600" />
          </div>
        </div>
      </div>

      {/* (Removed View All Requests button for hospital users) */}

      {/* Tabs */}
      <div className="mb-6 border-b border-gray-200">
        <div className="flex gap-4">
          <button
            onClick={() => setActiveTab("requests")}
            className={`pb-4 px-4 font-semibold transition-colors ${
              activeTab === "requests"
                ? "border-b-2 border-red-600 text-red-600"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            📋 My Requests ({myRequests.length})
          </button>
          <button
            onClick={() => setActiveTab("inventory")}
            className={`pb-4 px-4 font-semibold transition-colors ${
              activeTab === "inventory"
                ? "border-b-2 border-red-600 text-red-600"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            📦 Blood Inventory
          </button>
          <button
            onClick={() => setActiveTab("bloodbanks")}
            className={`pb-4 px-4 font-semibold transition-colors ${
              activeTab === "bloodbanks"
                ? "border-b-2 border-red-600 text-red-600"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            🏦 Blood Banks ({nearbyBloodBanks.length})
          </button>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === "requests" && (
        <div>
          {myRequests.length === 0 ? (
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-12 text-center">
              <ClipboardList className="w-16 h-16 text-gray-400 mb-4 mx-auto" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No Blood Requests Yet
              </h3>
              <p className="text-gray-600 mb-6">
                Create your first blood request to get started.
              </p>
              <button
                onClick={() => setModalOpen(true)}
                className="inline-block bg-red-600 hover:bg-red-700 text-white font-semibold px-6 py-3 rounded-lg transition-colors"
              >
                Create Request
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto bg-white rounded-2xl shadow-lg p-4">
              <table className="w-full table-auto">
                <thead>
                  <tr className="text-left border-b">
                    <th className="py-3 px-4 text-sm font-semibold text-gray-700">ID</th>
                    <th className="py-3 px-4 text-sm font-semibold text-gray-700">Blood Group</th>
                    <th className="py-3 px-4 text-sm font-semibold text-gray-700">Quantity</th>
                    <th className="py-3 px-4 text-sm font-semibold text-gray-700">Urgency</th>
                    <th className="py-3 px-4 text-sm font-semibold text-gray-700">Status</th>
                    <th className="py-3 px-4 text-sm font-semibold text-gray-700">Blood Bank</th>
                    <th className="py-3 px-4 text-sm font-semibold text-gray-700">Required By</th>
                    <th className="py-3 px-4 text-sm font-semibold text-gray-700">Created</th>
                  </tr>
                </thead>
                <tbody>
                  {myRequests.map((request) => (
                    <tr key={request.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4 text-xs text-gray-500 font-mono">{request.id.substring(0,8)}...</td>
                      <td className="py-3 px-4 font-semibold text-red-600">{request.bloodGroup.replace("_", " ")}</td>
                      <td className="py-3 px-4">{request.quantityNeeded} Units</td>
                      <td className="py-3 px-4"><span className={`px-2 py-1 rounded-full text-xs font-semibold ${getUrgencyColor(request.urgency)}`}>{request.urgency}</span></td>
                      <td className="py-3 px-4"><span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(request.status)}`}>{request.status}</span></td>
                      <td className="py-3 px-4">{request.bloodBank?.name || "—"}</td>
                      <td className="py-3 px-4">{new Date(request.requiredBy).toLocaleDateString()}</td>
                      <td className="py-3 px-4 text-gray-600">{new Date(request.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {activeTab === "inventory" && (
        <div>
          {inventoryData.length === 0 ? (
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-12 text-center">
              <Package className="w-16 h-16 text-gray-400 mb-4 mx-auto" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No Inventory Data Available
              </h3>
              <p className="text-gray-600">
                Blood inventory information will appear here.
              </p>
            </div>
          ) : (
            <div className="grid md:grid-cols-3 gap-6">
              {inventoryData.map((item, index) => (
                <div
                  key={index}
                  className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 hover:shadow-xl transition-shadow"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="bg-red-100 text-red-800 px-4 py-2 rounded-lg font-bold text-lg">
                      {item.bloodGroup.replace("_", " ")}
                    </div>
                    <div className="text-right">
                      <p className="text-3xl font-bold text-gray-900">{item.quantity}</p>
                      <p className="text-xs text-gray-600">Units</p>
                    </div>
                  </div>
                  <p className="text-sm font-semibold text-gray-900">{item.bloodBankName}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === "bloodbanks" && (
        <div>
          {nearbyBloodBanks.length === 0 ? (
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-12 text-center">
              <Building2 className="w-16 h-16 text-gray-400 mb-4 mx-auto" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No Blood Banks Found
              </h3>
              <p className="text-gray-600">
                Blood banks information will appear here.
              </p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-6">
              {nearbyBloodBanks.map((bank) => (
                <div
                  key={bank.id}
                  className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 hover:shadow-xl transition-shadow"
                >
                  <h3 className="text-xl font-bold text-gray-900 mb-3 flex items-center gap-2">
                    <Building2 className="w-5 h-5 text-red-600" />
                    {bank.name}
                  </h3>
                  <div className="space-y-2 text-sm text-gray-600">
                    <p className="flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      {bank.address}
                    </p>
                    <p className="flex items-center gap-2">
                      <Building2 className="w-4 h-4" />
                      {bank.city}, {bank.state}
                    </p>
                    <p className="flex items-center gap-2">
                      <Phone className="w-4 h-4" />
                      {bank.phone}
                    </p>
                    <p className="flex items-center gap-2">
                      <Mail className="w-4 h-4" />
                      {bank.email}
                    </p>
                    {bank.operatingHours && (
                      <p>🕐 {bank.operatingHours}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <CreateBloodRequestModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSuccess={() => {
          setModalOpen(false);
          fetchHospitalData();
        }}
      />
    </div>
  );
}
