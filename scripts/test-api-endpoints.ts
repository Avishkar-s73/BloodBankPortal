/**
 * API Endpoint Testing Script
 *
 * This script provides sample API calls to test all BloodLink backend endpoints.
 * Run this after starting the dev server to verify functionality.
 *
 * Usage:
 * 1. Start dev server: npm run dev
 * 2. Run this script: npx ts-node scripts/test-api-endpoints.ts
 *
 * Or use curl commands directly from terminal.
 */

// ========================================
// 1. USERS API TESTS
// ========================================

console.log("🧪 Testing Users API...\n");

// Test 1: Create a new donor user
const createDonor = {
  endpoint: "POST /api/users",
  description: "Create a new donor user",
  curl: `curl -X POST http://localhost:3000/api/users \\
  -H "Content-Type: application/json" \\
  -d '{
    "email": "donor1@test.com",
    "password": "test123",
    "firstName": "John",
    "lastName": "Donor",
    "phone": "9999888877",
    "role": "DONOR",
    "bloodGroup": "O_POSITIVE",
    "city": "Mumbai",
    "state": "Maharashtra"
  }'`,
};

// Test 2: Get all users
const getAllUsers = {
  endpoint: "GET /api/users",
  description: "Get all users with pagination",
  curl: "curl http://localhost:3000/api/users?page=1&limit=10",
};

// Test 3: Get donors by blood group
const getDonorsByBloodGroup = {
  endpoint: "GET /api/users",
  description: "Filter users by blood group",
  curl: 'curl "http://localhost:3000/api/users?role=DONOR&bloodGroup=O_POSITIVE"',
};

// ========================================
// 2. HOSPITALS API TESTS
// ========================================

console.log("🏥 Testing Hospitals API...\n");

// Test 4: Create a new hospital
const createHospital = {
  endpoint: "POST /api/hospitals",
  description: "Create a new hospital",
  curl: `curl -X POST http://localhost:3000/api/hospitals \\
  -H "Content-Type: application/json" \\
  -d '{
    "name": "City General Hospital",
    "registrationNo": "REG123456",
    "email": "contact@cityhospital.com",
    "phone": "02212345678",
    "address": "123 Health Street, Andheri",
    "city": "Mumbai",
    "state": "Maharashtra",
    "pincode": "400058",
    "totalBeds": 500,
    "hasBloodBank": true
  }'`,
};

// Test 5: Get all hospitals
const getAllHospitals = {
  endpoint: "GET /api/hospitals",
  description: "Get all hospitals with pagination",
  curl: "curl http://localhost:3000/api/hospitals?page=1&limit=10",
};

// Test 6: Get hospitals by city
const getHospitalsByCity = {
  endpoint: "GET /api/hospitals",
  description: "Filter hospitals by city",
  curl: 'curl "http://localhost:3000/api/hospitals?city=Mumbai&hasBloodBank=true"',
};

// ========================================
// 3. BLOOD INVENTORY API TESTS
// ========================================

console.log("🩸 Testing Blood Inventory API...\n");

// Test 7: Add blood inventory (requires blood bank ID from seed data)
const addBloodInventory = {
  endpoint: "POST /api/blood-inventory",
  description: "Add blood inventory to a blood bank",
  note: "⚠️ Replace <blood-bank-uuid> with actual blood bank ID from database",
  curl: `curl -X POST http://localhost:3000/api/blood-inventory \\
  -H "Content-Type: application/json" \\
  -d '{
    "bloodBankId": "<blood-bank-uuid>",
    "bloodGroup": "O_POSITIVE",
    "quantity": 50
  }'`,
};

// Test 8: Get all blood inventory
const getAllInventory = {
  endpoint: "GET /api/blood-inventory",
  description: "Get all blood inventory",
  curl: "curl http://localhost:3000/api/blood-inventory",
};

// Test 9: Get inventory by blood group
const getInventoryByBloodGroup = {
  endpoint: "GET /api/blood-inventory",
  description: "Filter inventory by blood group",
  curl: 'curl "http://localhost:3000/api/blood-inventory?bloodGroup=O_POSITIVE&minQuantity=10"',
};

// Test 10: Update existing inventory (upsert)
const updateInventory = {
  endpoint: "POST /api/blood-inventory",
  description: "Add more units to existing inventory",
  note: "⚠️ Replace <blood-bank-uuid> with actual blood bank ID",
  curl: `curl -X POST http://localhost:3000/api/blood-inventory \\
  -H "Content-Type: application/json" \\
  -d '{
    "bloodBankId": "<blood-bank-uuid>",
    "bloodGroup": "O_POSITIVE",
    "quantity": 25
  }'`,
};

// ========================================
// 4. BLOOD REQUESTS API TESTS (TRANSACTION LOGIC)
// ========================================

console.log("💉 Testing Blood Requests API (Transaction Logic)...\n");

// Test 11: Create blood request - Should fulfill if inventory exists
const createSuccessfulRequest = {
  endpoint: "POST /api/blood-requests",
  description: "Create blood request (will fulfill if inventory sufficient)",
  note: "⚠️ Replace UUIDs with actual IDs from database",
  curl: `curl -X POST http://localhost:3000/api/blood-requests \\
  -H "Content-Type: application/json" \\
  -d '{
    "requesterId": "<user-uuid>",
    "bloodBankId": "<blood-bank-uuid>",
    "bloodGroup": "O_POSITIVE",
    "quantityNeeded": 2,
    "patientName": "Emergency Patient",
    "patientAge": 45,
    "purpose": "Emergency surgery",
    "requiredBy": "2026-01-25T10:00:00Z",
    "urgency": "URGENT"
  }'`,
};

// Test 12: Create blood request with insufficient inventory
const createPendingRequest = {
  endpoint: "POST /api/blood-requests",
  description:
    "Create blood request (will be PENDING if insufficient inventory)",
  note: "⚠️ Replace UUIDs with actual IDs",
  curl: `curl -X POST http://localhost:3000/api/blood-requests \\
  -H "Content-Type: application/json" \\
  -d '{
    "requesterId": "<user-uuid>",
    "bloodBankId": "<blood-bank-uuid>",
    "bloodGroup": "AB_NEGATIVE",
    "quantityNeeded": 100,
    "patientName": "Test Patient",
    "patientAge": 30,
    "purpose": "Testing insufficient inventory",
    "requiredBy": "2026-01-22T10:00:00Z",
    "urgency": "NORMAL"
  }'`,
};

// Test 13: Get all blood requests
const getAllRequests = {
  endpoint: "GET /api/blood-requests",
  description: "Get all blood requests with pagination",
  curl: "curl http://localhost:3000/api/blood-requests?page=1&limit=10",
};

// Test 14: Get fulfilled requests
const getFulfilledRequests = {
  endpoint: "GET /api/blood-requests",
  description: "Filter requests by status",
  curl: 'curl "http://localhost:3000/api/blood-requests?status=FULFILLED"',
};

// Test 15: Get pending requests
const getPendingRequests = {
  endpoint: "GET /api/blood-requests",
  description: "Get pending requests",
  curl: 'curl "http://localhost:3000/api/blood-requests?status=PENDING"',
};

// ========================================
// TEST EXECUTION INSTRUCTIONS
// ========================================

console.log("\n📋 TESTING INSTRUCTIONS\n");
console.log("=".repeat(60));

const tests = [
  createDonor,
  getAllUsers,
  getDonorsByBloodGroup,
  createHospital,
  getAllHospitals,
  getHospitalsByCity,
  addBloodInventory,
  getAllInventory,
  getInventoryByBloodGroup,
  updateInventory,
  createSuccessfulRequest,
  createPendingRequest,
  getAllRequests,
  getFulfilledRequests,
  getPendingRequests,
];

tests.forEach((test, index) => {
  console.log(`\n${index + 1}. ${test.description}`);
  console.log(`   Endpoint: ${test.endpoint}`);
  if (test.note) {
    console.log(`   ${test.note}`);
  }
  console.log(`\n   ${test.curl}\n`);
  console.log("-".repeat(60));
});

console.log("\n🔧 SETUP STEPS:\n");
console.log("1. Ensure PostgreSQL is running");
console.log("2. Run: npx prisma migrate dev");
console.log("3. Run: npm run prisma:seed (to get UUIDs for testing)");
console.log("4. Start dev server: npm run dev");
console.log(
  "5. Get UUIDs from seed output or Prisma Studio: npx prisma studio"
);
console.log("6. Replace <blood-bank-uuid> and <user-uuid> in curl commands");
console.log("7. Run curl commands in order to test API functionality\n");

console.log("✅ EXPECTED BEHAVIOR:\n");
console.log("- POST /api/users: Should return 201 with user data");
console.log("- POST /api/hospitals: Should return 201 with hospital data");
console.log(
  "- POST /api/blood-inventory: Should return 201, upsert existing inventory"
);
console.log(
  "- POST /api/blood-requests (sufficient inventory): Should return 201, status=FULFILLED"
);
console.log(
  "- POST /api/blood-requests (insufficient): Should return 202, status=PENDING"
);
console.log("- GET endpoints: Should return 200 with paginated data\n");

console.log("🚨 TRANSACTION VERIFICATION:\n");
console.log("After creating a FULFILLED blood request:");
console.log(
  "1. Check inventory: curl http://localhost:3000/api/blood-inventory"
);
console.log("2. Verify quantity decreased by quantityNeeded");
console.log(
  "3. Check request status: curl http://localhost:3000/api/blood-requests"
);
console.log(
  "4. Verify request exists with status=FULFILLED and fulfilledAt timestamp\n"
);

console.log("=".repeat(60));
console.log(
  "\n💡 TIP: Use tools like Postman, Thunder Client, or HTTPie for easier testing\n"
);

// Export for potential programmatic testing
export const apiTests = tests;
