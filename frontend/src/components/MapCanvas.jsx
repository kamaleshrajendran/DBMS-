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
      if (!img.width) return;
      const rect = canvas.getBoundingClientRect();
      
      // 1. Convert DOM coordinates to Canvas logical coordinates
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;
      const canvasX = (e.clientX - rect.left) * scaleX;
      const canvasY = (e.clientY - rect.top) * scaleY;
      
      // 2. Calculate drawing scale and offsets
      const fitScale = Math.min(canvas.width / img.width, canvas.height / img.height);
      const actualScale = scale * fitScale;
      const xOffset = (canvas.width - (img.width * actualScale)) / 2;
      const yOffset = (canvas.height - (img.height * actualScale)) / 2;
      
      // 3. Map Canvas coordinates to original Image coordinates
      const x = (canvasX - offset.x - xOffset) / actualScale;
      const y = (canvasY - offset.y - yOffset) / actualScale;
      
      // 4. Pin if clicked inside image bounds
      if (x >= 0 && x <= img.width && y >= 0 && y <= img.height) {
        onPinClick({ x, y });
      }
    };

    img.onload = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const fitScale = Math.min(canvas.width / img.width, canvas.height / img.height);
      const actualScale = scale * fitScale;
      const xOffset = (canvas.width - (img.width * actualScale)) / 2;
      const yOffset = (canvas.height - (img.height * actualScale)) / 2;
      
      // 1. Draw image
      ctx.drawImage(
        img, 
        0, 0, img.width, img.height, 
        offset.x + xOffset, offset.y + yOffset, img.width * actualScale, img.height * actualScale
      );

      // Helper to map original image coords to screen coords
      const getScreenCoords = (imgX, imgY) => ({
        x: offset.x + xOffset + (imgX * actualScale),
        y: offset.y + yOffset + (imgY * actualScale)
      });

      // 2. Draw path
      if (path && path.length > 1) {
        ctx.strokeStyle = '#00FF00';
        ctx.lineWidth = 3;
        ctx.beginPath();
        const start = getScreenCoords(path[0].x, path[0].y);
        ctx.moveTo(start.x, start.y);
        for (let i = 1; i < path.length; i++) {
          const pt = getScreenCoords(path[i].x, path[i].y);
          ctx.lineTo(pt.x, pt.y);
        }
        ctx.stroke();
      }

      // 3. Draw existing pins
      if (pins && pins.length > 0) {
        pins.forEach((pin) => {
          const isSelected = selectedVenue && pin._id === selectedVenue._id;
          ctx.fillStyle = isSelected ? '#FF0000' : '#000000';
          ctx.font = '16px Arial';
          const pt = getScreenCoords(pin.coordinates.x, pin.coordinates.y);
          ctx.fillText(`📍 ${pin.name}`, pt.x - 8, pt.y + 5);
        });
      }

      // 4. Draw new pin if exists
      if (newPin) {
        ctx.fillStyle = '#FF0000';
        ctx.font = 'bold 16px Arial';
        const pt = getScreenCoords(newPin.x, newPin.y);
        ctx.fillText(`📍 New Venue`, pt.x - 8, pt.y + 5);
      }
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
