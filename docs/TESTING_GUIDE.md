# Testing & Quality Assurance Guide

## Testing Strategy

### Unit Tests

**Backend - Authentication Controller**
```javascript
// test/auth.test.js
const request = require('supertest');
const app = require('../src/app');

describe('Auth Endpoints', () => {
  
  test('POST /auth/register should create user', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User'
      });
    
    expect(res.statusCode).toBe(201);
    expect(res.body.user.email).toBe('test@example.com');
    expect(res.body.token).toBeDefined();
  });

  test('POST /auth/login should return token', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'test@example.com',
        password: 'password123'
      });
    
    expect(res.statusCode).toBe(200);
    expect(res.body.token).toBeDefined();
  });

  test('POST /auth/login with wrong password should fail', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'test@example.com',
        password: 'wrongpassword'
      });
    
    expect(res.statusCode).toBe(401);
  });
});
```

**Backend - Navigation Service**
```javascript
// test/navigation.test.js
const { dijkstra } = require('../src/services/navigation');

describe('Dijkstra Algorithm', () => {
  
  const graph = {
    'entrance': [{ to: 'cafe', weight: 50 }, { to: 'restroom', weight: 100 }],
    'cafe': [{ to: 'entrance', weight: 50 }, { to: 'shop', weight: 75 }],
    'restroom': [{ to: 'entrance', weight: 100 }, { to: 'shop', weight: 60 }],
    'shop': [{ to: 'cafe', weight: 75 }, { to: 'restroom', weight: 60 }]
  };

  test('should find shortest path', () => {
    const result = dijkstra(graph, 'entrance', 'shop');
    
    expect(result.path).toEqual(['entrance', 'cafe', 'shop']);
    expect(result.distance).toBe(125);
  });

  test('should handle same start and end', () => {
    const result = dijkstra(graph, 'entrance', 'entrance');
    
    expect(result.path).toEqual(['entrance']);
    expect(result.distance).toBe(0);
  });
});
```

---

### Frontend Component Tests

**React Component Test**
```javascript
// test/MapCanvas.test.jsx
import { render, screen, fireEvent } from '@testing-library/react';
import MapCanvas from '../src/components/MapCanvas';

describe('MapCanvas Component', () => {
  
  const mockProps = {
    imageUrl: 'https://example.com/map.png',
    pins: [
      { _id: '1', name: 'Cafe', coordinates: { x: 150, y: 200 } }
    ],
    path: [{ x: 10, y: 20 }, { x: 150, y: 200 }],
    selectedVenue: null,
    onPinClick: jest.fn()
  };

  test('should render canvas', () => {
    render(<MapCanvas {...mockProps} />);
    const canvas = screen.getByRole('presentation');
    expect(canvas).toBeInTheDocument();
  });

  test('should zoom in and out', () => {
    const { container } = render(<MapCanvas {...mockProps} />);
    const zoomInBtn = container.querySelector('button:first-child');
    
    fireEvent.click(zoomInBtn);
    // Verify zoom state increased
  });
});
```

---

### Integration Tests

**API Integration Test**
```javascript
// test/integration.test.js
const request = require('supertest');
const app = require('../src/app');

describe('Building CRUD Operations', () => {
  let token;
  let buildingId;

  beforeAll(async () => {
    // Login to get token
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin@test.com', password: 'password123' });
    token = res.body.token;
  });

  test('should create, read, update, delete building', async () => {
    // CREATE
    let res = await request(app)
      .post('/api/admin/buildings')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Test Mall', description: 'Test' });
    
    expect(res.statusCode).toBe(201);
    buildingId = res.body.building._id;

    // READ
    res = await request(app)
      .get(`/api/admin/buildings/${buildingId}`);
    
    expect(res.statusCode).toBe(200);
    expect(res.body.building.name).toBe('Test Mall');

    // UPDATE
    res = await request(app)
      .put(`/api/admin/buildings/${buildingId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Updated Mall' });
    
    expect(res.statusCode).toBe(200);

    // DELETE
    res = await request(app)
      .delete(`/api/admin/buildings/${buildingId}`)
      .set('Authorization', `Bearer ${token}`);
    
    expect(res.statusCode).toBe(200);
  });
});
```

---

### End-to-End Tests (Cypress)

```javascript
// cypress/e2e/admin.cy.js
describe('Admin Dashboard E2E', () => {
  
  beforeEach(() => {
    cy.visit('http://localhost:3000/login');
  });

  it('should login and create building', () => {
    // Login
    cy.get('input[type="email"]').type('admin@test.com');
    cy.get('input[type="password"]').type('password123');
    cy.get('button[type="submit"]').click();

    // Should redirect to admin
    cy.url().should('include', '/admin');

    // Create building
    cy.contains('+ New Building').click();
    cy.get('input[placeholder="Building Name"]').type('Test Mall');
    cy.get('textarea[placeholder="Description"]').type('Test Description');
    cy.contains('Create Building').click();

    // Verify building created
    cy.contains('Test Mall').should('be.visible');
  });

  it('should add floor and venue', () => {
    // Navigate to building
    cy.contains('Test Mall').click();

    // Add floor
    cy.contains('+ Add Floor').click();
    cy.get('input[type="number"]').type('1');
    cy.get('input[placeholder="Map Image URL"]')
      .type('https://via.placeholder.com/800x600');
    cy.contains('Add Floor').click();

    // Add venue
    cy.contains('+ Add Venue Pin').click();
    cy.get('input[placeholder="Venue Name"]').type('Coffee Shop');
    cy.get('textarea[placeholder="Description"]').type('Best coffee');
    cy.contains('Add Venue').click();

    // Verify venue added
    cy.contains('Coffee Shop').should('be.visible');
  });
});
```

---

## Performance Testing

### Load Testing with Artillery

```yaml
# load-test.yml
config:
  target: "http://localhost:5000"
  phases:
    - duration: 60
      arrivalRate: 10
      name: "Ramp up"
    - duration: 120
      arrivalRate: 20
      name: "Sustained load"
    - duration: 60
      arrivalRate: 5
      name: "Ramp down"

scenarios:
  - name: "Building CRUD"
    flow:
      - post:
          url: "/api/admin/buildings"
          headers:
            Authorization: "Bearer {{ token }}"
          json:
            name: "Load Test Building"
```

Run: `artillery run load-test.yml`

---

## Manual Testing Checklist

### Admin Features
- [ ] User registration works
- [ ] User login with valid credentials
- [ ] Login fails with invalid credentials
- [ ] Create building with all fields
- [ ] View all buildings
- [ ] Edit building details
- [ ] Delete building (cascade deletes floors)
- [ ] Upload floor with image URL
- [ ] Pin venue on map
- [ ] Add venue with all details
- [ ] Edit venue information
- [ ] Delete venue
- [ ] Search venues
- [ ] Generate QR code (downloads PNG)
- [ ] QR code is scannable

### Visitor Features
- [ ] Scan QR code (use test QR)
- [ ] Building loads correctly
- [ ] Can select different floors
- [ ] Venues display on map
- [ ] Search functionality works
- [ ] Click venue shows details
- [ ] Navigation calculates route
- [ ] Route displays on map
- [ ] Step-by-step directions shown
- [ ] Zoom in/out works
- [ ] Pan map works
- [ ] Venue photos load

### Responsive Design
- [ ] Works on desktop (1920x1080)
- [ ] Works on tablet (768x1024)
- [ ] Works on mobile (375x667)
- [ ] Touch events work on mobile
- [ ] Forms are mobile-friendly

### Performance
- [ ] Page loads in < 3 seconds
- [ ] Map rendering is smooth
- [ ] No lag on zoom/pan
- [ ] Search is instant
- [ ] Route calculation < 1 second

### Security
- [ ] JWT token required for admin routes
- [ ] Cannot access admin without token
- [ ] Invalid token rejected
- [ ] Passwords are hashed
- [ ] CORS working correctly

---

## Code Quality Tools

### ESLint Setup
```bash
npm install --save-dev eslint eslint-config-airbnb
npx eslint src/**/*.js --fix
```

### Prettier Setup
```bash
npm install --save-dev prettier
npx prettier --write "src/**/*.js"
```

### Code Coverage

```bash
npm install --save-dev jest
npm test -- --coverage
```

Target coverage:
- Statements: > 80%
- Branches: > 75%
- Functions: > 80%
- Lines: > 80%

---

## Continuous Integration

### GitHub Actions Workflow

```yaml
# .github/workflows/test.yml
name: Test

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    
    services:
      mongodb:
        image: mongo:5.0
        options: >-
          --health-cmd mongosh
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 27017:27017

    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      
      - name: Install backend
        run: cd backend && npm install
      
      - name: Run backend tests
        run: cd backend && npm test
      
      - name: Install frontend
        run: cd frontend && npm install
      
      - name: Run frontend tests
        run: cd frontend && npm test
      
      - name: Lint code
        run: npm run lint

      - name: Upload coverage
        uses: codecov/codecov-action@v2
```

---

## Testing Best Practices

1. **Isolation**: Each test should be independent
2. **Cleanup**: Clear database/state after tests
3. **Mocking**: Mock external services
4. **Coverage**: Aim for high code coverage
5. **Naming**: Use descriptive test names
6. **Speed**: Keep tests fast (< 1 second each)
7. **Assertions**: Test one thing per test
8. **Documentation**: Comment complex test logic

---

## Debugging Tips

### Backend Debugging
```javascript
// Add debug logging
console.log('Building created:', building._id);

// Use debugger
debugger; // Pause execution with --inspect flag
node --inspect src/app.js

// Check with curl
curl -X GET http://localhost:5000/api/buildings \
  -H "Authorization: Bearer token"
```

### Frontend Debugging
```javascript
// React DevTools
// React Profiler for performance
// Browser Console for errors
console.log('Component mounted');

// Network tab to check API calls
// Application tab to check localStorage
```

---

## Common Issues & Fixes

| Issue | Cause | Fix |
|-------|-------|-----|
| 401 Unauthorized | Missing token | Add `Authorization` header |
| 403 Forbidden | Not admin role | Ensure user role is `admin` |
| 404 Not Found | Resource missing | Verify ID exists in database |
| CORS error | Wrong origin | Update CORS config |
| Cannot find module | Missing dependency | Run `npm install` |
| Database connection failed | MongoDB not running | Start MongoDB service |
| Port already in use | Service already running | Kill process or change port |

---

## Performance Metrics

### Target Metrics
- **First Contentful Paint**: < 1.5s
- **Largest Contentful Paint**: < 2.5s
- **Cumulative Layout Shift**: < 0.1
- **API Response Time**: < 200ms
- **Database Query**: < 100ms

### Monitoring with Lighthouse
```bash
npm install -g lighthouse
lighthouse http://localhost:3000 --view
```

---

## Accessibility Testing

- [ ] Keyboard navigation works
- [ ] Screen reader compatible
- [ ] Color contrast sufficient
- [ ] Form labels present
- [ ] Images have alt text
- [ ] Links have descriptive text

Use: aXe DevTools browser extension

---

## Testing Resources

- Jest: https://jestjs.io/
- Cypress: https://www.cypress.io/
- React Testing Library: https://testing-library.com/react
- Supertest: https://github.com/visionmedia/supertest
- Artillery: https://artillery.io/

---

**Run tests before deployment!**
