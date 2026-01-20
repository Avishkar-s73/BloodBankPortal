# Quick Start API Testing Guide

## 🚀 Getting Started

Server is running at: **http://localhost:3000**

All APIs return JSON responses in this format:
```json
{
  "success": true,
  "message": "Optional message",
  "data": { /* response data */ }
}
```

---

## 🔐 1. Authentication Flow

### Step 1: Register a New User

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "testuser@example.com",
    "password": "Test1234",
    "firstName": "Test",
    "lastName": "User",
    "phone": "9999999999",
    "bloodGroup": "O+",
    "role": "DONOR",
    "city": "Mumbai",
    "state": "Maharashtra"
  }'
```

**Response:**
```json
{
  "success": true,
  "message": "Registration successful! Please login.",
  "data": {
    "id": "uuid-here",
    "email": "testuser@example.com",
    "firstName": "Test",
    "lastName": "User",
    "role": "DONOR",
    "bloodGroup": "O+"
  }
}
```

### Step 2: Login

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "testuser@example.com",
    "password": "Test1234"
  }'
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": { /* user details */ },
    "token": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

**Save the token!** Use it in subsequent requests:
```bash
-H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Step 3: Verify Token

```bash
curl http://localhost:3000/api/auth/verify \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

## 🩸 2. Blood Inventory Management

### Get All Inventory

```bash
# Get all inventory
curl "http://localhost:3000/api/blood-inventory"

# Filter by blood group
curl "http://localhost:3000/api/blood-inventory?bloodGroup=O%2B"

# With pagination
curl "http://localhost:3000/api/blood-inventory?page=1&limit=10"
```

### Get Specific Inventory

```bash
curl "http://localhost:3000/api/blood-inventory/INVENTORY_ID"
```

### Create/Update Inventory

```bash
curl -X POST http://localhost:3000/api/blood-inventory \
  -H "Content-Type: application/json" \
  -d '{
    "bloodBankId": "blood-bank-uuid",
    "bloodGroup": "A+",
    "quantity": 50,
    "expiryDate": "2024-12-31"
  }'
```

### Update Inventory Quantity

```bash
curl -X PUT http://localhost:3000/api/blood-inventory/INVENTORY_ID \
  -H "Content-Type: application/json" \
  -d '{
    "quantity": 75
  }'
```

---

## 📋 3. Blood Requests

### Create Blood Request (Auto-fulfill if stock available)

```bash
curl -X POST http://localhost:3000/api/blood-requests \
  -H "Content-Type: application/json" \
  -d '{
    "requesterId": "user-uuid",
    "hospitalId": "hospital-uuid",
    "bloodBankId": "blood-bank-uuid",
    "bloodGroup": "O+",
    "quantityNeeded": 2,
    "urgency": "HIGH",
    "requiredBy": "2024-01-20T10:00:00Z",
    "reason": "Emergency surgery"
  }'
```

**Note:** If inventory has sufficient stock, status will automatically be set to FULFILLED and inventory will be decremented!

### List Blood Requests

```bash
# All requests
curl "http://localhost:3000/api/blood-requests"

# Filter by status
curl "http://localhost:3000/api/blood-requests?status=PENDING"

# Filter by urgency
curl "http://localhost:3000/api/blood-requests?urgency=CRITICAL"

# Filter by blood group
curl "http://localhost:3000/api/blood-requests?bloodGroup=AB-"
```

### Update Blood Request

```bash
curl -X PUT http://localhost:3000/api/blood-requests/REQUEST_ID \
  -H "Content-Type: application/json" \
  -d '{
    "status": "APPROVED",
    "urgency": "CRITICAL"
  }'
```

---

## 💉 4. Donations

### Schedule a Donation

```bash
curl -X POST http://localhost:3000/api/donations \
  -H "Content-Type: application/json" \
  -d '{
    "donorId": "donor-user-uuid",
    "bloodBankId": "blood-bank-uuid",
    "bloodGroup": "O+",
    "scheduledDate": "2024-01-25T09:00:00Z",
    "quantity": 1,
    "notes": "First time donor"
  }'
```

### Complete a Donation (Updates Inventory!)

```bash
curl -X POST http://localhost:3000/api/donations/DONATION_ID/complete
```

**Result:** 
- Donation status → COMPLETED
- completedDate → Current timestamp
- Inventory quantity → INCREMENTED by donation quantity

### List Donations

```bash
# All donations
curl "http://localhost:3000/api/donations"

# By donor
curl "http://localhost:3000/api/donations?donorId=USER_UUID"

# By blood bank
curl "http://localhost:3000/api/donations?bloodBankId=BANK_UUID"

# By status
curl "http://localhost:3000/api/donations?status=COMPLETED"
```

---

## 📢 5. Campaigns

### Create Campaign

```bash
curl -X POST http://localhost:3000/api/campaigns \
  -H "Content-Type: application/json" \
  -d '{
    "bloodBankId": "blood-bank-uuid",
    "name": "World Blood Donor Day 2024",
    "description": "Annual blood donation drive",
    "startDate": "2024-06-14T08:00:00Z",
    "endDate": "2024-06-14T18:00:00Z",
    "location": "City Hospital, Main Campus",
    "targetBloodGroups": ["O+", "O-", "AB+"],
    "contactPerson": "Dr. Smith",
    "contactPhone": "9876543210"
  }'
```

### List Campaigns

```bash
# All campaigns
curl "http://localhost:3000/api/campaigns"

# Only active campaigns
curl "http://localhost:3000/api/campaigns?isActive=true"

# By blood bank
curl "http://localhost:3000/api/campaigns?bloodBankId=BANK_UUID"
```

---

## 🏥 6. Hospitals

### Create Hospital

```bash
curl -X POST http://localhost:3000/api/hospitals \
  -H "Content-Type: application/json" \
  -d '{
    "name": "City General Hospital",
    "email": "admin@cityhospital.com",
    "phone": "0222345678",
    "address": "123 Main Street",
    "city": "Mumbai",
    "state": "Maharashtra",
    "pincode": "400001",
    "country": "India"
  }'
```

### Get Hospital with Blood Requests

```bash
curl "http://localhost:3000/api/hospitals/HOSPITAL_ID"
```

**Response includes:**
- Hospital details
- Recent 5 blood requests

---

## 🏦 7. Blood Banks

### Create Blood Bank

```bash
curl -X POST http://localhost:3000/api/blood-banks \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Central Blood Bank",
    "email": "info@centralblood.org",
    "phone": "0223456789",
    "address": "456 Blood Drive",
    "city": "Mumbai",
    "state": "Maharashtra",
    "pincode": "400002",
    "country": "India",
    "license": "BB-MH-2024-001"
  }'
```

### Get Blood Bank with Full Details

```bash
curl "http://localhost:3000/api/blood-banks/BANK_ID"
```

**Response includes:**
- Blood bank details
- Complete inventory (all blood groups)
- Recent 5 donations
- Active campaigns

---

## 👥 8. Users

### List All Users

```bash
# All users
curl "http://localhost:3000/api/users"

# With pagination
curl "http://localhost:3000/api/users?page=1&limit=20"

# Filter by role
curl "http://localhost:3000/api/users?role=DONOR"
```

### Get User by ID

```bash
curl "http://localhost:3000/api/users/USER_ID"
```

### Update User Profile

```bash
curl -X PUT http://localhost:3000/api/users/USER_ID \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Updated Name",
    "city": "Delhi",
    "state": "Delhi"
  }'
```

### Deactivate User

```bash
curl -X DELETE http://localhost:3000/api/users/USER_ID
```

**Note:** This is a soft delete (sets `isActive=false`), not a permanent deletion.

---

## 🔔 9. Notifications

### Get User Notifications

```bash
# All notifications for user
curl "http://localhost:3000/api/notifications?userId=USER_UUID"

# Only unread
curl "http://localhost:3000/api/notifications?userId=USER_UUID&isRead=false"

# With pagination
curl "http://localhost:3000/api/notifications?userId=USER_UUID&page=1&limit=20"
```

**Response includes:**
- Notifications array
- `unreadCount` - Total unread for this user

### Mark Notification as Read

```bash
curl -X POST http://localhost:3000/api/notifications/NOTIFICATION_ID/read
```

---

## 🧪 Testing with Postman

### Import Environment Variables

Create a Postman environment with:

```json
{
  "base_url": "http://localhost:3000",
  "token": "YOUR_JWT_TOKEN_AFTER_LOGIN",
  "user_id": "uuid-here",
  "blood_bank_id": "uuid-here",
  "hospital_id": "uuid-here"
}
```

### Use Variables in Requests

```
GET {{base_url}}/api/users/{{user_id}}
Authorization: Bearer {{token}}
```

---

## 🎯 Common Query Parameters

### Pagination
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 10)

### Filtering
- `bloodGroup` - A+, A-, B+, B-, AB+, AB-, O+, O-
- `status` - Entity-specific (PENDING, COMPLETED, etc.)
- `urgency` - LOW, MEDIUM, HIGH, CRITICAL
- `role` - DONOR, BLOOD_BANK_ADMIN, HOSPITAL_ADMIN, ADMIN
- `isActive` - true/false

### Date Ranges
Most date fields accept ISO 8601 format:
```
2024-01-15T10:00:00Z
2024-01-15T10:00:00+05:30
```

---

## ⚡ Quick Test Script

Save this as `test-api.sh`:

```bash
#!/bin/bash

BASE_URL="http://localhost:3000"

echo "🔐 Testing Authentication..."

# Register
echo "Registering user..."
curl -X POST $BASE_URL/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "quicktest@example.com",
    "password": "Test1234",
    "firstName": "Quick",
    "lastName": "Test",
    "phone": "8888888888",
    "bloodGroup": "O+",
    "role": "DONOR"
  }'

echo -e "\n\n🔑 Logging in..."
LOGIN_RESPONSE=$(curl -s -X POST $BASE_URL/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "quicktest@example.com",
    "password": "Test1234"
  }')

echo $LOGIN_RESPONSE | jq '.'

TOKEN=$(echo $LOGIN_RESPONSE | jq -r '.data.token')

echo -e "\n\n✅ Token received: ${TOKEN:0:50}..."

echo -e "\n\n🔍 Verifying token..."
curl -s $BASE_URL/api/auth/verify \
  -H "Authorization: Bearer $TOKEN" | jq '.'

echo -e "\n\n🩸 Getting blood inventory..."
curl -s $BASE_URL/api/blood-inventory | jq '.data[:3]'

echo -e "\n\n✅ API tests completed!"
```

Run with: `bash test-api.sh`

---

## 📊 Database Seeded Data

The database already contains test data:

- **3 Users:**
  - John Doe (O+, Donor)
  - Jane Smith (A-, Donor)
  - Admin User (B+, Admin)

- **2 Blood Banks:**
  - Mumbai Central Blood Bank
  - Delhi Regional Blood Bank

- **763 Blood Units** across 8 blood groups

You can use this data to test the APIs immediately!

---

## 🐛 Troubleshooting

### Error: "Email already registered"
Use a different email or delete the existing user.

### Error: "Invalid or expired token"
Token expires after 7 days. Login again to get a new token.

### Error: "Blood bank not found"
Check the blood bank ID. Use GET `/api/blood-banks` to see available banks.

### Server not starting
```bash
# Kill any running processes
taskkill /F /IM node.exe

# Clear cache
Remove-Item -Recurse -Force .next

# Restart
npm run dev
```

---

## ✅ Status Check

Verify server is running:
```bash
curl http://localhost:3000/api/auth/verify
```

Expected response: `401 Unauthorized` (this is correct - no token provided)

---

Happy testing! 🚀
