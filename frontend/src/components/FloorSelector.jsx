import React from 'react';
import '../styles/FloorSelector.css';

export default function FloorSelector({ floors, selectedFloor, onFloorChange }) {
  return (
    <div className="floor-selector">
      <label>Select Floor:</label>
      <select value={selectedFloor._id || ''} onChange={(e) => {
        const floor = floors.find((f) => f._id === e.target.value);
        onFloorChange(floor);
      }}>
        <option value="">-- Choose a floor --</option>
        {floors.map((floor) => (
          <option key={floor._id} value={floor._id}>
            Floor {floor.floorNumber}
          </option>
        ))}
      </select>
    </div>
  );
}
