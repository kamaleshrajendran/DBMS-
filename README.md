# Indoor Smart Venue Navigation System

A full-stack web application for creating, managing, and navigating indoor venue maps with QR code support.

## Features

✅ **Admin Module**
- Create and manage buildings
- Upload floor-wise indoor maps
- Pinpoint venues on maps with details and photos
- Generate unique QR codes for buildings
- Add multiple floors and search venues

✅ **Visitor Module**
- Scan QR codes to access venue maps
- View floor plans with pinned locations
- Search and select venues
- Get real-time navigation with step-by-step directions
- View venue details and photos

✅ **Navigation Engine**
- Dijkstra's shortest path algorithm
- Turn-by-turn directions
- Visual route overlay on map
- Support for multi-floor navigation

## Tech Stack

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB
- **Authentication**: JWT
- **QR Code**: QRCode.js
- **Other**: Mongoose, CORS, bcryptjs

### Frontend
- **Framework**: React 18
- **Router**: React Router v6
- **HTTP Client**: Axios
- **QR Scanner**: html5-qrcode
- **Styling**: CSS3

## Project Structure

```
.
├── backend/
│   ├── src/
│   │   ├── controllers/     # Route handlers
│   │   ├── models/          # MongoDB schemas
│   │   ├── routes/          # API endpoints
│   │   ├── services/        # Business logic
│   │   ├── middleware/      # Auth & validation
│   │   ├── config/          # DB & env config
│   │   └── app.js           # Express app
│   ├── package.json
│   └── .env.example
│
└── frontend/
    ├── src/
    │   ├── components/      # Reusable components
    │   ├── pages/           # Page components
    │   ├── services/        # API calls
    │   ├── styles/          # CSS files
    │   ├── App.jsx
    │   └── index.jsx
    ├── public/
    └── package.json
```

## Installation

### Backend Setup

```bash
cd backend
npm install

# Create .env file
cp .env.example .env

# Edit .env with your configuration
# MONGODB_URI=mongodb://localhost:27017/indoor-nav
# JWT_SECRET=your-secret-key
# PORT=5000

# Start MongoDB (if local)
mongod

# Start server
npm run dev
```

### Frontend Setup

```bash
cd frontend
npm install

# Create .env file (optional)
# REACT_APP_API_URL=http://localhost:5000/api

# Start dev server
npm start
```

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration

### Admin (Protected)
- `POST /api/admin/buildings` - Create building
- `GET /api/admin/buildings` - List buildings
- `GET /api/admin/buildings/:id` - Get building details
- `GET /api/admin/buildings/:id/qr` - Download QR code
- `POST /api/admin/buildings/:buildingId/floors` - Add floor
- `GET /api/admin/buildings/:buildingId/floors` - List floors
- `POST /api/admin/floors/:floorId/venues` - Add venue
- `GET /api/admin/floors/:floorId/venues` - List venues

### Visitor (Public)
- `GET /api/visitor/buildings/:id` - Get building for scanning
- `GET /api/visitor/buildings/:buildingId/floors` - Get floors
- `POST /api/visitor/navigation/route` - Calculate route (with auth)
- `GET /api/visitor/navigation/graph/:floorId` - Get navigation graph

## Usage

### Admin Workflow
1. Register/Login as Admin
2. Create a new building
3. Upload floor maps (image URL)
4. Pinpoint venues on each floor with details
5. Generate QR code (downloadable)
6. Share QR code in physical location

### Visitor Workflow
1. Scan QR code using app
2. Select desired floor
3. Search or browse venues
4. Click venue to see location and route
5. Follow step-by-step directions

## Database Schema

### Collections
- **Users**: Admin & visitor accounts
- **Buildings**: Venue buildings/locations
- **Floors**: Floor plans within buildings
- **Venues**: Specific locations (shops, offices, etc.)
- **NavGraphs**: Navigation graphs for pathfinding

## Key Features Implementation

### Dijkstra's Algorithm
Shortest path calculation between two points on a floor with turn-by-turn directions.

### QR Code Generation
Dynamic QR codes linking to specific buildings with secure URLs.

### Multi-Floor Support
Navigate between different floor levels with floor selector.

### Responsive UI
Works on desktop, tablet, and mobile devices.

## Future Enhancements

- Indoor GPS simulation
- Live crowd density heatmap
- Voice navigation
- Dark mode
- Real-time location tracking
- Offline map support
- Analytics dashboard
- A* pathfinding optimization

## Security Features

- JWT authentication for admin routes
- Password hashing with bcryptjs
- Role-based access control
- Input validation on all endpoints
- CORS enabled for frontend-backend communication

## Deployment

### Backend (Heroku/Railway)
```bash
heroku login
heroku create your-app-name
git push heroku main
```

### Frontend (Vercel/Netlify)
```bash
npm run build
# Deploy build folder to Vercel/Netlify
```

## Development

### Running Tests
```bash
npm test
```

### Code Quality
- Use ESLint for linting
- Format with Prettier
- Follow REST API conventions

## Support & Resources

For detailed technical information, see the `docs/` directory:
- [API Reference](docs/API_REFERENCE.md)
- [System Architecture](docs/ARCHITECTURE.md)
- [Database Schema](docs/DATABASE_SCHEMA.md)
- [Testing Guide](docs/TESTING_GUIDE.md)

Automation scripts are available in the `scripts/` directory:
- `install.bat`: Automated setup for Windows
- `install.ps1`: Automated setup for PowerShell
- `setup-mongodb.ps1`: MongoDB installation helper

## Support & Contributing

For issues or contributions, please create a GitHub issue or pull request.

## License

MIT License - feel free to use this project!

