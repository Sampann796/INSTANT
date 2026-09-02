# INSTANT API Documentation

**Base URL:**  
https://instant-pt2m.onrender.com

## Dashboard

### Get Dashboard Analytics

**GET** `/api/dashboard?range=30d`

Returns dashboard analytics including bookings, customers, vehicles, mechanics and revenue.

### Query Parameters

- `range=7d` — Last 7 days
- `range=30d` — Last 30 days
- `range=90d` — Last 90 days

**Example:**

`GET /api/dashboard?range=30d`

---

## Bookings

### Get All Bookings

**GET** `/api/bookings`

Returns a list of bookings.

### Get Booking by ID

**GET** `/api/bookings/:id`

Returns details of a specific booking.

**Example:**

`GET /api/bookings/BOOKING_ID`

### Update Booking Status

**PATCH** `/api/bookings/:id/status`

Updates the booking status and creates a status history record.

**Request Body:**

```json
{
  "status": "in_progress",
  "changedBy": "Admin",
  "note": "Vehicle service started"
}

Supported Statuses:

pending

assigned

on_the_way

in_progress

completed

cancelled

Mechanics
Get All Mechanics
GET /api/mechanics

Returns a list of mechanics.

Get Mechanic by ID
GET /api/mechanics/:id

Returns details of a specific mechanic.

Customers
Get All Customers
GET /api/customers

Returns a list of customers.

Get Customer by ID
GET /api/customers/:id

Returns details of a specific customer.

Services
Get All Services
GET /api/services

Returns a list of services.

Get Service by ID
GET /api/services/:id

Returns details of a specific service.

Real-Time Updates
INSTANT uses Socket.IO for real-time booking status updates.

When a booking status changes, the backend emits:

booking:updated

The event contains the booking ID, previous status, new status and status history information.

Technologies
Next.js

Node.js

Express.js

MongoDB

Mongoose

Socket.IO

Recharts

