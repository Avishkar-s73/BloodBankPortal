import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Building2, Phone, Mail, MapPin, Package, ClipboardList } from "lucide-react";

export const revalidate = 10;

export default async function BloodBankDetailPage({ params }: { params: { id: string } }) {
  const { id } = params;

  const bank = await prisma.bloodBank.findUnique({
    where: { id },
    include: {
      _count: { select: { inventory: true, bloodRequests: true } },
      inventory: { orderBy: { bloodGroup: "asc" } },
      bloodRequests: { orderBy: { createdAt: "desc" }, take: 10 },
    },
  });

  if (!bank) return notFound();

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
          <Building2 className="w-8 h-8 text-red-600" />
          {bank.name}
        </h1>
        <p className="text-sm text-gray-600 mt-1">{bank.city}, {bank.state}</p>
        <div className="mt-3 text-sm text-gray-700 space-y-1">
          <p className="flex items-center gap-2">
            <Phone className="w-4 h-4" />
            {bank.phone || "Phone not available"}
          </p>
          <p className="flex items-center gap-2">
            <Mail className="w-4 h-4" />
            {bank.email || "—"}
          </p>
          <p className="flex items-center gap-2">
            <MapPin className="w-4 h-4" />
            {bank.address || "Address not available"}
          </p>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg p-4 shadow-sm border">
          <div className="flex items-center gap-2 mb-2">
            <Package className="w-5 h-5 text-blue-600" />
            <p className="text-xs text-gray-500">Inventory Items</p>
          </div>
          <p className="text-2xl font-bold">{bank._count.inventory}</p>
        </div>
        <div className="bg-white rounded-lg p-4 shadow-sm border">
          <div className="flex items-center gap-2 mb-2">
            <ClipboardList className="w-5 h-5 text-green-600" />
            <p className="text-xs text-gray-500">Open Requests</p>
          </div>
          <p className="text-2xl font-bold">{bank._count.bloodRequests}</p>
        </div>
        <div className="bg-white rounded-lg p-4 shadow-sm border">
          <p className="text-xs text-gray-500">24x7</p>
          <p className="text-2xl font-bold">{bank.is24x7 ? "Yes" : "No"}</p>
        </div>
      </div>

      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-3 flex items-center gap-2">
          <Package className="w-6 h-6 text-red-600" />
          Inventory
        </h2>
        {bank.inventory.length === 0 ? (
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 text-center text-sm text-gray-600">No inventory records found.</div>
        ) : (
          <div className="overflow-x-auto bg-white rounded-2xl shadow p-4">
            <table className="w-full table-auto">
              <thead>
                <tr className="text-left border-b">
                  <th className="py-2 px-3 text-sm text-gray-700">Blood Group</th>
                  <th className="py-2 px-3 text-sm text-gray-700">Quantity</th>
                  <th className="py-2 px-3 text-sm text-gray-700">Updated At</th>
                </tr>
              </thead>
              <tbody>
                {bank.inventory.map((item) => (
                  <tr key={item.id} className="border-b hover:bg-gray-50">
                    <td className="py-2 px-3">{item.bloodGroup.replace("_", " ")}</td>
                    <td className="py-2 px-3">{item.quantity}</td>
                    <td className="py-2 px-3 text-sm text-gray-600">{new Date(item.updatedAt).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-3 flex items-center gap-2">
          <ClipboardList className="w-6 h-6 text-red-600" />
          Recent Requests
        </h2>
        {bank.bloodRequests.length === 0 ? (
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 text-center text-sm text-gray-600">No recent requests.</div>
        ) : (
          <div className="overflow-x-auto bg-white rounded-2xl shadow p-4">
            <table className="w-full table-auto">
              <thead>
                <tr className="text-left border-b">
                  <th className="py-2 px-3 text-sm text-gray-700">ID</th>
                  <th className="py-2 px-3 text-sm text-gray-700">Blood Group</th>
                  <th className="py-2 px-3 text-sm text-gray-700">Qty</th>
                  <th className="py-2 px-3 text-sm text-gray-700">Status</th>
                  <th className="py-2 px-3 text-sm text-gray-700">Requested</th>
                </tr>
              </thead>
              <tbody>
                {bank.bloodRequests.map((r) => (
                  <tr key={r.id} className="border-b hover:bg-gray-50">
                    <td className="py-2 px-3 text-xs text-gray-500 font-mono">{r.id.substring(0,8)}...</td>
                    <td className="py-2 px-3">{r.bloodGroup.replace("_", " ")}</td>
                    <td className="py-2 px-3">{r.quantityNeeded}</td>
                    <td className="py-2 px-3">{r.status}</td>
                    <td className="py-2 px-3 text-sm text-gray-600">{new Date(r.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="mt-6">
        <Link href="/blood-banks" className="text-sm text-red-600 hover:underline">← Back to Blood Banks</Link>
      </div>
    </div>
  );
}
