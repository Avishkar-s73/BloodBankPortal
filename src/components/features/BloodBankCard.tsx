/**
 * BloodBankCard - Display blood bank information in a card format
 */

interface BloodBankCardProps {
  bloodBank: {
    id: string;
    name: string;
    email: string;
    phoneNumber: string;
    city: string;
    state: string;
    is24x7: boolean;
    _count?: {
      inventory: number;
      bloodRequests: number;
    };
  };
}

export default function BloodBankCard({ bloodBank }: BloodBankCardProps) {
  return (
    <div className="border rounded-lg p-6 hover:shadow-lg transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-xl font-semibold text-gray-900">
            {bloodBank.name}
          </h3>
          <p className="text-sm text-gray-600">
            {bloodBank.city}, {bloodBank.state}
          </p>
        </div>
        {bloodBank.is24x7 && (
          <span className="px-3 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded-full">
            24x7
          </span>
        )}
      </div>

      <div className="space-y-2 text-sm">
        <div className="flex items-center text-gray-700">
          <span className="font-medium mr-2">📧</span>
          <a
            href={`mailto:${bloodBank.email}`}
            className="text-blue-600 hover:underline"
          >
            {bloodBank.email}
          </a>
        </div>
        <div className="flex items-center text-gray-700">
          <span className="font-medium mr-2">📞</span>
          <a
            href={`tel:${bloodBank.phoneNumber}`}
            className="text-blue-600 hover:underline"
          >
            {bloodBank.phoneNumber}
          </a>
        </div>
      </div>

      {bloodBank._count && (
        <div className="mt-4 pt-4 border-t flex justify-between text-sm">
          <div>
            <span className="text-gray-600">Inventory Items:</span>
            <span className="ml-2 font-semibold">
              {bloodBank._count.inventory}
            </span>
          </div>
          <div>
            <span className="text-gray-600">Requests:</span>
            <span className="ml-2 font-semibold">
              {bloodBank._count.bloodRequests}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
