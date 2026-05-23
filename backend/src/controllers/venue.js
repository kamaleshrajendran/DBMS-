const Venue = require('../models/venue');
const { v4: uuidv4 } = require('uuid');

exports.addVenue = async (req, res) => {
  try {
    const { name, description, x, y, category, photos, tags } = req.body;
    const { floorId } = req.params;

    const venue = new Venue({
      floorId,
      name,
      description,
      coordinates: { x, y },
      category,
      photos: photos || [],
      tags: tags || [],
      graphNodeId: uuidv4(),
    });

    await venue.save();
    res.status(201).json({ message: 'Venue added', venue });
  } catch (error) {
    res.status(500).json({ message: 'Error adding venue', error: error.message });
  }
};

exports.getVenues = async (req, res) => {
  try {
    const venues = await Venue.find({ floorId: req.params.floorId });
    res.json({ venues });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching venues', error: error.message });
  }
};

exports.getVenue = async (req, res) => {
  try {
    const venue = await Venue.findById(req.params.venueId);
    if (!venue) {
      return res.status(404).json({ message: 'Venue not found' });
    }
    res.json({ venue });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching venue', error: error.message });
  }
};

exports.updateVenue = async (req, res) => {
  try {
    const venue = await Venue.findByIdAndUpdate(req.params.venueId, req.body, {
      new: true,
    });
    res.json({ message: 'Venue updated', venue });
  } catch (error) {
    res.status(500).json({ message: 'Error updating venue', error: error.message });
  }
};

exports.deleteVenue = async (req, res) => {
  try {
    await Venue.findByIdAndDelete(req.params.venueId);
    res.json({ message: 'Venue deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting venue', error: error.message });
  }
};

exports.searchVenues = async (req, res) => {
  try {
    const { q, floorId } = req.query;
    const query = { floorId };

    if (q) {
      query.$or = [
        { name: { $regex: q, $options: 'i' } },
        { description: { $regex: q, $options: 'i' } },
        { tags: { $in: [new RegExp(q, 'i')] } },
      ];
    }

    const venues = await Venue.find(query).limit(10);
    res.json({ venues });
  } catch (error) {
    res.status(500).json({ message: 'Error searching venues', error: error.message });
  }
};
