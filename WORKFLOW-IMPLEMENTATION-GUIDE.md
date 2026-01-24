# Blood Request Workflow Implementation Guide

## Overview
This document describes the complete blood request workflow implementation for the BloodLink project. The workflow ensures that blood requests follow a proper approval process without auto-fulfillment.

---

## Database Migration Required

Before using the new workflow, you must run the following SQL commands on your PostgreSQL database.

### Step 1: Add New Enum Values

```sql
-- Add new statuses to RequestStatus enum
ALTER TYPE "RequestStatus" ADD VALUE IF NOT EXISTS 'PENDING_APPROVAL';
ALTER TYPE "RequestStatus" ADD VALUE IF NOT EXISTS 'ESCALATED_TO_DONORS';

-- Add new status to DonationStatus enum  
ALTER TYPE "DonationStatus" ADD VALUE IF NOT EXISTS 'DONATION_CONFIRMED';
```

### Step 2: Create DonationIntent Table

```sql
-- Create donation_intents table
CREATE TABLE IF NOT EXISTS "donation_intents" (
    "id" TEXT NOT NULL,
    "status" "DonationStatus" NOT NULL DEFAULT 'DONATION_CONFIRMED',
    "preferredDate" TIMESTAMP(3),
    "confirmedDate" TIMESTAMP(3),
    "completedDate" TIMESTAMP(3),
    "donorNotes" TEXT,
    "bloodBankNotes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "donorId" TEXT NOT NULL,
    "requestId" TEXT NOT NULL,
    "bloodBankId" TEXT,
    CONSTRAINT "donation_intents_pkey" PRIMARY KEY ("id")
);

-- Create indexes
CREATE INDEX IF NOT EXISTS "donation_intents_donorId_idx" ON "donation_intents"("donorId");
CREATE INDEX IF NOT EXISTS "donation_intents_requestId_idx" ON "donation_intents"("requestId");
CREATE INDEX IF NOT EXISTS "donation_intents_bloodBankId_idx" ON "donation_intents"("bloodBankId");
CREATE INDEX IF NOT EXISTS "donation_intents_status_idx" ON "donation_intents"("status");
CREATE INDEX IF NOT EXISTS "donation_intents_createdAt_idx" ON "donation_intents"("createdAt");

-- Add foreign keys
ALTER TABLE "donation_intents" 
ADD CONSTRAINT "donation_intents_donorId_fkey" 
FOREIGN KEY ("donorId") REFERENCES "users"("id") 
ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "donation_intents" 
ADD CONSTRAINT "donation_intents_requestId_fkey" 
FOREIGN KEY ("requestId") REFERENCES "blood_requests"("id") 
ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "donation_intents" 
ADD CONSTRAINT "donation_intents_bloodBankId_fkey" 
FOREIGN KEY ("bloodBankId") REFERENCES "blood_banks"("id") 
ON DELETE SET NULL ON UPDATE CASCADE;
```

### Step 3: Update Default Status

```sql
-- Update default status for new blood requests
ALTER TABLE "blood_requests" ALTER COLUMN "status" SET DEFAULT 'PENDING_APPROVAL';
```

### How to Run These Commands

**Option 1: Using pgAdmin**
1. Open pgAdmin
2. Connect to your database (bloodlink_dev)
3. Open the Query Tool
4. Copy and paste each SQL block above
5. Execute them in order

**Option 2: Using psql command line**
```bash
psql -U postgres -d bloodlink_dev -f migration.sql
```

**Option 3: Using TablePlus or other GUI tools**
1. Connect to your PostgreSQL database
2. Open SQL editor
3. Run the commands above

---

## Workflow Description

### Status Flow

```
PENDING_APPROVAL → FULFILLED (if inventory available)
                 ↓
             ESCALATED_TO_DONORS → (donors volunteer) → DONATION_CONFIRMED
```

### Detailed Workflow Steps

#### 1. Hospital Creates Blood Request
- **Endpoint**: `POST /api/blood-requests`
- **Status**: Automatically set to `PENDING_APPROVAL`
- **Action**: Creates request record, NO inventory changes
- **Response**: Request ID and details

```typescript
// Example request body
{
  "requesterId": "user-uuid",
  "bloodBankId": "bank-uuid",
  "hospitalId": "hospital-uuid",
  "bloodGroup": "O_POSITIVE",
  "quantityNeeded": 2,
  "patientName": "John Doe",
  "purpose": "Emergency surgery",
  "requiredBy": "2026-01-25T10:00:00Z",
  "urgency": "CRITICAL"
}
```

#### 2. Blood Bank Views Pending Requests
- **Endpoint**: `GET /api/blood-requests?status=PENDING_APPROVAL&bloodBankId={id}`
- **Returns**: All requests awaiting blood bank review

#### 3. Blood Bank Approves Request (Sufficient Inventory)
- **Endpoint**: `POST /api/blood-requests/{id}/approve`
- **Checks**: Inventory availability for blood group
- **Action**: 
  - Deducts inventory (atomic transaction)
  - Updates status to `FULFILLED`
  - Sets `fulfilledAt` timestamp
- **Status**: `PENDING_APPROVAL` → `FULFILLED`

```typescript
// No request body needed, just call POST to the approve endpoint
POST /api/blood-requests/abc-123-def/approve
```

**Success Response:**
```json
{
  "success": true,
  "message": "Blood request approved and fulfilled successfully. Inventory updated.",
  "data": {
    "request": { ... },
    "inventoryDeducted": 2,
    "remainingInventory": 48
  }
}
```

**Insufficient Inventory Response:**
```json
{
  "success": false,
  "error": {
    "code": "INSUFFICIENT_INVENTORY",
    "message": "Insufficient inventory. Available: 1 units, Required: 2 units",
    "suggestion": "Consider escalating this request to donors using the escalate endpoint."
  }
}
```

#### 4. Blood Bank Escalates Request (Insufficient Inventory)
- **Endpoint**: `POST /api/blood-requests/{id}/escalate`
- **Action**: 
  - Updates status to `ESCALATED_TO_DONORS`
  - NO inventory changes
  - Makes request visible to donors
- **Status**: `PENDING_APPROVAL` → `ESCALATED_TO_DONORS`

```typescript
POST /api/blood-requests/abc-123-def/escalate
```

#### 5. Donors View Escalated Requests
- **Endpoint**: `GET /api/blood-requests?status=ESCALATED_TO_DONORS`
- **Returns**: Only requests that need donor volunteers
- **Filter**: Donors can filter by their blood group

#### 6. Donor Volunteers for Request
- **Endpoint**: `POST /api/donation-intents`
- **Validations**:
  - Request must be `ESCALATED_TO_DONORS`
  - Donor's blood group must match request
  - Donor cannot volunteer twice for same request
- **Action**: Creates DonationIntent record with `DONATION_CONFIRMED` status

```typescript
// Example request body
{
  "donorId": "donor-uuid",
  "requestId": "request-uuid",
  "preferredDate": "2026-01-26T09:00:00Z",
  "donorNotes": "I can donate in the morning"
}
```

**Success Response:**
```json
{
  "success": true,
  "message": "Thank you for volunteering! The blood bank will contact you to schedule your donation.",
  "data": {
    "id": "intent-uuid",
    "donor": { ... },
    "request": { ... },
    "bloodBank": { ... }
  }
}
```

#### 7. Blood Bank Confirms Donation Received
- **Endpoint**: `POST /api/inventory/add`
- **Action**: 
  - Increases inventory
  - Optionally links to donation record
  - Updates donation status to `COMPLETED`

```typescript
// Example request body
{
  "bloodBankId": "bank-uuid",
  "bloodGroup": "O_POSITIVE",
  "quantity": 1,
  "donationId": "donation-uuid" // optional
}
```

#### 8. Blood Bank Approves Previously Escalated Request
- **Endpoint**: `POST /api/blood-requests/{id}/approve`
- **Note**: After inventory is increased from donations, blood bank can now approve the escalated request
- **Action**: Same as step 3 - deducts inventory and fulfills request

---

## API Endpoints Summary

### Blood Requests

| Method | Endpoint | Description | Authorization |
|--------|----------|-------------|---------------|
| POST | `/api/blood-requests` | Create new request | HOSPITAL |
| GET | `/api/blood-requests` | List requests (with filters) | ALL |
| GET | `/api/blood-requests/{id}` | Get request details | ALL |
| POST | `/api/blood-requests/{id}/approve` | Approve & fulfill request | BLOOD_BANK |
| POST | `/api/blood-requests/{id}/escalate` | Escalate to donors | BLOOD_BANK |

### Donation Intents

| Method | Endpoint | Description | Authorization |
|--------|----------|-------------|---------------|
| POST | `/api/donation-intents` | Donor volunteers | DONOR |
| GET | `/api/donation-intents` | List intents (with filters) | BLOOD_BANK, DONOR |

### Inventory

| Method | Endpoint | Description | Authorization |
|--------|----------|-------------|---------------|
| POST | `/api/inventory/add` | Add inventory after donation | BLOOD_BANK |
| GET | `/api/inventory/add` | View current inventory | BLOOD_BANK |

---

## Query Parameters

### GET /api/blood-requests

```
?status=PENDING_APPROVAL         // Filter by status
&bloodBankId={uuid}              // Filter by blood bank
&bloodGroup=O_POSITIVE           // Filter by blood group
&urgency=CRITICAL                // Filter by urgency
&my=true                         // Filter by logged-in user
&page=1                          // Pagination
&limit=20                        // Items per page
```

### GET /api/donation-intents

```
?donorId={uuid}                  // Filter by donor
&requestId={uuid}                // Filter by request
&bloodBankId={uuid}              // Filter by blood bank
&status=DONATION_CONFIRMED       // Filter by status
```

---

## Important Rules

### ✅ DO

- Always check inventory before approving requests
- Use transactions when modifying inventory
- Validate request status before operations
- Escalate to donors when inventory insufficient
- Update inventory ONLY through approve or add endpoints

### ❌ DON'T

- Auto-fulfill requests on creation
- Modify inventory outside transactions
- Allow donors to see PENDING_APPROVAL requests
- Skip blood group validation for volunteers
- Allow duplicate volunteering for same request

---

## Error Codes

| Code | Description | HTTP Status |
|------|-------------|-------------|
| VALIDATION_ERROR | Missing or invalid fields | 400 |
| INSUFFICIENT_INVENTORY | Not enough blood units | 400 |
| INVALID_STATUS | Operation not allowed for current status | 400 |
| BLOOD_GROUP_MISMATCH | Donor blood group doesn't match | 400 |
| DUPLICATE_INTENT | Donor already volunteered | 409 |
| NOT_FOUND | Resource not found | 404 |
| INVALID_ROLE | User role not authorized | 403 |
| INTERNAL_ERROR | Server error | 500 |

---

## Testing Workflow

### Setup Test Data

```sql
-- Create test blood bank inventory
INSERT INTO blood_inventory (id, "bloodBankId", "bloodGroup", quantity)
VALUES 
  (gen_random_uuid(), '{your-blood-bank-id}', 'O_POSITIVE', 10),
  (gen_random_uuid(), '{your-blood-bank-id}', 'A_POSITIVE', 5);
```

### Test Scenario 1: Sufficient Inventory

1. Hospital creates request for 2 units of O+
2. Blood bank sees request with status PENDING_APPROVAL
3. Blood bank approves request
4. System checks inventory (10 units available)
5. System deducts 2 units (now 8 remaining)
6. Request status becomes FULFILLED
7. Hospital sees fulfilled request

### Test Scenario 2: Insufficient Inventory with Escalation

1. Hospital creates request for 10 units of A+
2. Blood bank sees request with status PENDING_APPROVAL
3. Blood bank tries to approve → gets error "Insufficient inventory" (only 5 available)
4. Blood bank escalates request
5. Request status becomes ESCALATED_TO_DONORS
6. Donors with A+ blood group see the request
7. Donors volunteer (creates DonationIntent)
8. Donors donate at blood bank
9. Blood bank confirms donations received (adds inventory)
10. Blood bank now approves the request
11. Request fulfilled

---

## Frontend Integration

### Hospital Dashboard

```typescript
// Create request
const response = await fetch('/api/blood-requests', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(requestData)
});

// View my requests
const requests = await fetch('/api/blood-requests?my=true');
```

### Blood Bank Dashboard

```typescript
// View pending requests
const pending = await fetch(
  `/api/blood-requests?status=PENDING_APPROVAL&bloodBankId=${bankId}`
);

// Approve request
const approve = await fetch(`/api/blood-requests/${requestId}/approve`, {
  method: 'POST'
});

// Escalate request
const escalate = await fetch(`/api/blood-requests/${requestId}/escalate`, {
  method: 'POST'
});

// Add inventory after donation
const addInventory = await fetch('/api/inventory/add', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    bloodBankId: bankId,
    bloodGroup: 'O_POSITIVE',
    quantity: 1
  })
});
```

### Donor Dashboard

```typescript
// View escalated requests
const escalated = await fetch('/api/blood-requests?status=ESCALATED_TO_DONORS');

// Volunteer for request
const volunteer = await fetch('/api/donation-intents', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    donorId: userId,
    requestId: requestId,
    preferredDate: selectedDate
  })
});

// View my volunteering history
const myIntents = await fetch(`/api/donation-intents?donorId=${userId}`);
```

---

## Files Modified/Created

### Schema Updates
- ✅ `prisma/schema.prisma` - Added new statuses and DonationIntent model

### API Routes Created
- ✅ `src/app/api/blood-requests/[id]/approve/route.ts` - Approve endpoint
- ✅ `src/app/api/blood-requests/[id]/escalate/route.ts` - Escalate endpoint
- ✅ `src/app/api/donation-intents/route.ts` - Donation intent endpoints
- ✅ `src/app/api/inventory/add/route.ts` - Inventory management

### API Routes Modified
- ✅ `src/app/api/blood-requests/route.ts` - Updated to use PENDING_APPROVAL

---

## Next Steps

1. **Run Database Migration**: Execute the SQL commands at the top of this document
2. **Generate Prisma Client**: Run `npx prisma generate`
3. **Test Endpoints**: Use the testing scenarios above
4. **Update Frontend**: Integrate the new endpoints in dashboards
5. **Add Notifications**: Notify donors when requests are escalated
6. **Add Email Alerts**: Email blood banks when donors volunteer

---

## Support

If you encounter any issues:

1. Check database connection string in `.env`
2. Verify all SQL migrations ran successfully
3. Ensure Prisma Client is generated
4. Check API endpoint responses for error codes
5. Review this documentation for workflow rules

---

**Document Version**: 1.0
**Last Updated**: January 24, 2026
**Author**: GitHub Copilot - BloodLink Workflow Implementation
