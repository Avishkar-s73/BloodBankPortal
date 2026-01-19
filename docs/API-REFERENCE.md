# API Documentation

## Base URL
```
http://localhost:3000/api
```

## Authentication
Currently, the API does not require authentication. Future versions will implement JWT-based authentication.

---

## Blood Requests

### Get All Blood Requests
```
GET /api/blood-requests
```

**Query Parameters:**
- `page` (number, optional): Page number (default: 1)
- `limit` (number, optional): Items per page (default: 20)
- `status` (string, optional): Filter by status (PENDING, APPROVED, REJECTED, FULFILLED, CANCELLED)
- `urgency` (string, optional): Filter by urgency (NORMAL, URGENT, CRITICAL)
- `bloodGroup` (string, optional): Filter by blood group (A_POSITIVE, B_POSITIVE, etc.)

**Response:**
```json
{
  "success": true,
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "totalPages": 5
  }
}
```

### Create Blood Request
```
POST /api/blood-requests
```

**Request Body:**
```json
{
  "bloodGroup": "A_POSITIVE",
  "quantityMl": 500,
  "urgency": "URGENT",
  "reason": "Emergency surgery",
  "requesterId": "uuid",
  "bloodBankId": "uuid"
}
```

### Get Single Blood Request
```
GET /api/blood-requests/[id]
```

### Update Blood Request
```
PUT /api/blood-requests/[id]
```

### Delete Blood Request
```
DELETE /api/blood-requests/[id]
```

---

## Blood Inventory

### Get All Inventory
```
GET /api/blood-inventory
```

**Query Parameters:**
- `bloodGroup` (string, optional): Filter by blood group
- `bloodBankId` (string, optional): Filter by blood bank ID
- `minQuantity` (number, optional): Minimum quantity threshold

**Response:**
```json
{
  "success": true,
  "data": [...],
  "count": 10
}
```

### Update Inventory
```
POST /api/blood-inventory
```

**Request Body:**
```json
{
  "bloodBankId": "uuid",
  "bloodGroup": "O_NEGATIVE",
  "quantityMl": 1000
}
```

---

## Donors

### Get All Donors
```
GET /api/donors
```

**Query Parameters:**
- `page` (number, optional): Page number
- `limit` (number, optional): Items per page
- `bloodGroup` (string, optional): Filter by blood group
- `city` (string, optional): Filter by city
- `state` (string, optional): Filter by state

### Register Donor
```
POST /api/donors
```

**Request Body:**
```json
{
  "email": "donor@example.com",
  "password": "securePassword123",
  "firstName": "John",
  "lastName": "Doe",
  "phoneNumber": "+1234567890",
  "bloodGroup": "B_POSITIVE",
  "dateOfBirth": "1990-01-01",
  "gender": "MALE",
  "addressLine1": "123 Main St",
  "city": "New York",
  "state": "NY",
  "zipCode": "10001",
  "country": "USA"
}
```

---

## Blood Banks

### Get All Blood Banks
```
GET /api/blood-banks
```

**Query Parameters:**
- `city` (string, optional): Filter by city
- `state` (string, optional): Filter by state
- `is24x7` (boolean, optional): Filter by 24x7 availability

### Register Blood Bank
```
POST /api/blood-banks
```

**Request Body:**
```json
{
  "name": "City Blood Bank",
  "email": "info@citybloodbank.com",
  "phoneNumber": "+1234567890",
  "addressLine1": "456 Hospital Rd",
  "city": "Boston",
  "state": "MA",
  "zipCode": "02101",
  "is24x7": true,
  "licenseNumber": "BB-12345"
}
```

---

## Blood Groups
```
A_POSITIVE, A_NEGATIVE
B_POSITIVE, B_NEGATIVE
AB_POSITIVE, AB_NEGATIVE
O_POSITIVE, O_NEGATIVE
```

## Request Status
```
PENDING, APPROVED, REJECTED, FULFILLED, CANCELLED
```

## Urgency Levels
```
NORMAL, URGENT, CRITICAL
```
