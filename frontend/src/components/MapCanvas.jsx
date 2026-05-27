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
      
      // Map screen coordinates to internal canvas coordinates
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;
      const canvasX = (e.clientX - rect.left) * scaleX;
      const canvasY = (e.clientY - rect.top) * scaleY;
      
      const xOffset = (canvas.width - (img.width * scale)) / 2;
      const yOffset = (canvas.height - (img.height * scale)) / 2;
      
      const x = (canvasX - offset.x - xOffset) / scale;
      const y = (canvasY - offset.y - yOffset) / scale;
      
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

      const drawPin = (context, px, py, color, label) => {
        context.save();
        context.translate(px, py);
        
        // Pin body
        context.fillStyle = color;
        context.beginPath();
        context.arc(0, -20, 10, Math.PI, 0); 
        context.lineTo(0, 0);
        context.lineTo(-10, -20);
        context.fill();
        
        // Inner circle
        context.fillStyle = '#FFFFFF';
        context.beginPath();
        context.arc(0, -20, 4, 0, Math.PI * 2);
        context.fill();
        
        // Label with white background
        if (label) {
          context.font = 'bold 14px Arial';
          const textWidth = context.measureText(label).width;
          context.fillStyle = 'rgba(255, 255, 255, 0.8)';
          context.fillRect(-textWidth/2 - 4, -45, textWidth + 8, 20);
          
          context.fillStyle = '#000000';
          context.textAlign = 'center';
          context.fillText(label, 0, -30);
        }
        
        context.restore();
      };

      // Draw existing pins
      if (pins && pins.length > 0) {
        pins.forEach((pin) => {
          const isSelected = selectedVenue && pin._id === selectedVenue._id;
          drawPin(ctx, pin.coordinates.x, pin.coordinates.y, isSelected ? '#FF0000' : '#000000', pin.name);
        });
      }

      // Draw new pin if exists
      if (newPin) {
        drawPin(ctx, newPin.x, newPin.y, '#0084FF', 'New Venue');
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
