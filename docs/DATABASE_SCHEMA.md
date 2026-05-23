# Database Schema & Design

## Overview

The Indoor Smart Venue Navigation System uses **MongoDB** with Mongoose ODM. The database is structured to support multi-building, multi-floor, and multi-venue management with navigation capabilities.

---

## Collections (Tables)

### 1. Users Collection

Stores user accounts with authentication credentials.

```javascript
{
  _id: ObjectId,
  email: String (unique, required),
  password: String (hashed, required),
  name: String,
  role: String (enum: ['admin', 'visitor']),
  createdAt: Date
}
```

**Indexes:**
- `email` (unique)

**Sample Document:**
```json
{
  "_id": ObjectId("507f1f77bcf86cd799439011"),
  "email": "admin@mall.com",
  "password": "$2a$10$hashed_password_string",
  "name": "Mall Admin",
  "role": "admin",
  "createdAt": ISODate("2024-02-26T10:00:00Z")
}
```

---

### 2. Buildings Collection

Represents a venue building (mall, hospital, airport, etc.).

```javascript
{
  _id: ObjectId,
  name: String (required),
  description: String,
  createdBy: ObjectId (ref: User),
  qrCodeUrl: String,
  qrCodeData: String (encoded URL),
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes:**
- `createdBy`
- `createdAt`

**Sample Document:**
```json
{
  "_id": ObjectId("507f1f77bcf86cd799439012"),
  "name": "Downtown Shopping Mall",
  "description": "3-story shopping center with 150+ stores",
  "createdBy": ObjectId("507f1f77bcf86cd799439011"),
  "qrCodeUrl": "https://storage.example.com/qr-507f1f77bcf86cd799439012.png",
  "qrCodeData": "http://localhost:3000/scan/507f1f77bcf86cd799439012",
  "createdAt": ISODate("2024-02-26T10:00:00Z"),
  "updatedAt": ISODate("2024-02-26T10:00:00Z")
}
```

---

### 3. Floors Collection

Represents individual floors within a building.

```javascript
{
  _id: ObjectId,
  buildingId: ObjectId (ref: Building, required),
  floorNumber: Number (required),
  mapImageUrl: String,
  width: Number (default: 800, pixels),
  height: Number (default: 600, pixels),
  createdAt: Date
}
```

**Indexes:**
- `buildingId`
- `buildingId, floorNumber` (compound, unique)

**Sample Document:**
```json
{
  "_id": ObjectId("507f1f77bcf86cd799439013"),
  "buildingId": ObjectId("507f1f77bcf86cd799439012"),
  "floorNumber": 1,
  "mapImageUrl": "https://storage.example.com/floor1-map.png",
  "width": 800,
  "height": 600,
  "createdAt": ISODate("2024-02-26T10:00:00Z")
}
```

---

### 4. Venues Collection

Represents specific locations/shops/services within a floor.

```javascript
{
  _id: ObjectId,
  floorId: ObjectId (ref: Floor, required),
  name: String (required),
  description: String,
  coordinates: {
    x: Number (required),
    y: Number (required)
  },
  category: String,
  photos: [String] (array of image URLs),
  tags: [String],
  graphNodeId: String (UUID for navigation),
  createdAt: Date
}
```

**Indexes:**
- `floorId`
- `name` (text search)
- `tags` (for filtering)

**Sample Document:**
```json
{
  "_id": ObjectId("507f1f77bcf86cd799439014"),
  "floorId": ObjectId("507f1f77bcf86cd799439013"),
  "name": "StarBucks Coffee",
  "description": "Premium coffee and pastries",
  "coordinates": {
    "x": 150,
    "y": 200
  },
  "category": "Café",
  "photos": [
    "https://storage.example.com/starbucks-1.jpg",
    "https://storage.example.com/starbucks-2.jpg"
  ],
  "tags": ["coffee", "breakfast", "wifi"],
  "graphNodeId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "createdAt": ISODate("2024-02-26T10:00:00Z")
}
```

---

### 5. NavGraphs Collection

Stores graph data for navigation pathfinding (Dijkstra's algorithm).

```javascript
{
  _id: ObjectId,
  floorId: ObjectId (ref: Floor, unique, required),
  nodes: [
    {
      id: String (UUID),
      x: Number,
      y: Number,
      label: String
    }
  ],
  edges: [
    {
      from: String (node ID),
      to: String (node ID),
      weight: Number (distance in pixels)
    }
  ],
  createdAt: Date
}
```

**Indexes:**
- `floorId` (unique)

**Sample Document:**
```json
{
  "_id": ObjectId("507f1f77bcf86cd799439015"),
  "floorId": ObjectId("507f1f77bcf86cd799439013"),
  "nodes": [
    {
      "id": "entrance",
      "x": 10,
      "y": 20,
      "label": "Main Entrance"
    },
    {
      "id": "a1b2c3d4",
      "x": 150,
      "y": 200,
      "label": "Starbucks Coffee"
    },
    {
      "id": "b2c3d4e5",
      "x": 300,
      "y": 150,
      "label": "Restroom"
    }
  ],
  "edges": [
    {
      "from": "entrance",
      "to": "a1b2c3d4",
      "weight": 185.5
    },
    {
      "from": "a1b2c3d4",
      "to": "b2c3d4e5",
      "weight": 175.3
    },
    {
      "from": "entrance",
      "to": "b2c3d4e5",
      "weight": 250.2
    }
  ],
  "createdAt": ISODate("2024-02-26T10:00:00Z")
}
```

---

## ER Diagram

```
Users
  └── has many → Buildings
                   └── has many → Floors
                                   └── has many → Venues
                                   └── has one → NavGraphs
```

### Relationships

1. **User → Building** (One-to-Many)
   - A user (admin) can create multiple buildings
   - Each building references one user via `createdBy`

2. **Building → Floor** (One-to-Many)
   - A building can have multiple floors
   - Each floor references one building via `buildingId`

3. **Floor → Venue** (One-to-Many)
   - A floor can have multiple venues
   - Each venue references one floor via `floorId`

4. **Floor → NavGraph** (One-to-One)
   - Each floor has one navigation graph
   - NavGraph references floor via `floorId` (unique index)

---

## Data Types & Validation

| Field | Type | Required | Unique | Min | Max |
|-------|------|----------|--------|-----|-----|
| email | String | ✓ | ✓ | 5 | 255 |
| password | String | ✓ | ✗ | 6 | 255 |
| buildingName | String | ✓ | ✗ | 1 | 100 |
| description | String | ✗ | ✗ | 0 | 1000 |
| floorNumber | Number | ✓ | ✗ | 0 | 100 |
| coordinates.x | Number | ✓ | ✗ | 0 | 10000 |
| coordinates.y | Number | ✓ | ✗ | 0 | 10000 |

---

## Query Examples

### Find all buildings created by a user

```javascript
db.buildings.find({ createdBy: ObjectId("507f1f77bcf86cd799439011") })
```

### Find all venues on a floor

```javascript
db.venues.find({ floorId: ObjectId("507f1f77bcf86cd799439013") })
```

### Search venues by name or tags

```javascript
db.venues.find({
  floorId: ObjectId("507f1f77bcf86cd799439013"),
  $or: [
    { name: { $regex: "coffee", $options: "i" } },
    { tags: "coffee" }
  ]
})
```

### Get navigation graph for a floor

```javascript
db.navgraphs.findOne({ floorId: ObjectId("507f1f77bcf86cd799439013") })
```

### Find closest venues to a point

```javascript
db.venues.find({
  floorId: ObjectId("507f1f77bcf86cd799439013"),
  coordinates: {
    $near: {
      $geometry: {
        type: "Point",
        coordinates: [150, 200]
      },
      $maxDistance: 100
    }
  }
})
```

---

## Indexes for Performance

```javascript
// Users
db.users.createIndex({ email: 1 }, { unique: true })

// Buildings
db.buildings.createIndex({ createdBy: 1 })
db.buildings.createIndex({ createdAt: -1 })

// Floors
db.floors.createIndex({ buildingId: 1 })
db.floors.createIndex({ buildingId: 1, floorNumber: 1 }, { unique: true })

// Venues
db.venues.createIndex({ floorId: 1 })
db.venues.createIndex({ name: "text", description: "text" })
db.venues.createIndex({ tags: 1 })

// NavGraphs
db.navgraphs.createIndex({ floorId: 1 }, { unique: true })
```

---

## Data Integrity & Constraints

### Cascade Deletes
When a building is deleted, all related floors and venues should be deleted:

```javascript
// In controller
await Floor.deleteMany({ buildingId: buildingId })
await Venue.deleteMany({ floorId: { $in: floorIds } })
```

### Unique Constraints
- User email must be unique
- Building + Floor combination should be unique (one floor per building)

### Referential Integrity
- `createdBy` in Buildings must reference existing User
- `buildingId` in Floors must reference existing Building
- `floorId` in Venues must reference existing Floor

---

## Scalability Considerations

1. **Sharding**: Shard by `buildingId` for large-scale deployments
2. **Replication**: Use MongoDB replica sets for high availability
3. **Caching**: Cache frequently accessed buildings/floors in Redis
4. **Pagination**: Implement limit/offset for venue lists
5. **Archiving**: Archive old venue data periodically

---

## Backup & Recovery

```bash
# Backup
mongodump --uri "mongodb://localhost:27017/indoor-nav"

# Restore
mongorestore --uri "mongodb://localhost:27017" ./dump/indoor-nav
```

---

## Migration Example

If you need to add a new field to Venues:

```javascript
// Migration script
db.venues.updateMany(
  {},
  { $set: { rating: 0, reviews: [] } }
)
```
