import React, { useState, useEffect } from 'react';
import '../styles/VenueList.css';

export default function VenueList({ venues, onVenueSelect, searchQuery, setSearchQuery }) {
  const [filtered, setFiltered] = useState(venues);

  useEffect(() => {
    if (searchQuery) {
      setFiltered(
        venues.filter((v) =>
          v.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (v.description && v.description.toLowerCase().includes(searchQuery.toLowerCase()))
        )
      );
    } else {
      setFiltered(venues);
    }
  }, [searchQuery, venues]);

  return (
    <div className="venue-list">
      <input
        type="text"
        placeholder="Search venues..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="search-input"
      />

      <div className="venues">
        {filtered.length > 0 ? (
          filtered.map((venue) => (
            <div
              key={venue._id}
              className="venue-item"
              onClick={() => onVenueSelect(venue)}
            >
              <h4>{venue.name}</h4>
              <p>{venue.category}</p>
              {venue.description && <p className="desc">{venue.description}</p>}
            </div>
          ))
        ) : (
          <p className="no-results">No venues found</p>
        )}
      </div>
    </div>
  );
}
