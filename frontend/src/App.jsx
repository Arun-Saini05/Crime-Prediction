
import React, { useState } from 'react';
import MapComponent from './components/Map';
import Sidebar from './components/Sidebar';

function App() {
  const [hoveredDistrict, setHoveredDistrict] = useState(null);
  const [routePath, setRoutePath] = useState(null);
  const [searchTarget, setSearchTarget] = useState(null);
  const [showRoads, setShowRoads] = useState(false);

  return (
    <div className="relative h-screen w-screen bg-slate-900 overflow-hidden flex">
      <Sidebar
        hoveredDistrict={hoveredDistrict}
        setRoutePath={setRoutePath}
        setSearchTarget={setSearchTarget}
        showRoads={showRoads}
        setShowRoads={setShowRoads}
      />

      {/* Map Container */}
      <div className="flex-1 h-full relative">
        <MapComponent
          routePath={routePath}
          setHoveredDistrict={setHoveredDistrict}
          searchTarget={searchTarget}
          showRoads={showRoads}
        />
      </div>
    </div>
  );
}

export default App;
