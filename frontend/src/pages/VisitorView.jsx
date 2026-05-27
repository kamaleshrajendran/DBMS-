import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import MapCanvas from '../components/MapCanvas';
import VenueList from '../components/VenueList';
import FloorSelector from '../components/FloorSelector';
import { visitorAPI, venueAPI, navigationAPI } from '../services/api';
import '../styles/VisitorView.css';

export default function VisitorView() {
  const { buildingId } = useParams();
  const [building, setBuilding] = useState(null);
  const [floors, setFloors] = useState([]);
  const [selectedFloor, setSelectedFloor] = useState(null);
  const [venues, setVenues] = useState([]);
  const [selectedVenue, setSelectedVenue] = useState(null);
  const [path, setPath] = useState(null);
  const [steps, setSteps] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadBuilding = async () => {
      try {
        const res = await visitorAPI.getBuilding(buildingId);
        setBuilding(res.data.building);
        
        const floorsRes = await visitorAPI.getFloors(buildingId);
        setFloors(floorsRes.data.floors);
        
        if (floorsRes.data.floors.length > 0) {
          setSelectedFloor(floorsRes.data.floors[0]);
        }
      } catch (err) {
        console.error('Error loading building', err);
      } finally {
        setLoading(false);
      }
    };

    loadBuilding();
  }, [buildingId]);

  useEffect(() => {
    if (selectedFloor) {
      const loadVenues = async () => {
        try {
          const res = await venueAPI.getVenues(selectedFloor._id);
          setVenues(res.data.venues);
        } catch (err) {
          console.error('Error loading venues', err);
        }
      };
      loadVenues();
    }
  }, [selectedFloor]);

  const handleNavigateTo = async (venue) => {
    setSelectedVenue(venue);
    // Start from entrance (0,0) to venue
    try {
      const res = await navigationAPI.calculateRoute({
        floorId: selectedFloor._id,
        startNodeId: 'entrance',
        endNodeId: venue.graphNodeId,
      });
      setPath(res.data.path);
      setSteps(res.data.steps);
    } catch (err) {
      console.error('Error calculating route', err);
    }
  };

  if (loading) return <div className="loading">Loading...</div>;
  if (!building) return <div className="error">Building not found</div>;

  return (
    <div className="visitor-view">
      <header className="visitor-header">
        <h1>{building.name}</h1>
        <p>{building.description}</p>
      </header>

      <div className="visitor-content">
        <aside className="sidebar">
          <FloorSelector floors={floors} selectedFloor={selectedFloor} onFloorChange={setSelectedFloor} />
          <VenueList
            venues={venues}
            onVenueSelect={handleNavigateTo}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
          />
        </aside>

        <main className="map-view">
          {selectedFloor && (
            <MapCanvas
              imageUrl={selectedFloor.pinnedMapImageUrl || selectedFloor.mapImageUrl}
              pins={selectedVenue ? [selectedVenue] : []}
              path={path}
              selectedVenue={selectedVenue}
              onPinClick={() => {}}
            />
          )}
        </main>

        <aside className="info-panel">
          {selectedVenue && (
            <div className="venue-details">
              <h3>{selectedVenue.name}</h3>
              <p className="category">{selectedVenue.category}</p>
              <p>{selectedVenue.description}</p>

              {selectedVenue.photos && selectedVenue.photos.length > 0 && (
                <div className="photos">
                  {selectedVenue.photos.map((photo, idx) => (
                    <img key={idx} src={photo} alt={`${selectedVenue.name} ${idx}`} />
                  ))}
                </div>
              )}

              {steps.length > 0 && (
                <div className="directions">
                  <h4>Directions:</h4>
                  <ol>
                    {steps.map((step, idx) => (
                      <li key={idx}>{step}</li>
                    ))}
                  </ol>
                </div>
              )}
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
