# Emergency Blood Finder Feature

## Overview
This feature helps hospitals and patients find alternative blood sources when their primary hospital doesn't have the required blood type available. The system automatically searches through a network of hospitals and blood banks to find up to 5 alternative sources with available blood.

## How It Works

### 1. **API Endpoint**
- **URL**: `/api/hospitals/alternative-blood-sources`
- **Method**: GET
- **Purpose**: Finds blood banks and hospitals with available blood inventory

#### Query Parameters:
- `bloodGroup` (required): The blood group needed (e.g., A_POSITIVE, O_NEGATIVE)
- `city` (optional): Filter by city to prioritize local sources
- `minQuantity` (optional): Minimum units required (default: 1)
- `limit` (optional): Maximum number of sources to return (default: 5)

#### Example Request:
```
GET /api/hospitals/alternative-blood-sources?bloodGroup=O_POSITIVE&city=Mumbai&minQuantity=2&limit=5
```

#### Example Response:
```json
{
  "success": true,
  "data": [
    {
      "id": "...",
      "name": "Central Blood Bank",
      "type": "blood_bank",
      "email": "contact@centralbloodbank.com",
      "phone": "+912226789012",
      "address": "123 Main Street, Andheri",
      "city": "Mumbai",
      "state": "Maharashtra",
      "pincode": "400058",
      "availableUnits": 60,
      "bloodGroup": "O_POSITIVE",
      "operatingHours": "24/7"
    },
    // ... more sources
  ],
  "metadata": {
    "bloodGroup": "O_POSITIVE",
    "requestedCity": "Mumbai",
    "minQuantity": 2,
    "totalFound": 5,
    "bloodBanks": 2,
    "hospitals": 3
  }
}
```

### 2. **React Component**
- **Component**: `AlternativeBloodSources`
- **Location**: `src/components/features/AlternativeBloodSources.tsx`

#### Usage:
```tsx
import { AlternativeBloodSources } from '@/components';

<AlternativeBloodSources
  bloodGroup="O_POSITIVE"
  city="Mumbai"
  minQuantity={2}
  onSourceSelect={(source) => {
    console.log('Selected:', source);
    // Handle source selection
  }}
/>
```

#### Props:
- `bloodGroup` (string, required): Blood group to search for
- `city` (string, optional): City filter
- `minQuantity` (number, optional): Minimum units required
- `onSourceSelect` (function, optional): Callback when a source is selected

### 3. **Emergency Blood Finder Page**
- **URL**: `/emergency-blood-finder`
- **Purpose**: User-facing page to search for alternative blood sources

#### Features:
- Search form with blood group selection
- City filter for local results
- Minimum quantity specification
- Displays up to 5 alternative sources with:
  - Contact information (phone, email, emergency phone)
  - Address and location
  - Operating hours
  - Available blood units
  - Hospital/Blood bank type indicator

## Database Structure

### Hospitals Table
```sql
- id: UUID
- name: String
- email: String (unique)
- phone: String
- emergencyPhone: String (optional)
- address, city, state, pincode
- totalBeds: Integer
- hasBloodBank: Boolean
- isActive: Boolean
- isVerified: Boolean
```

### Blood Banks Table
```sql
- id: UUID
- name: String
- email: String (unique)
- phone: String
- address, city, state, pincode
- operatingHours: String
- isActive: Boolean
- isVerified: Boolean
```

### Blood Inventory Table
```sql
- id: UUID
- bloodGroup: Enum
- quantity: Integer (in units)
- bloodBankId: UUID (foreign key)
- lastUpdated: DateTime
- expiryDate: DateTime
```

## Sample Data

The system includes 5 hospitals:
1. **City General Hospital** - Mumbai (no blood bank)
2. **Apollo Hospital** - Mumbai (has blood bank)
3. **Lilavati Hospital** - Mumbai (has blood bank)
4. **Fortis Hospital** - New Delhi (has blood bank)
5. **Max Super Speciality Hospital** - New Delhi (has blood bank)

Plus 2 dedicated blood banks:
1. **Central Blood Bank** - Mumbai (24/7)
2. **Lifesaver Blood Bank** - New Delhi (8 AM - 8 PM)

## Testing the Feature

### Step 1: Access the Emergency Blood Finder
Navigate to: `http://localhost:3000/emergency-blood-finder`

### Step 2: Search for Blood
1. Select a blood group (e.g., O POSITIVE)
2. Optionally enter a city (e.g., Mumbai)
3. Set minimum units required (e.g., 1)
4. Click "Search Blood Sources"

### Step 3: View Results
The system will display:
- List of available sources with contact details
- Number of available units
- Operating hours
- Emergency contact numbers
- Direct links to call or email

### Step 4: Test the API Directly
```bash
# Using curl
curl "http://localhost:3000/api/hospitals/alternative-blood-sources?bloodGroup=O_POSITIVE&city=Mumbai&limit=5"

# Using browser
http://localhost:3000/api/hospitals/alternative-blood-sources?bloodGroup=O_POSITIVE&city=Mumbai
```

## Benefits

1. **Emergency Response**: Quickly find alternative blood sources in urgent situations
2. **Network Effect**: Connect hospitals and blood banks for better resource sharing
3. **Location-Based**: Prioritize nearby sources for faster delivery
4. **Real-Time Data**: Shows actual available blood units
5. **Contact Information**: Direct phone and email for immediate communication

## Future Enhancements

1. **Distance Calculation**: Show distance from user's location
2. **Real-Time Updates**: WebSocket notifications when blood becomes available
3. **Booking System**: Direct blood reservation through the platform
4. **Rating System**: Feedback and ratings for sources
5. **Emergency Alerts**: Notify nearby hospitals of critical blood shortages
6. **Mobile App**: Native mobile app for faster access
7. **SMS Notifications**: Alert system for registered hospitals

## Mentor Feedback Implementation

This feature directly addresses the mentor's feedback about connecting multiple hospitals:
- ✅ Shows list of 5 hospitals/blood banks
- ✅ Helps when one hospital doesn't have blood
- ✅ Provides urgency handling with emergency contacts
- ✅ Enables inter-hospital connectivity
- ✅ Real-time blood availability checking

## Access the Feature

1. **Web Interface**: http://localhost:3000/emergency-blood-finder
2. **API Endpoint**: http://localhost:3000/api/hospitals/alternative-blood-sources
3. **Component**: Import from `@/components/features/AlternativeBloodSources`
