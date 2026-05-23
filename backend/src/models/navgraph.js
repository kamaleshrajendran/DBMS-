const mongoose = require('mongoose');

const navGraphSchema = new mongoose.Schema({
  floorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Floor',
    required: true,
  },
  nodes: [
    {
      id: String,
      x: Number,
      y: Number,
      label: String, // venue name or intersection
    },
  ],
  edges: [
    {
      from: String,
      to: String,
      weight: Number, // distance
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('NavGraph', navGraphSchema);
