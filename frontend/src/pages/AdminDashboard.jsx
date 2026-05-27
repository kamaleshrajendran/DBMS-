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
                  <MapCanvas
                    imageUrl={selectedFloor.mapImageUrl}
                    pins={venues}
                    onPinClick={setNewPin}
                    newPin={newPin}
                  />
                  <button onClick={() => setShowForm('venue')} className="btn-secondary">
                    + Add Venue Pin
                  </button>

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
