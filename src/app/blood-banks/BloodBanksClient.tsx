"use client";

import { useState } from "react";
import Link from "next/link";
import CreateBloodRequestModal from "@/components/features/CreateBloodRequestModal";
import { Building2, MapPin, Phone, Mail, Eye, Plus } from "lucide-react";

interface BloodBank {
  id: string;
  name: string;
  address: string | null;
  city: string | null;
  state: string | null;
  phone: string | null;
  email: string | null;
  _count: {
    inventory: number;
    bloodRequests: number;
  };
}

interface BloodBanksClientProps {
  banks: BloodBank[];
}

export default function BloodBanksClient({ banks }: BloodBanksClientProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedBankId, setSelectedBankId] = useState<string>("");

  const handleCreateRequest = (bankId: string) => {
    setSelectedBankId(bankId);
    setModalOpen(true);
  };

  const handleModalClose = () => {
    setModalOpen(false);
    setSelectedBankId("");
  };

  const handleSuccess = () => {
    // Optionally refresh or show notification
    window.location.reload();
  };

  return (
    <>
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2 flex items-center gap-3">
            <Building2 className="w-10 h-10 text-red-600" />
            Blood Banks Network
          </h1>
          <p className="text-lg text-gray-600">Browse the registry of registered blood banks across the network.</p>
        </div>

        {banks.length === 0 ? (
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-12 text-center">
            <Building2 className="w-16 h-16 text-gray-400 mb-4 mx-auto" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Blood Banks Found</h3>
            <p className="text-gray-600">Try again later or add a new blood bank.</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {banks.map((bank) => (
              <div key={bank.id} className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 hover:shadow-xl transition-shadow">
                <h3 className="text-xl font-bold text-gray-900 mb-2 flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-red-600" />
                  {bank.name}
                </h3>
                <div className="text-sm text-gray-600 space-y-1 mb-4">
                  <p className="flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    {bank.address || "Address not available"}
                  </p>
                  <p className="flex items-center gap-2">
                    <Building2 className="w-4 h-4" />
                    {bank.city || "—"}, {bank.state || "—"}
                  </p>
                  <p className="flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    {bank.phone || "Phone not available"}
                  </p>
                  <p className="flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    {bank.email || "—"}
                  </p>
                </div>

                <div className="flex items-center justify-between text-sm text-gray-600">
                  <div className="space-y-1">
                    <p><strong className="text-gray-900">Inventory:</strong> {bank._count.inventory}</p>
                    <p><strong className="text-gray-900">Requests:</strong> {bank._count.bloodRequests}</p>
                  </div>

                  <div className="flex items-center gap-2">
                    <Link href={`/blood-banks/${bank.id}`} className="inline-flex items-center gap-1 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold px-3 py-2 rounded-md">
                      <Eye className="w-4 h-4" />
                      View
                    </Link>
                    <button
                      onClick={() => handleCreateRequest(bank.id)}
                      className="inline-flex items-center gap-1 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold px-3 py-2 rounded-md"
                    >
                      <Plus className="w-4 h-4" />
                      Create Request
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <CreateBloodRequestModal
        isOpen={modalOpen}
        onClose={handleModalClose}
        prefilledBloodBankId={selectedBankId}
        onSuccess={handleSuccess}
      />
    </>
  );
}
