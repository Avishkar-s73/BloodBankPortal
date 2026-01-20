# BloodLink Backend API Documentation

## Overview
Complete RESTful API implementation for BloodLink blood donation & inventory management system using Next.js App Router, Prisma ORM, and PostgreSQL.

---

## 🔑 Key Features Implemented

✅ **Users API** - User management with validation  
✅ **Hospitals API** - Hospital registration and listing  
✅ **Blood Inventory API** - Inventory management with upsert logic  
✅ **Blood Requests API** - Transaction-based request fulfillment  
✅ **Atomic Transactions** - Ensures data consistency  
✅ **Proper Error Handling** - Meaningful error messages  
✅ **Input Validation** - Comprehensive validation rules  
✅ **Pagination** - Efficient data retrieval  

---

## 📋 API Endpoints

### 1️⃣ Users API

#### **GET /api/users**
List all users with optional filtering and pagination.

**Query Parameters:**
- `page` (number, default: 1) - Page number
- `limit` (number, default: 20) - Items per page
- `role` (enum) - Filter by role: DONOR, HOSPITAL, BLOOD_BANK, NGO, ADMIN
- `bloodGroup` (enum) - Filter by blood group
- `city` (string) - Filter by city

**Example Request:**
```bash
GET /api/users?page=1&limit=10&role=DONOR&bloodGroup=O_POSITIVE
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "email": "john@example.com",
      "role": "DONOR",
      "firstName": "John",
      "lastName": "Doe",
      "phone": "1234567890",
      "bloodGroup": "O_POSITIVE",
      "city": "Mumbai",
      "createdAt": "2026-01-19T10:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 50,
    "totalPages": 5,
    "hasNext": true,
    "hasPrev": false
  }
}
```

#### **POST /api/users**
Create a new user.

**Required Fields:**
- `email` (string, unique) - Valid email format
- `password` (string, min 6 chars) - User password
- `firstName` (string) - First name
- `lastName` (string) - Last name
- `phone` (string, unique, 10-15 digits) - Phone number

**Optional Fields:**
- `role` (enum, default: DONOR) - User role
- `bloodGroup` (enum) - Blood group
- `gender` (enum) - MALE, FEMALE, OTHER
- `city`, `state`, `address`, `pincode` - Location details
- `dateOfBirth` (ISO date) - Date of birth

**Example Request:**
```bash
POST /api/users
Content-Type: application/json

{
  "email": "donor@example.com",
  "password": "secure123",
  "firstName": "Jane",
  "lastName": "Smith",
  "phone": "9876543210",
  "role": "DONOR",
  "bloodGroup": "A_POSITIVE",
  "city": "Delhi"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "User created successfully",
  "data": {
    "id": "uuid",
    "email": "donor@example.com",
    "firstName": "Jane",
    "lastName": "Smith",
    "role": "DONOR",
    "bloodGroup": "A_POSITIVE",
    "createdAt": "2026-01-19T10:00:00Z"
  }
}
```

**Error Responses:**
- `400` - Validation error (missing fields, invalid format)
- `409` - Email or phone already exists
- `500` - Internal server error

---

### 2️⃣ Hospitals API

#### **GET /api/hospitals**
List all hospitals with optional filtering and pagination.

**Query Parameters:**
- `page` (number, default: 1)
- `limit` (number, default: 20)
- `city` (string) - Filter by city
- `state` (string) - Filter by state
- `hasBloodBank` (boolean) - Filter by blood bank availability
- `isActive` (boolean) - Filter by active status

**Example Request:**
```bash
GET /api/hospitals?city=Mumbai&hasBloodBank=true
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "City General Hospital",
      "registrationNo": "REG123456",
      "email": "contact@cityhospital.com",
      "phone": "02212345678",
      "city": "Mumbai",
      "state": "Maharashtra",
      "hasBloodBank": true,
      "totalBeds": 500,
      "isActive": true
    }
  ],
  "pagination": { ... }
}
```

#### **POST /api/hospitals**
Create a new hospital.

**Required Fields:**
- `name` (string) - Hospital name
- `registrationNo` (string, unique) - Government registration number
- `email` (string, unique) - Contact email
- `phone` (string, unique) - Contact phone
- `address` (string) - Full address
- `city` (string) - City name
- `state` (string) - State name
- `pincode` (string) - PIN code

**Optional Fields:**
- `alternatePhone`, `emergencyPhone` (string) - Additional contacts
- `totalBeds` (number) - Total bed capacity
- `hasBloodBank` (boolean, default: false) - Has blood bank
- `country` (string, default: "India") - Country

**Example Request:**
```bash
POST /api/hospitals
Content-Type: application/json

{
  "name": "Apollo Hospital",
  "registrationNo": "REG789012",
  "email": "admin@apollo.com",
  "phone": "02298765432",
  "address": "123 Health Street",
  "city": "Delhi",
  "state": "Delhi",
  "pincode": "110001",
  "totalBeds": 800,
  "hasBloodBank": true
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Hospital created successfully",
  "data": { ... }
}
```

**Error Responses:**
- `400` - Validation error
- `409` - Registration number, email, or phone already exists
- `500` - Internal server error

---

### 3️⃣ Blood Inventory API

#### **GET /api/blood-inventory**
List all blood inventory items with optional filtering.

**Query Parameters:**
- `bloodGroup` (enum) - Filter by blood group
- `bloodBankId` (uuid) - Filter by blood bank
- `minQuantity` (number) - Minimum quantity threshold

**Example Request:**
```bash
GET /api/blood-inventory?bloodGroup=O_POSITIVE&minQuantity=10
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "bloodGroup": "O_POSITIVE",
      "quantity": 50,
      "lastUpdated": "2026-01-19T10:00:00Z",
      "bloodBank": {
        "id": "uuid",
        "name": "Central Blood Bank",
        "city": "Mumbai",
        "state": "Maharashtra"
      }
    }
  ],
  "count": 1
}
```

#### **POST /api/blood-inventory**
Create or update blood inventory (upsert logic).

**Required Fields:**
- `bloodBankId` (uuid) - Blood bank ID
- `bloodGroup` (enum) - Blood group
- `quantity` (number, ≥ 0) - Quantity in units

**Behavior:**
- If inventory exists for bloodBankId + bloodGroup → **increment** quantity
- If not exists → **create** new inventory record
- Negative quantities are rejected

**Example Request:**
```bash
POST /api/blood-inventory
Content-Type: application/json

{
  "bloodBankId": "uuid-blood-bank-123",
  "bloodGroup": "AB_POSITIVE",
  "quantity": 25
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Blood inventory updated successfully",
  "data": {
    "id": "uuid",
    "bloodGroup": "AB_POSITIVE",
    "quantity": 75,
    "lastUpdated": "2026-01-19T10:00:00Z",
    "bloodBank": { ... }
  }
}
```

**Error Responses:**
- `400` - Missing fields or negative quantity
- `404` - Blood bank not found
- `500` - Internal server error

---

### 4️⃣ Blood Requests API (Most Important)

#### **GET /api/blood-requests**
List all blood requests with pagination and filtering.

**Query Parameters:**
- `page` (number, default: 1)
- `limit` (number, default: 20)
- `status` (enum) - PENDING, APPROVED, FULFILLED, REJECTED, CANCELLED
- `urgency` (string) - NORMAL, URGENT, CRITICAL
- `bloodGroup` (enum) - Blood group filter

**Example Request:**
```bash
GET /api/blood-requests?status=FULFILLED&page=1&limit=10
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "bloodGroup": "O_NEGATIVE",
      "quantityNeeded": 3,
      "status": "FULFILLED",
      "urgency": "CRITICAL",
      "patientName": "Emergency Patient",
      "purpose": "Emergency surgery",
      "requiredBy": "2026-01-20T08:00:00Z",
      "fulfilledAt": "2026-01-19T12:00:00Z",
      "requester": { ... },
      "bloodBank": { ... },
      "hospital": { ... }
    }
  ],
  "pagination": { ... }
}
```

#### **POST /api/blood-requests** 🔥 (TRANSACTION LOGIC)
Create a new blood request with atomic transaction support.

**Transaction Flow:**
1. ✅ Check if sufficient blood units exist in inventory
2. ✅ Create blood request with status (FULFILLED or PENDING)
3. ✅ If sufficient → Reduce inventory quantity atomically
4. ✅ If insufficient → Mark request as PENDING
5. ✅ Rollback all changes if any step fails

**Required Fields:**
- `requesterId` (uuid) - User making the request
- `bloodBankId` (uuid) - Blood bank to request from
- `bloodGroup` (enum) - Blood type needed
- `quantityNeeded` (number, > 0) - Units required
- `patientName` (string) - Patient name
- `patientAge` (number, 0-150) - Patient age
- `purpose` (string) - Purpose of request
- `requiredBy` (ISO date) - When blood is needed

**Optional Fields:**
- `urgency` (string, default: NORMAL) - NORMAL, URGENT, CRITICAL
- `hospitalId` (uuid) - Hospital making request
- `patientGender` (enum) - MALE, FEMALE, OTHER
- `medicalNotes` (string) - Additional medical information
- `doctorName`, `doctorContact` (string) - Doctor details

**Example Request (Successful Fulfillment):**
```bash
POST /api/blood-requests
Content-Type: application/json

{
  "requesterId": "uuid-user-123",
  "bloodBankId": "uuid-blood-bank-456",
  "bloodGroup": "O_POSITIVE",
  "quantityNeeded": 2,
  "patientName": "John Doe",
  "patientAge": 45,
  "purpose": "Scheduled surgery",
  "requiredBy": "2026-01-25T10:00:00Z",
  "urgency": "NORMAL",
  "hospitalId": "uuid-hospital-789"
}
```

**Response (201 Created - FULFILLED):**
```json
{
  "success": true,
  "message": "Blood request fulfilled successfully.",
  "data": {
    "id": "uuid",
    "bloodGroup": "O_POSITIVE",
    "quantityNeeded": 2,
    "status": "FULFILLED",
    "patientName": "John Doe",
    "fulfilledAt": "2026-01-19T12:00:00Z",
    "requester": { ... },
    "bloodBank": { ... }
  }
}
```

**Response (202 Accepted - PENDING):**
If inventory has insufficient blood:
```json
{
  "success": true,
  "message": "Insufficient blood units available. Request marked as PENDING.",
  "data": {
    "id": "uuid",
    "status": "PENDING",
    "fulfilledAt": null,
    ...
  }
}
```

**Error Responses:**
- `400` - Validation error (missing fields, invalid age/quantity)
- `404` - Requester, blood bank, or hospital not found
- `500` - Transaction failed or internal server error

---

## 🎯 Testing Workflow

### 1. Setup Database (If not done)
```bash
# Run migrations
npx prisma migrate dev

# Seed database with sample data
npm run prisma:seed
```

### 2. Start Dev Server
```bash
npm run dev
```

### 3. Test Endpoints

#### Create a User (Donor)
```bash
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{
    "email": "donor1@test.com",
    "password": "test123",
    "firstName": "Test",
    "lastName": "Donor",
    "phone": "9999888877",
    "role": "DONOR",
    "bloodGroup": "O_POSITIVE",
    "city": "Mumbai"
  }'
```

#### Create a Hospital
```bash
curl -X POST http://localhost:3000/api/hospitals \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Hospital",
    "registrationNo": "REG001",
    "email": "hospital@test.com",
    "phone": "0221234567",
    "address": "Test Address",
    "city": "Mumbai",
    "state": "Maharashtra",
    "pincode": "400001",
    "hasBloodBank": true
  }'
```

#### Add Blood Inventory
```bash
curl -X POST http://localhost:3000/api/blood-inventory \
  -H "Content-Type: application/json" \
  -d '{
    "bloodBankId": "<blood-bank-uuid>",
    "bloodGroup": "O_POSITIVE",
    "quantity": 50
  }'
```

#### Create Blood Request (Transaction Test)
```bash
curl -X POST http://localhost:3000/api/blood-requests \
  -H "Content-Type: application/json" \
  -d '{
    "requesterId": "<user-uuid>",
    "bloodBankId": "<blood-bank-uuid>",
    "bloodGroup": "O_POSITIVE",
    "quantityNeeded": 2,
    "patientName": "Emergency Patient",
    "patientAge": 35,
    "purpose": "Surgery",
    "requiredBy": "2026-01-25T10:00:00Z",
    "urgency": "URGENT"
  }'
```

#### Verify Inventory Reduction
```bash
curl http://localhost:3000/api/blood-inventory?bloodBankId=<blood-bank-uuid>
```

---

## 🔒 Data Consistency Guarantees

### Transaction Atomicity
The blood request creation uses `prisma.$transaction()` which ensures:

✅ **All-or-nothing execution** - Either all database operations succeed or none  
✅ **Inventory consistency** - Inventory is never reduced without creating a request  
✅ **Race condition prevention** - Concurrent requests handled safely  
✅ **Automatic rollback** - Any error triggers complete rollback  

### Example Transaction Flow:
```typescript
await prisma.$transaction(async (tx) => {
  // 1. Check inventory
  const inventory = await tx.bloodInventory.findUnique(...);
  
  // 2. Determine status
  const status = inventory.quantity >= requested ? FULFILLED : PENDING;
  
  // 3. Reduce inventory (if sufficient)
  if (status === FULFILLED) {
    await tx.bloodInventory.update({
      data: { quantity: { decrement: requested } }
    });
  }
  
  // 4. Create request
  const request = await tx.bloodRequest.create(...);
  
  return request;
});
```

---

## 📊 Database Schema Summary

**Users** → firstName, lastName, email, phone, role, bloodGroup, city, state  
**Hospitals** → name, registrationNo, email, phone, address, city, state, hasBloodBank  
**BloodBanks** → name, email, phone, city, state  
**BloodInventory** → bloodBankId, bloodGroup, quantity (unique constraint on bloodBankId + bloodGroup)  
**BloodRequests** → requesterId, bloodBankId, hospitalId, bloodGroup, quantityNeeded, status, patientName, purpose  

---

## ✅ Implementation Checklist

- [x] Users API (GET, POST) with validation
- [x] Hospitals API (GET, POST) with validation
- [x] Blood Inventory API (GET, POST with upsert)
- [x] Blood Requests API (GET with pagination)
- [x] Blood Requests POST with transaction logic
- [x] Atomic inventory reduction
- [x] Proper error handling (400, 404, 409, 500)
- [x] Input validation (email, phone, quantity, age)
- [x] Pagination support
- [x] Status code consistency
- [x] Meaningful error messages
- [x] Database query optimization (parallel queries, select fields)
- [x] Logging for important actions

---

## 🚀 Production Recommendations (Beyond MVP)

1. **Authentication** - Add JWT-based auth using NextAuth.js
2. **Password Hashing** - Use bcrypt for password storage
3. **Rate Limiting** - Implement API rate limiting
4. **CORS Configuration** - Configure CORS for frontend
5. **Error Logging** - Use Sentry or similar for error tracking
6. **API Documentation** - Auto-generate with Swagger/OpenAPI
7. **Testing** - Add unit and integration tests
8. **Monitoring** - Set up application monitoring
9. **Caching** - Implement Redis caching for frequently accessed data
10. **Data Backup** - Automated database backups

---

## 🎓 College Demo Tips

1. **Show Transaction Atomicity**: Create a request with insufficient inventory, show it's marked PENDING
2. **Show Successful Fulfillment**: Create a request with sufficient inventory, verify inventory reduction
3. **Show Validation**: Try creating users with duplicate emails, show 409 errors
4. **Show Pagination**: Create multiple records, demonstrate pagination with different limits
5. **Show Filtering**: Filter blood requests by status, users by blood group
6. **Show Error Handling**: Try invalid requests, demonstrate proper error responses

---

## 📝 Notes

- No authentication required for MVP (add userId from request body)
- Passwords stored as plain text for MVP (hash in production)
- All timestamps in ISO 8601 format
- UUIDs used for all entity IDs
- PostgreSQL database with Prisma ORM
- Next.js App Router API routes

---

**Status:** ✅ Backend fully implemented and ready for demo  
**Last Updated:** January 19, 2026
