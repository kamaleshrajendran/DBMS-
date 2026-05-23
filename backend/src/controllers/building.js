const Building = require('../models/building');
const Floor = require('../models/floor');
const { generateQRCode, generateQRDataURL } = require('../services/qr');

exports.createBuilding = async (req, res) => {
  try {
    const { name, description } = req.body;

    const building = new Building({
      name,
      description,
      createdBy: req.user.id,
      qrCodeData: generateQRDataURL(null), // will update after save
    });

    await building.save();

    // Update with actual building ID
    building.qrCodeData = generateQRDataURL(building._id);
    await building.save();

    res.status(201).json({
      message: 'Building created successfully',
      building,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error creating building', error: error.message });
  }
};

exports.getBuildings = async (req, res) => {
  try {
    const buildings = await Building.find().populate('createdBy', 'name email');
    res.json({ buildings });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching buildings', error: error.message });
  }
};

exports.getBuilding = async (req, res) => {
  try {
    const building = await Building.findById(req.params.id).populate('createdBy', 'name email');
    if (!building) {
      return res.status(404).json({ message: 'Building not found' });
    }
    res.json({ building });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching building', error: error.message });
  }
};

exports.generateQR = async (req, res) => {
  try {
    const building = await Building.findById(req.params.id);
    if (!building) {
      return res.status(404).json({ message: 'Building not found' });
    }

    let floor = null;
    if (req.query.floorId && req.query.floorId !== 'undefined') {
      floor = await Floor.findById(req.query.floorId);
    } else {
      floor = await Floor.findOne({ buildingId: building._id });
    }
    const qrData = (floor && floor.mapImageUrl) ? floor.mapImageUrl : building.qrCodeData;

    const qrBuffer = await generateQRCode(qrData);
    res.contentType('image/png');
    res.send(qrBuffer);
  } catch (error) {
    res.status(500).json({ message: 'Error generating QR code', error: error.message });
  }
};

exports.updateBuilding = async (req, res) => {
  try {
    const building = await Building.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    res.json({ message: 'Building updated', building });
  } catch (error) {
    res.status(500).json({ message: 'Error updating building', error: error.message });
  }
};

exports.deleteBuilding = async (req, res) => {
  try {
    await Building.findByIdAndDelete(req.params.id);
    await Floor.deleteMany({ buildingId: req.params.id });
    res.json({ message: 'Building deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting building', error: error.message });
  }
};
