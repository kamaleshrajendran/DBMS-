import React, { useState, useEffect } from 'react';
import { buildingAPI, floorAPI, venueAPI } from '../services/api';
import MapCanvas from '../components/MapCanvas';
import '../styles/AdminDashboard.css';

export default function AdminDashboard() {
  const [buildings, setBuildings] = useState([]);
  const [selectedBuilding, setSelectedBuilding] = useState(null);
  const [floors, setFloors] = useState([]);
  const [selectedFloor, setSelectedFloor] = useState(null);
  const [venues, setVenues] = useState([]);
  const [showForm, setShowForm] = useState(null);
  const [formData, setFormData] = useState({});
  const [newPin, setNewPin] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadBuildings();
  }, []);

  const loadBuildings = async () => {
    try {
      const res = await buildingAPI.getBuildings();
      setBuildings(res.data.buildings);
    } catch (err) {
      console.error('Error loading buildings', err);
    }
  };

  const loadFloors = async (buildingId) => {
    try {
      const res = await floorAPI.getFloors(buildingId);
      setFloors(res.data.floors);
    } catch (err) {
      console.error('Error loading floors', err);
    }
  };

  const loadVenues = async (floorId) => {
    try {
      const res = await venueAPI.getVenues(floorId);
      setVenues(res.data.venues);
    } catch (err) {
      console.error('Error loading venues', err);
    }
  };

  const handleBuildingSelect = (building) => {
    setSelectedBuilding(building);
    loadFloors(building._id);
  };

  const handleFloorSelect = (floor) => {
    setSelectedFloor(floor);
    loadVenues(floor._id);
  };

  const handleCreateBuilding = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      await buildingAPI.createBuilding(formData);
      loadBuildings();
      setShowForm(null);
      setFormData({});
    } catch (err) {
      alert('Error creating building');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddFloor = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      await floorAPI.addFloor(selectedBuilding._id, formData);
      loadFloors(selectedBuilding._id);
      setShowForm(null);
      setFormData({});
    } catch (err) {
      alert('Error adding floor');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddVenue = async () => {
    if (!newPin) {
      alert('Please pin a location on the map');
      return;
    }

    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      await venueAPI.addVenue(selectedFloor._id, {
        ...formData,
        x: newPin.x,
        y: newPin.y,
      });
      loadVenues(selectedFloor._id);
      setShowForm(null);
      setFormData({});
      setNewPin(null);
    } catch (err) {
      alert('Error adding venue');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePinClick = (coords) => {
    setNewPin(coords);
    setShowForm('venue');
  };

  const handleSavePinnedMap = async () => {
    if (!selectedFloor || !selectedFloor.mapImageUrl) return;
    setIsSubmitting(true);
    try {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      img.crossOrigin = "Anonymous";
      
      img.onload = async () => {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);
        
        const drawPin = (context, px, py, color, label) => {
          context.save();
          context.translate(px, py);
          
          context.fillStyle = color;
          context.beginPath();
          context.arc(0, -20, 10, Math.PI, 0); 
          context.lineTo(0, 0);
          context.lineTo(-10, -20);
          context.fill();
          
          context.fillStyle = '#FFFFFF';
          context.beginPath();
          context.arc(0, -20, 4, 0, Math.PI * 2);
          context.fill();
          
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

        venues.forEach(pin => {
          drawPin(ctx, pin.coordinates.x, pin.coordinates.y, '#000000', pin.name);
        });
        
        const dataUrl = canvas.toDataURL('image/png');
        await floorAPI.updateFloor(selectedFloor._id, { pinnedMapImageUrl: dataUrl });
        alert('Pinned map saved and published successfully!');
        loadFloors(selectedBuilding._id);
        setIsSubmitting(false);
      };
      
      img.onerror = () => {
        alert('Error loading image for publishing.');
        setIsSubmitting(false);
      };
      
      img.src = selectedFloor.mapImageUrl;
    } catch (err) {
      alert('Error publishing pinned map');
      setIsSubmitting(false);
    }
  };

  const handleDeleteBuilding = async (e, buildingId) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this building? All floors and venues inside it will be deleted.')) return;
    try {
      await buildingAPI.deleteBuilding(buildingId);
      if (selectedBuilding?._id === buildingId) {
        setSelectedBuilding(null);
        setSelectedFloor(null);
        setFloors([]);
        setVenues([]);
      }
      loadBuildings();
    } catch (err) {
      alert('Error deleting building');
    }
  };

  const handleDeleteFloor = async (e, floorId) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this floor? All venues on it will be deleted.')) return;
    try {
      await floorAPI.deleteFloor(floorId);
      if (selectedFloor?._id === floorId) {
        setSelectedFloor(null);
        setVenues([]);
      }
      loadFloors(selectedBuilding._id);
    } catch (err) {
      alert('Error deleting floor');
    }
  };

  const handleGenerateQR = async () => {
    try {
      const res = await buildingAPI.getQRCode(selectedBuilding._id, selectedFloor?._id);
      const url = window.URL.createObjectURL(res.data);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${selectedBuilding.name}-qr.png`;
      link.click();
    } catch (err) {
      alert('Error generating QR code');
    }
  };

  return (
    <div className="admin-dashboard">
      <header className="admin-header">
        <h1>Admin Dashboard</h1>
        <button onClick={() => setShowForm('building')} className="btn-primary">
          + New Building
        </button>
      </header>

      <div className="admin-content">
        {/* Buildings List */}
        <aside className="sidebar">
          <h3>Buildings</h3>
          <div className="buildings-list">
            {buildings.map((b) => (
              <div
                key={b._id}
                className={`building-item ${selectedBuilding?._id === b._id ? 'active' : ''}`}
                onClick={() => handleBuildingSelect(b)}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h4>{b.name}</h4>
                  <button 
                    onClick={(e) => handleDeleteBuilding(e, b._id)}
                    className="btn-delete"
                    style={{ background: 'transparent', color: '#ff4d4f', border: 'none', cursor: 'pointer', fontSize: '1.2rem', padding: '0 5px' }}
                    title="Delete Building"
                  >✕</button>
                </div>
                <p>{b.description}</p>
              </div>
            ))}
          </div>
        </aside>

        {/* Main Panel */}
        <main className="main-panel">
          {selectedBuilding && (
            <>
              <div className="building-header">
                <h2>{selectedBuilding.name}</h2>
                <button onClick={handleGenerateQR} className="btn-qr">
                  📋 Download QR Code
                </button>
              </div>

              {/* Floors */}
              <div className="floors-section">
                <h3>Floors</h3>
                <button onClick={() => setShowForm('floor')} className="btn-secondary">
                  + Add Floor
                </button>
                <div className="floors-grid">
                  {floors.map((f) => (
                    <div
                      key={f._id}
                      className={`floor-item ${selectedFloor?._id === f._id ? 'active' : ''}`}
                      onClick={() => handleFloorSelect(f)}
                      style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                    >
                      <span>Floor {f.floorNumber}</span>
                      <button 
                        onClick={(e) => handleDeleteFloor(e, f._id)}
                        className="btn-delete"
                        style={{ background: 'transparent', color: '#ff4d4f', border: 'none', cursor: 'pointer', fontSize: '1.2rem', padding: '0 5px' }}
                        title="Delete Floor"
                      >✕</button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Map Editor */}
              {selectedFloor && (
                <div className="floor-editor">
                  <h3>Floor {selectedFloor.floorNumber} - Map Editor</h3>
                  <div className="editor-controls" style={{ marginBottom: '10px' }}>
                    <button onClick={handleSavePinnedMap} className="btn-primary" disabled={isSubmitting}>
                      {isSubmitting ? 'Publishing...' : '💾 Save & Publish Pinned Map'}
                    </button>
                    <span style={{ marginLeft: '10px', fontSize: '0.9rem', color: '#666' }}>
                      Click on the map below to quickly add a new venue pin.
                    </span>
                  </div>
                  <MapCanvas
                    imageUrl={selectedFloor.mapImageUrl}
                    pins={venues}
                    onPinClick={handlePinClick}
                    newPin={newPin}
                  />

                  {/* Venues List */}
                  <div className="venues-list">
                    <h4>Venues on this floor:</h4>
                    {venues.map((v) => (
                      <div key={v._id} className="venue-item">
                        <span>{v.name}</span>
                        <button onClick={() => venueAPI.deleteVenue(v._id).then(() => loadVenues(selectedFloor._id))}>
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </main>
      </div>

      {/* Forms Modal */}
      {showForm && (
        <div className="modal">
          <div className="modal-content">
            <button className="close-btn" onClick={() => { setShowForm(null); setNewPin(null); }}>
              ✕
            </button>

            {showForm === 'building' && (
              <>
                <h3>Create New Building</h3>
                <input
                  placeholder="Building Name"
                  value={formData.name || ''}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
                <textarea
                  placeholder="Description"
                  value={formData.description || ''}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
                <button onClick={handleCreateBuilding} className="btn-primary" disabled={isSubmitting}>
                  {isSubmitting ? 'Creating...' : 'Create Building'}
                </button>
              </>
            )}

            {showForm === 'floor' && (
              <>
                <h3>Add New Floor</h3>
                <input
                  type="number"
                  placeholder="Floor Number"
                  value={formData.floorNumber || ''}
                  onChange={(e) => setFormData({ ...formData, floorNumber: parseInt(e.target.value) })}
                />
                <label style={{display: 'block', marginBottom: '5px', fontWeight: 'bold'}}>Upload Floor Map Image:</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onloadend = () => {
                        setFormData({ ...formData, mapImageUrl: reader.result });
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                />
                <button onClick={handleAddFloor} className="btn-primary" disabled={isSubmitting}>
                  {isSubmitting ? 'Adding...' : 'Add Floor'}
                </button>
              </>
            )}

            {showForm === 'venue' && (
              <>
                <h3>Add New Venue</h3>
                <p className="info">Click on the map to set location, then fill in details</p>
                {newPin && <p className="success">Location set: ({newPin.x}, {newPin.y})</p>}
                <input
                  placeholder="Venue Name"
                  value={formData.name || ''}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
                <textarea
                  placeholder="Description"
                  value={formData.description || ''}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
                <input
                  placeholder="Category (e.g., Shop, Restaurant)"
                  value={formData.category || ''}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                />
                <button onClick={handleAddVenue} className="btn-primary" disabled={isSubmitting}>
                  {isSubmitting ? 'Adding...' : 'Add Venue'}
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
