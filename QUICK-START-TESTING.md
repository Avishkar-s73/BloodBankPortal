# 🚀 Quick Start Guide - BloodLink Backend Testing

## Prerequisites
```bash
# 1. Ensure PostgreSQL is running
# 2. Run migrations
npx prisma migrate dev

# 3. Seed database (get UUIDs)
npm run prisma:seed

# 4. Start dev server
npm run dev

# 5. Open Prisma Studio (to copy UUIDs)
npx prisma studio
```

---

## 📝 Quick Test Sequence

### Step 1: Create a User
```bash
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{
    "email": "donor1@test.com",
    "password": "test123",
    "firstName": "John",
    "lastName": "Donor",
    "phone": "9999888877",
    "role": "DONOR",
    "bloodGroup": "O_POSITIVE",
    "city": "Mumbai"
  }'
```
**Expected:** 201 Created with user data  
**Copy:** `id` field for next steps

---

### Step 2: Create a Hospital
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
    "pincode": "400001"
  }'
```
**Expected:** 201 Created with hospital data

---

### Step 3: Add Blood Inventory
```bash
# Replace <blood-bank-uuid> with actual blood bank ID from seed/studio
curl -X POST http://localhost:3000/api/blood-inventory \
  -H "Content-Type: application/json" \
  -d '{
    "bloodBankId": "<blood-bank-uuid>",
    "bloodGroup": "O_POSITIVE",
    "quantity": 50
  }'
```
**Expected:** 201 Created, inventory created with 50 units

---

### Step 4: Create Blood Request (TRANSACTION TEST)
```bash
# Replace UUIDs with actual values
curl -X POST http://localhost:3000/api/blood-requests \
  -H "Content-Type: application/json" \
  -d '{
    "requesterId": "<user-uuid>",
    "bloodBankId": "<blood-bank-uuid>",
    "bloodGroup": "O_POSITIVE",
    "quantityNeeded": 5,
    "patientName": "Emergency Patient",
    "patientAge": 45,
    "purpose": "Emergency surgery",
    "requiredBy": "2026-01-25T10:00:00Z",
    "urgency": "URGENT"
  }'
```
**Expected:** 201 Created, status=FULFILLED

---

### Step 5: Verify Inventory Reduction
```bash
curl http://localhost:3000/api/blood-inventory
```
**Expected:** Quantity should be 45 (50 - 5)

---

### Step 6: Test Insufficient Inventory
```bash
# Request more than available
curl -X POST http://localhost:3000/api/blood-requests \
  -H "Content-Type: application/json" \
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
  }'
```
**Expected:** 202 Accepted, status=PENDING, message="Insufficient blood units available"

---

## 🧪 Validation Tests

### Test Duplicate Email
```bash
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{
    "email": "donor1@test.com",
    "password": "test123",
    "firstName": "Duplicate",
    "lastName": "User",
    "phone": "8888777766"
  }'
```
**Expected:** 409 Conflict - "User with this email already exists"

---

### Test Invalid Email
```bash
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{
    "email": "invalid-email",
    "password": "test123",
    "firstName": "Invalid",
    "lastName": "Email",
    "phone": "7777666655"
  }'
```
**Expected:** 400 Bad Request - "Invalid email format"

---

### Test Negative Quantity
```bash
curl -X POST http://localhost:3000/api/blood-inventory \
  -H "Content-Type: application/json" \
  -d '{
    "bloodBankId": "<blood-bank-uuid>",
    "bloodGroup": "O_POSITIVE",
    "quantity": -10
  }'
```
**Expected:** 400 Bad Request - "Quantity cannot be negative"

---

## 📊 GET Endpoints

### Get All Users (Paginated)
```bash
curl "http://localhost:3000/api/users?page=1&limit=10"
```

### Get Donors by Blood Group
```bash
curl "http://localhost:3000/api/users?role=DONOR&bloodGroup=O_POSITIVE"
```

### Get Hospitals by City
```bash
curl "http://localhost:3000/api/hospitals?city=Mumbai"
```

### Get Blood Inventory
```bash
curl "http://localhost:3000/api/blood-inventory?bloodGroup=O_POSITIVE"
```

### Get Fulfilled Requests
```bash
curl "http://localhost:3000/api/blood-requests?status=FULFILLED"
```

### Get Pending Requests
```bash
curl "http://localhost:3000/api/blood-requests?status=PENDING"
```

---

## 🎯 Demo Checklist

- [ ] Create user → Verify 201 response
- [ ] Create hospital → Verify 201 response
- [ ] Add inventory → Verify 201 response
- [ ] Create request (sufficient inventory) → Verify 201, status=FULFILLED
- [ ] Check inventory reduced → Verify quantity decreased
- [ ] Create request (insufficient) → Verify 202, status=PENDING
- [ ] Test duplicate email → Verify 409 error
- [ ] Test invalid email → Verify 400 error
- [ ] Test pagination → Verify page/limit work
- [ ] Test filtering → Verify filters work

---

## 💡 Pro Tips

1. **Use Prisma Studio** to view data in real-time: `npx prisma studio`
2. **Use Postman/Thunder Client** for easier API testing
3. **Check terminal logs** for transaction flow console.log messages
4. **Test concurrency** by running multiple requests simultaneously
5. **Verify database** directly using `psql` or Prisma Studio

---

## 🔍 Troubleshooting

### "Blood bank not found"
→ Run seed script: `npm run prisma:seed`  
→ Check blood bank IDs in Prisma Studio

### "Requester not found"
→ Create a user first using POST /api/users  
→ Copy the returned ID

### "Database connection error"
→ Ensure PostgreSQL is running  
→ Check DATABASE_URL in .env.local

### "Prisma Client not generated"
→ Run: `npx prisma generate`

---

## ✅ Success Indicators

✅ Users can be created and retrieved  
✅ Hospitals can be registered  
✅ Inventory can be added and updated  
✅ Blood requests with sufficient inventory are FULFILLED  
✅ Blood requests with insufficient inventory are PENDING  
✅ Inventory quantity decreases when requests fulfilled  
✅ Validation errors return appropriate status codes  
✅ Pagination works correctly  

---

**Ready to Demo!** 🎉
