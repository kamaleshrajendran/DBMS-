import React, { useRef, useEffect, useState } from 'react';
import '../styles/MapCanvas.css';

export default function MapCanvas({ imageUrl, pins, path, selectedVenue, onPinClick, newPin }) {
  const canvasRef = useRef();
  const [scale, setScale] = useState(1);
  const [offset] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (!canvasRef.current || !imageUrl) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    // Canvas click handler
    const handleClick = (e) => {
      if (!img.width) return; // wait until image loads
      const rect = canvas.getBoundingClientRect();
      const xOffset = (canvas.width - (img.width * scale)) / 2;
      const yOffset = (canvas.height - (img.height * scale)) / 2;
      const x = (e.clientX - rect.left - offset.x - xOffset) / scale;
      const y = (e.clientY - rect.top - offset.y - yOffset) / scale;
      
      // Only pin if clicked inside image bounds
      if (x >= 0 && x <= img.width && y >= 0 && y <= img.height) {
        onPinClick({ x, y });
      }
    };

    img.onload = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Save context state
      ctx.save();
      
      // Calculate centering offsets
      const xOffset = (canvas.width - (img.width * scale)) / 2;
      const yOffset = (canvas.height - (img.height * scale)) / 2;
      
      ctx.translate(offset.x + xOffset, offset.y + yOffset);
      ctx.scale(scale, scale);

      // Draw image
      ctx.drawImage(img, 0, 0);

      // Draw path
      if (path && path.length > 1) {
        ctx.strokeStyle = '#00FF00';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(path[0].x, path[0].y);
        for (let i = 1; i < path.length; i++) {
          ctx.lineTo(path[i].x, path[i].y);
        }
        ctx.stroke();
      }

      // Draw existing pins
      if (pins && pins.length > 0) {
        pins.forEach((pin) => {
          const isSelected = selectedVenue && pin._id === selectedVenue._id;
          ctx.fillStyle = isSelected ? '#FF0000' : '#000000';
          ctx.font = '16px Arial';
          // Draw Emoji and Name
          ctx.fillText(`📍 ${pin.name}`, pin.coordinates.x - 8, pin.coordinates.y + 5);
        });
      }

      // Draw new pin if exists
      if (newPin) {
        ctx.fillStyle = '#FF0000';
        ctx.font = 'bold 16px Arial';
        ctx.fillText(`📍 New Venue`, newPin.x - 8, newPin.y + 5);
      }

      ctx.restore();
    };

    img.src = imageUrl;
    
    canvas.addEventListener('click', handleClick);
    
    return () => {
      canvas.removeEventListener('click', handleClick);
    };

  }, [imageUrl, pins, path, selectedVenue, scale, offset, onPinClick, newPin]);

  const handleZoom = (direction) => {
    setScale((prev) => (direction === 'in' ? prev + 0.1 : Math.max(0.2, prev - 0.1)));
  };

  return (
    <div className="map-container">
      <canvas ref={canvasRef} width={800} height={600} className="map-canvas" style={{ border: '1px solid #ddd', borderRadius: '8px' }} />
      <div className="zoom-controls">
        <button onClick={() => handleZoom('in')}>+ Zoom In</button>
        <button onClick={() => handleZoom('out')}>- Zoom Out</button>
      </div>
    </div>
  );
}
