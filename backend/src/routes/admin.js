const express = require('express');
const {
  createBuilding,
  getBuildings,
  getBuilding,
  generateQR,
  updateBuilding,
  deleteBuilding,
} = require('../controllers/building');
const {
  addFloor,
  getFloors,
  getFloor,
  updateFloor,
  deleteFloor,
} = require('../controllers/floor');
const {
  addVenue,
  getVenues,
  getVenue,
  updateVenue,
  deleteVenue,
  searchVenues,
} = require('../controllers/venue');
const { authenticate, adminOnly } = require('../middleware/auth');

const router = express.Router();

// Buildings
router.post('/buildings', authenticate, adminOnly, createBuilding);
router.get('/buildings', getBuildings);
router.get('/buildings/:id', getBuilding);
router.put('/buildings/:id', authenticate, adminOnly, updateBuilding);
router.delete('/buildings/:id', authenticate, adminOnly, deleteBuilding);
router.get('/buildings/:id/qr', generateQR);

// Floors
router.post('/buildings/:buildingId/floors', authenticate, adminOnly, addFloor);
router.get('/buildings/:buildingId/floors', getFloors);
router.get('/floors/:floorId', getFloor);
router.put('/floors/:floorId', authenticate, adminOnly, updateFloor);
router.delete('/floors/:floorId', authenticate, adminOnly, deleteFloor);

// Venues
router.post('/floors/:floorId/venues', authenticate, adminOnly, addVenue);
router.get('/floors/:floorId/venues', getVenues);
router.get('/venues/:venueId', getVenue);
router.put('/venues/:venueId', authenticate, adminOnly, updateVenue);
router.delete('/venues/:venueId', authenticate, adminOnly, deleteVenue);
router.get('/venues/search', searchVenues);

module.exports = router;
