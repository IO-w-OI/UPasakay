import React, { createContext, useContext, useState } from 'react';
const TripContext = createContext(null);

export const TripProvider = ({ children }) => {
  const [activeTrip, setActiveTrip] = useState(null);
  // activeRequest persists across navigation so the user can't accidentally
  // re-submit Para! for a ride that is still in flight.
  // Shape: { id, status, driverInfo } | null
  const [activeRequest, setActiveRequest] = useState(null);

  return (
    <TripContext.Provider value={{ activeTrip, setActiveTrip, activeRequest, setActiveRequest }}>
      {children}
    </TripContext.Provider>
  );
};
export const useTrip = () => useContext(TripContext);