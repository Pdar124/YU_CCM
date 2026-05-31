// src/components/MapContainer.jsx
import React from 'react';

const MapContainer = React.forwardRef((props, ref) => {
  return (
    <section className="absolute inset-0 z-0 bg-slate-200">
      <div ref={ref} className="w-full h-full" />
    </section>
  );
});

MapContainer.displayName = 'MapContainer';

export default MapContainer;