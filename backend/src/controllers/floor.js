const Floor = require('../models/floor');
const Venue = require('../models/venue');

exports.addFloor = async (req, res) => {
  try {
    const { floorNumber } = req.body;
    const buildingId = req.params.buildingId;

    const floor = new Floor({
      buildingId,
      floorNumber,
      mapImageUrl: req.body.mapImageUrl || '', // from upload or URL
      width: req.body.width || 800,
      height: req.body.height || 600,
    });

    await floor.save();
    res.status(201).json({ message: 'Floor added', floor });
  } catch (error) {
    res.status(500).json({ message: 'Error adding floor', error: error.message });
  }
};

exports.getFloors = async (req, res) => {
  try {
    const floors = await Floor.find({ buildingId: req.params.buildingId });
    res.json({ floors });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching floors', error: error.message });
  }
};

exports.getFloor = async (req, res) => {
  try {
    const floor = await Floor.findById(req.params.floorId);
    if (!floor) {
      return res.status(404).json({ message: 'Floor not found' });
    }
    res.json({ floor });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching floor', error: error.message });
  }
};

exports.updateFloor = async (req, res) => {
  try {
    const floor = await Floor.findByIdAndUpdate(req.params.floorId, req.body, {
      new: true,
    });
    res.json({ message: 'Floor updated', floor });
  } catch (error) {
    res.status(500).json({ message: 'Error updating floor', error: error.message });
  }
};

exports.deleteFloor = async (req, res) => {
  try {
    await Floor.findByIdAndDelete(req.params.floorId);
    await Venue.deleteMany({ floorId: req.params.floorId });
    res.json({ message: 'Floor deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting floor', error: error.message });
  }
};
