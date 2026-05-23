const mongoose = require('mongoose');

const floorSchema = new mongoose.Schema({
  buildingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Building',
    required: true,
  },
  floorNumber: {
    type: Number,
    required: true,
  },
  mapImageUrl: String, // S3/Firebase Storage link
  width: {
    type: Number,
    default: 800,
  },
  height: {
    type: Number,
    default: 600,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Floor', floorSchema);
