const express = require('express');
const { calculateRoute, createNavGraph, getNavGraph } = require('../controllers/navigation');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

router.get('/buildings/:id', (req, res) => {
  // Public: Get building for scanning QR
  const Building = require('../models/building');
  Building.findById(req.params.id)
    .then((building) => {
      if (!building) return res.status(404).json({ message: 'Building not found' });
      res.json({ building });
    })
    .catch((err) => res.status(500).json({ error: err.message }));
});

router.get('/buildings/:buildingId/floors', (req, res) => {
  // Public: Get floors for a building
  const Floor = require('../models/floor');
  Floor.find({ buildingId: req.params.buildingId })
    .then((floors) => res.json({ floors }))
    .catch((err) => res.status(500).json({ error: err.message }));
});

router.post('/navigation/route', authenticate, calculateRoute);
router.post('/navigation/graph', authenticate, createNavGraph);
router.get('/navigation/graph/:floorId', getNavGraph);

module.exports = router;
