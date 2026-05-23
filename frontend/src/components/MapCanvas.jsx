import React, { useRef, useEffect, useState } from 'react';
import '../styles/MapCanvas.css';

export default function MapCanvas({ imageUrl, pins, path, selectedVenue, onPinClick }) {
  const canvasRef = useRef();
  const [scale, setScale] = useState(1);
  const [offset] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Save context state
      ctx.save();
      ctx.translate(offset.x, offset.y);
      ctx.scale(scale, scale);

      // Draw image
      ctx.drawImage(img, 0, 0);

      // Draw pins
      if (pins && pins.length > 0) {
        pins.forEach((pin) => {
          const isSelected = selectedVenue && pin._id === selectedVenue._id;
          ctx.fillStyle = isSelected ? '#FF0000' : '#0084FF';
          ctx.beginPath();
          ctx.arc(pin.coordinates.x, pin.coordinates.y, 8, 0, 2 * Math.PI);
          ctx.fill();

          // Label
          ctx.fillStyle = '#000';
          ctx.font = '12px Arial';
          ctx.fillText(pin.name, pin.coordinates.x + 10, pin.coordinates.y);
        });
      }

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

      ctx.restore();
    };

    img.src = imageUrl;

    // Canvas click handler
    canvas.addEventListener('click', (e) => {
      const rect = canvas.getBoundingClientRect();
      const x = (e.clientX - rect.left - offset.x) / scale;
      const y = (e.clientY - rect.top - offset.y) / scale;
      onPinClick({ x, y });
    });
  }, [imageUrl, pins, path, selectedVenue, scale, offset, onPinClick]);

  const handleZoom = (direction) => {
    setScale((prev) => (direction === 'in' ? prev + 0.1 : Math.max(0.5, prev - 0.1)));
  };

  return (
    <div className="map-container">
      <canvas ref={canvasRef} width={800} height={600} className="map-canvas" />
      <div className="zoom-controls">
        <button onClick={() => handleZoom('in')}>+ Zoom In</button>
        <button onClick={() => handleZoom('out')}>- Zoom Out</button>
      </div>
    </div>
  );
}
