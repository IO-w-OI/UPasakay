// TripContext.js
import React, { createContext, useContext, useState } from 'react';
const TripContext = createContext(null);

export const TripProvider = ({ children }) => {
  const [activeTrip, setActiveTrip] = useState(null);
  // shape: { driver, route, etaText, distanceText, avatarUri } | null
  return (
    <TripContext.Provider value={{ activeTrip, setActiveTrip }}>
      {children}
    </TripContext.Provider>
  );
};
export const useTrip = () => useContext(TripContext);
