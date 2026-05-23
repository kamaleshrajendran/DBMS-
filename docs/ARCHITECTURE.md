# Architecture Overview

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      FRONTEND (React)                        │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ - Admin Dashboard (Map Editor, QR Generation)        │   │
│  │ - Visitor View (Map Display, Navigation)             │   │
│  │ - QR Scanner (Mobile-friendly)                       │   │
│  │ - Route Display (Canvas overlay, turn-by-turn)       │   │
│  └──────────────────────────────────────────────────────┘   │
│  Port: 3000                                                  │
└─────────────────────────────────────────────────────────────┘
                            ↓ HTTP/REST (Axios)
┌─────────────────────────────────────────────────────────────┐
│                   BACKEND (Node.js/Express)                  │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ Routes Layer                                         │   │
│  │ - /auth (login, register)                           │   │
│  │ - /admin (buildings, floors, venues)                │   │
│  │ - /visitor (public access, navigation)              │   │
│  └──────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ Controllers Layer                                    │   │
│  │ - Auth, Building, Floor, Venue, Navigation          │   │
│  └──────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ Services Layer                                       │   │
│  │ - QR Code Generation (QRCode.js)                    │   │
│  │ - Navigation Engine (Dijkstra's Algorithm)          │   │
│  │ - Business Logic                                    │   │
│  └──────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ Middleware                                           │   │
│  │ - JWT Authentication                                │   │
│  │ - Role-based Authorization                          │   │
│  │ - CORS, Input Validation                            │   │
│  └──────────────────────────────────────────────────────┘   │
│  Port: 5000                                                  │
└─────────────────────────────────────────────────────────────┘
                            ↓ MongoDB Driver
┌─────────────────────────────────────────────────────────────┐
│                 DATA LAYER (MongoDB)                         │
│  Collections:                                                │
│  - Users (auth)                                              │
│  - Buildings                                                 │
│  - Floors                                                    │
│  - Venues                                                    │
│  - NavGraphs (pathfinding)                                   │
│  Port: 27017                                                 │
└─────────────────────────────────────────────────────────────┘
```

---

## Component Interaction Flow

### Admin Workflow

```
┌─────────────┐
│   Login     │
└──────┬──────┘
       ↓
┌─────────────────────────────────┐
│    Admin Dashboard              │
├─────────────────────────────────┤
│  1. Create Building             │
│  2. Upload Floor Map (image)    │
│  3. Pin Venues on Map           │
│  4. Add Venue Details & Photos  │
│  5. Generate QR Code            │
└──────┬──────────────────────────┘
       ↓
┌────────────────────┐
│   QR Code (PNG)    │
│  (Downloadable)    │
└────────────────────┘
```

### Visitor Workflow

```
┌─────────────────────────────┐
│  Scan QR Code (Phone)       │
│  (html5-qrcode library)     │
└──────┬──────────────────────┘
       ↓
┌─────────────────────────────┐
│   Load Building Map         │
│   - Fetch building data     │
│   - Show available floors   │
└──────┬──────────────────────┘
       ↓
┌──────────────────────────────┐
│  Select Floor & Search       │
│  - List all venues on floor  │
│  - Search/filter venues      │
└──────┬───────────────────────┘
       ↓
┌──────────────────────────────┐
│  Select Venue               │
│  - Display venue details    │
│  - Show photos              │
└──────┬───────────────────────┘
       ↓
┌──────────────────────────────────┐
│  Calculate Route (Dijkstra)      │
│  - Start: Entrance (0,0)         │
│  - End: Selected Venue           │
│  - Return: Path + Steps          │
└──────┬───────────────────────────┘
       ↓
┌──────────────────────────────────┐
│  Display Route & Directions      │
│  - Draw path on canvas           │
│  - Show turn-by-turn steps       │
│  - Allow zoom/pan map            │
└──────────────────────────────────┘
```

---

## Key Algorithms

### Dijkstra's Shortest Path

```javascript
// Pseudocode
function dijkstra(graph, start, goal) {
  distances = {}
  previous = {}
  priorityQueue = []
  
  // Initialize
  for each node in graph:
    distances[node] = INFINITY
  distances[start] = 0
  priorityQueue.add(start, 0)
  
  // Main loop
  while priorityQueue not empty:
    current = priorityQueue.pop()
    if current == goal: break
    
    for each edge from current:
      newDistance = distances[current] + edge.weight
      if newDistance < distances[edge.to]:
        distances[edge.to] = newDistance
        previous[edge.to] = current
        priorityQueue.add(edge.to, newDistance)
  
  // Reconstruct path
  path = []
  node = goal
  while previous[node]:
    path.unshift(node)
    node = previous[node]
  path.unshift(start)
  
  return { path, distance: distances[goal] }
}
```

**Complexity:**
- Time: O((V + E) log V) with binary heap
- Space: O(V + E)

### QR Code Generation

```javascript
// Using qrcode library
const QRCode = require('qrcode');

async function generateQR(data) {
  const buffer = await QRCode.toBuffer(data, {
    type: 'image/png',
    width: 300,
    errorCorrectionLevel: 'H'
  });
  return buffer; // Save to storage
}
```

**Encoded Data:**
```
https://app.example.com/scan/[buildingId]
```

---

## Authentication Flow

```
User Login
    ↓
┌──────────────────────┐
│ POST /api/auth/login │
│ email, password      │
└──────┬───────────────┘
       ↓
┌──────────────────────────────┐
│ Verify credentials           │
│ - Find user by email         │
│ - Compare password (bcrypt)  │
└──────┬───────────────────────┘
       ↓
    YES
       ↓
┌──────────────────────────────┐
│ Generate JWT Token           │
│ - Header: { alg: HS256 }     │
│ - Payload: { userId, role }  │
│ - Secret: JWT_SECRET         │
└──────┬───────────────────────┘
       ↓
┌──────────────────────────────┐
│ Return token to client       │
│ - Store in localStorage      │
│ - Add to Authorization header│
└──────────────────────────────┘

Protected Request
    ↓
┌───────────────────────────────────┐
│ Include header:                   │
│ Authorization: Bearer [token]     │
└──────┬────────────────────────────┘
       ↓
┌─────────────────────────────┐
│ Middleware: authenticate    │
│ - Extract token from header │
│ - Verify signature          │
│ - Check expiration          │
│ - Extract user info         │
└──────┬──────────────────────┘
       ↓
   VALID
       ↓
┌─────────────────────────────┐
│ Check role authorization    │
│ - isAdmin middleware check  │
└──────┬──────────────────────┘
       ↓
   ALLOWED
       ↓
┌─────────────────────────────┐
│ Execute route handler       │
└─────────────────────────────┘
```

---

## File Upload & Storage Strategy

### Current Implementation (Placeholder)
```
User uploads image URL (external)
    ↓
URL stored in database (Floor.mapImageUrl)
    ↓
Frontend loads from external source
```

### Production Implementation (Recommended)
```
User uploads file
    ↓
Node.js receives multipart/form-data
    ↓
├─ Local: Save to /uploads folder
├─ AWS S3: Upload to S3 bucket
└─ Firebase: Upload to Firebase Storage
    ↓
Return signed URL or public URL
    ↓
Store URL in database
```

---

## Error Handling Strategy

```
Request
    ↓
Route Handler
    ↓
Try-Catch Block
    ↓
    ├─ Success → Response 200/201
    │
    └─ Error → Error Handler
        ├─ Type: Input Validation → 400
        ├─ Type: Authentication → 401
        ├─ Type: Authorization → 403
        ├─ Type: Not Found → 404
        └─ Type: Server Error → 500
            ↓
        Log Error
            ↓
        Return Error Response
```

---

## Security Implementation

1. **Password Security**
   - Bcryptjs hashing (salt rounds: 10)
   - Never store plain text passwords

2. **Authentication**
   - JWT tokens with expiration (7 days)
   - Refresh token strategy (future)

3. **Authorization**
   - Role-based middleware
   - Endpoint protection

4. **Data Protection**
   - Input validation (express-validator)
   - SQL injection prevention (MongoDB safe)
   - XSS prevention (sanitization)

5. **CORS**
   - Enabled for localhost development
   - Restrict to frontend domain in production

---

## Performance Optimization

1. **Database**
   - Indexes on frequently queried fields
   - Compound indexes for multi-field queries
   - Connection pooling

2. **Frontend**
   - React lazy loading for routes
   - Image optimization
   - Component memoization

3. **Backend**
   - Caching strategies
   - Pagination for large datasets
   - Compression (gzip)

4. **Deployment**
   - CDN for static assets
   - Load balancing
   - Database replication

---

## Deployment Architecture

```
┌─────────────────────────────┐
│     CDN (Cloudflare)        │
│  - Static assets            │
│  - Images cache             │
└──────────┬──────────────────┘
           ↓
┌────────────────────────────────┐
│  Load Balancer                 │
│  (AWS ALB / Nginx)             │
└──────────┬─────────────────────┘
           ↓
    ┌──────┴──────┐
    ↓             ↓
┌────────────┐  ┌────────────┐
│ Backend #1 │  │ Backend #2 │ (Replicas)
│ Node.js    │  │ Node.js    │
└─────┬──────┘  └─────┬──────┘
      └────────┬──────┘
               ↓
    ┌────────────────────┐
    │ MongoDB Replica Set│
    │ - Primary          │
    │ - Secondary #1     │
    │ - Secondary #2     │
    └────────────────────┘
```

---

## Technology Rationale

| Component | Choice | Reason |
|-----------|--------|--------|
| Backend | Node.js | Fast, event-driven, JS ecosystem |
| Framework | Express | Lightweight, flexible, widely used |
| Database | MongoDB | Document-based, flexible schema, scalable |
| Frontend | React | Component-based, fast rendering, ecosystem |
| Auth | JWT | Stateless, scalable, secure |
| QR Codes | QRCode.js | Simple, lightweight, no backend rendering |
| Navigation | Dijkstra | Proven, efficient, well-understood |

---

## Monitoring & Logging (Recommended)

```javascript
// Add these in production:

// Logging
const winston = require('winston');
logger.info('Building created:', buildingId);
logger.error('Database error:', err);

// Error Tracking
const Sentry = require("@sentry/node");
Sentry.captureException(error);

// Performance Monitoring
const newrelic = require('newrelic');

// API Monitoring
const prometheus = require('prom-client');
```

---

## Scalability Path

```
Phase 1: MVP (Current)
├─ Single server
├─ Local MongoDB
└─ Basic features

Phase 2: Production
├─ Load balancing
├─ MongoDB replica set
├─ Caching layer (Redis)
└─ CDN for assets

Phase 3: Enterprise Scale
├─ Microservices
├─ Database sharding
├─ Message queues (RabbitMQ)
├─ Elasticsearch for search
└─ Real-time features (WebSockets)
```
