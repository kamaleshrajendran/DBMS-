# API Documentation

## Base URL
```
http://localhost:5000/api
```

## Authentication
All protected endpoints require JWT token in header:
```
Authorization: Bearer <token>
```

---

## Auth Endpoints

### Register User
```http
POST /auth/register
Content-Type: application/json

{
  "email": "admin@example.com",
  "password": "password123",
  "name": "Admin User"
}
```

**Response (201):**
```json
{
  "message": "User registered successfully",
  "token": "eyJhbGc...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "email": "admin@example.com",
    "role": "admin"
  }
}
```

### Login
```http
POST /auth/login
Content-Type: application/json

{
  "email": "admin@example.com",
  "password": "password123"
}
```

**Response (200):**
```json
{
  "message": "Login successful",
  "token": "eyJhbGc...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "email": "admin@example.com",
    "role": "admin"
  }
}
```

---

## Building Endpoints (Admin)

### Create Building
```http
POST /admin/buildings
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "City Mall",
  "description": "Downtown shopping mall"
}
```

**Response (201):**
```json
{
  "message": "Building created successfully",
  "building": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "City Mall",
    "description": "Downtown shopping mall",
    "qrCodeData": "http://localhost:3000/scan/507f1f77bcf86cd799439011",
    "createdAt": "2024-02-26T10:00:00Z"
  }
}
```

### Get All Buildings
```http
GET /admin/buildings
```

**Response (200):**
```json
{
  "buildings": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "name": "City Mall",
      "description": "Downtown shopping mall",
      "createdBy": {
        "_id": "507f1f77bcf86cd799439012",
        "name": "Admin User",
        "email": "admin@example.com"
      }
    }
  ]
}
```

### Get Building by ID
```http
GET /admin/buildings/:buildingId
```

### Update Building
```http
PUT /admin/buildings/:buildingId
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Updated Mall Name",
  "description": "Updated description"
}
```

### Delete Building
```http
DELETE /admin/buildings/:buildingId
Authorization: Bearer <token>
```

### Download QR Code
```http
GET /admin/buildings/:buildingId/qr
```

**Response:** PNG image file

---

## Floor Endpoints (Admin)

### Add Floor
```http
POST /admin/buildings/:buildingId/floors
Authorization: Bearer <token>
Content-Type: application/json

{
  "floorNumber": 1,
  "mapImageUrl": "https://example.com/floor1.png",
  "width": 800,
  "height": 600
}
```

**Response (201):**
```json
{
  "message": "Floor added",
  "floor": {
    "_id": "507f1f77bcf86cd799439013",
    "buildingId": "507f1f77bcf86cd799439011",
    "floorNumber": 1,
    "mapImageUrl": "https://example.com/floor1.png",
    "width": 800,
    "height": 600,
    "createdAt": "2024-02-26T10:00:00Z"
  }
}
```

### Get Floors for Building
```http
GET /admin/buildings/:buildingId/floors
```

### Get Single Floor
```http
GET /admin/floors/:floorId
```

### Update Floor
```http
PUT /admin/floors/:floorId
Authorization: Bearer <token>
Content-Type: application/json

{
  "mapImageUrl": "https://example.com/updated.png"
}
```

### Delete Floor
```http
DELETE /admin/floors/:floorId
Authorization: Bearer <token>
```

---

## Venue Endpoints (Admin)

### Add Venue
```http
POST /admin/floors/:floorId/venues
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Coffee Shop",
  "description": "Best coffee in town",
  "x": 150,
  "y": 200,
  "category": "Café",
  "photos": ["https://example.com/photo1.jpg"],
  "tags": ["coffee", "breakfast"]
}
```

**Response (201):**
```json
{
  "message": "Venue added",
  "venue": {
    "_id": "507f1f77bcf86cd799439014",
    "floorId": "507f1f77bcf86cd799439013",
    "name": "Coffee Shop",
    "description": "Best coffee in town",
    "coordinates": { "x": 150, "y": 200 },
    "category": "Café",
    "graphNodeId": "uuid-string",
    "photos": ["https://example.com/photo1.jpg"],
    "tags": ["coffee", "breakfast"]
  }
}
```

### Get Venues for Floor
```http
GET /admin/floors/:floorId/venues
```

### Get Single Venue
```http
GET /admin/venues/:venueId
```

### Update Venue
```http
PUT /admin/venues/:venueId
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Updated Name",
  "description": "Updated description"
}
```

### Delete Venue
```http
DELETE /admin/venues/:venueId
Authorization: Bearer <token>
```

### Search Venues
```http
GET /admin/venues/search?q=coffee&floorId=507f1f77bcf86cd799439013
```

**Response (200):**
```json
{
  "venues": [
    {
      "_id": "507f1f77bcf86cd799439014",
      "name": "Coffee Shop",
      "category": "Café"
    }
  ]
}
```

---

## Visitor Endpoints

### Get Building (Public)
```http
GET /visitor/buildings/:buildingId
```

### Get Building Floors (Public)
```http
GET /visitor/buildings/:buildingId/floors
```

### Calculate Route
```http
POST /visitor/navigation/route
Authorization: Bearer <token>
Content-Type: application/json

{
  "floorId": "507f1f77bcf86cd799439013",
  "startNodeId": "entrance",
  "endNodeId": "uuid-string-of-venue"
}
```

**Response (200):**
```json
{
  "path": [
    { "x": 10, "y": 20 },
    { "x": 50, "y": 20 },
    { "x": 150, "y": 200 }
  ],
  "pathNodeIds": ["entrance", "..."],
  "distance": 245.5,
  "steps": [
    "Go right for 40m towards Corridor A",
    "Turn down for 180m to reach Coffee Shop"
  ]
}
```

### Create Navigation Graph
```http
POST /visitor/navigation/graph
Authorization: Bearer <token>
Content-Type: application/json

{
  "floorId": "507f1f77bcf86cd799439013",
  "nodes": [
    { "id": "entrance", "x": 10, "y": 20, "label": "Main Entrance" },
    { "id": "venue1", "x": 150, "y": 200, "label": "Coffee Shop" }
  ],
  "edges": [
    { "from": "entrance", "to": "venue1", "weight": 185 }
  ]
}
```

### Get Navigation Graph
```http
GET /visitor/navigation/graph/:floorId
```

---

## Error Responses

### 400 Bad Request
```json
{
  "message": "Email and password required"
}
```

### 401 Unauthorized
```json
{
  "message": "Invalid token"
}
```

### 403 Forbidden
```json
{
  "message": "Admin access required"
}
```

### 404 Not Found
```json
{
  "message": "Building not found"
}
```

### 500 Server Error
```json
{
  "message": "Internal server error",
  "error": "Error details"
}
```

---

## Rate Limiting

Current implementation does not have rate limiting. In production, implement:

```javascript
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
});

app.use('/api/', limiter);
```

---

## CORS Headers

Frontend to Backend CORS is enabled. Allowed origins can be configured in `app.js`:

```javascript
cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000'
})
```

---

## Pagination (Future)

Endpoints can be extended with pagination:

```http
GET /admin/buildings?page=1&limit=10
```

Response would include:
```json
{
  "buildings": [...],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 50,
    "pages": 5
  }
}
```
