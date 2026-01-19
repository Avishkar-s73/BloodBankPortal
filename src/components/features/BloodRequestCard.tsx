/**
 * BloodRequestCard - Display blood request information in a card format
 */

interface BloodRequestCardProps {
  request: {
    id: string;
    bloodGroup: string;
    quantityMl: number;
    urgency: string;
    status: string;
    reason?: string | null;
    createdAt: Date | string;
    requester?: {
      firstName: string;
      lastName: string;
    };
    bloodBank?: {
      name: string;
      city: string;
    };
  };
}

const urgencyColors = {
  NORMAL: "bg-blue-100 text-blue-800",
  URGENT: "bg-orange-100 text-orange-800",
  CRITICAL: "bg-red-100 text-red-800",
};

const statusColors = {
  PENDING: "bg-yellow-100 text-yellow-800",
  APPROVED: "bg-green-100 text-green-800",
  REJECTED: "bg-red-100 text-red-800",
  FULFILLED: "bg-blue-100 text-blue-800",
  CANCELLED: "bg-gray-100 text-gray-800",
};

export default function BloodRequestCard({ request }: BloodRequestCardProps) {
  return (
    <div className="border rounded-lg p-6 hover:shadow-lg transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <span className="text-2xl font-bold text-red-600">
              {request.bloodGroup}
            </span>
            <span
              className={`px-2 py-1 text-xs font-semibold rounded ${
                urgencyColors[request.urgency as keyof typeof urgencyColors] ||
                "bg-gray-100 text-gray-800"
              }`}
            >
              {request.urgency}
            </span>
          </div>
          <p className="text-sm text-gray-600">
            Quantity: {request.quantityMl} ml
          </p>
        </div>
        <span
          className={`px-3 py-1 text-xs font-semibold rounded ${
            statusColors[request.status as keyof typeof statusColors] ||
            "bg-gray-100 text-gray-800"
          }`}
        >
          {request.status}
        </span>
      </div>

      {request.reason && (
        <div className="mb-4">
          <p className="text-sm text-gray-700">
            <span className="font-medium">Reason:</span> {request.reason}
          </p>
        </div>
      )}

      <div className="space-y-2 text-sm">
        {request.requester && (
          <div className="text-gray-700">
            <span className="font-medium">Requester:</span>{" "}
            {request.requester.firstName} {request.requester.lastName}
          </div>
        )}
        {request.bloodBank && (
          <div className="text-gray-700">
            <span className="font-medium">Blood Bank:</span>{" "}
            {request.bloodBank.name}, {request.bloodBank.city}
          </div>
        )}
        <div className="text-gray-500">
          <span className="font-medium">Requested:</span>{" "}
          {new Date(request.createdAt).toLocaleDateString()}
        </div>
      </div>
    </div>
  );
}
