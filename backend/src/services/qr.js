const QRCode = require('qrcode');
const { v4: uuidv4 } = require('uuid');

const generateQRCode = async (data) => {
  try {
    // data should be a URL like: https://app.example.com/visit/{buildingId}
    const qrBuffer = await QRCode.toBuffer(data, {
      type: 'image/png',
      width: 300,
      errorCorrectionLevel: 'H',
    });
    return qrBuffer;
  } catch (error) {
    throw new Error('QR Code generation failed: ' + error.message);
  }
};

const generateQRDataURL = (buildingId) => {
  // In production, replace with actual domain
  return `${process.env.APP_URL || 'http://localhost:3000'}/scan/${buildingId}`;
};

module.exports = { generateQRCode, generateQRDataURL };
