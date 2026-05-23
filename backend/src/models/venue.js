const mongoose = require('mongoose');

const venueSchema = new mongoose.Schema({
  floorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Floor',
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  description: String,
  coordinates: {
    x: {
      type: Number,
      required: true,
    },
    y: {
      type: Number,
      required: true,
    },
  },
  category: String, // shop, restaurant, restroom, etc.
  photos: [String], // URLs
  tags: [String],
  graphNodeId: String, // reference for navigation graph
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Venue', venueSchema);
