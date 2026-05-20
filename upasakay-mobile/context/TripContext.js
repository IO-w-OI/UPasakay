import React, { createContext, useCallback, useContext, useState } from 'react';

import { apiGet } from '../services/apiClient';

const TripContext = createContext(null);

export const TripProvider = ({ children }) => {
  const [activeTrip, setActiveTrip] = useState(null);
  // activeRequest persists across navigation so the user can't accidentally
  // re-submit Para! for a ride that is still in flight.
  // Shape: { id, status, driverInfo } | null
  const [activeRequest, setActiveRequest] = useState(null);
  // Full server snapshot of the in-flight pickup request (route, stops,
  // driver, shuttle's latest GPS + distance to pickup). Used to hydrate the
  // locked booking screen on launch / tab focus.
  // Shape: { pickup_request, shuttle_distance_meters, cancel_lock_radius_meters } | null
  const [activeBooking, setActiveBooking] = useState(null);

  // Pulls the passenger's single in-flight pickup request. Returns the same
  // payload so callers can branch immediately (e.g. UserHome auto-routing
  // to the locked booking screen instead of rendering the route list).
  const refreshActiveBooking = useCallback(async () => {
    const { ok, status, data } = await apiGet('passenger/active-pickup-request');
    if (!ok) {
      // 401 / 403 / network — leave existing state alone so we don't drop a
      // valid in-flight ride just because one poll missed.
      return null;
    }
    if (status === 204 || !data?.pickup_request) {
      setActiveBooking(null);
      setActiveRequest(null);
      return null;
    }
    setActiveBooking(data);
    const pr = data.pickup_request;
    setActiveRequest((prev) => ({
      ...(prev ?? {}),
      id: pr.id,
      status: pr.status,
    }));
    return data;
  }, []);

  return (
    <TripContext.Provider
      value={{
        activeTrip,
        setActiveTrip,
        activeRequest,
        setActiveRequest,
        activeBooking,
        setActiveBooking,
        refreshActiveBooking,
      }}
    >
      {children}
    </TripContext.Provider>
  );
};
export const useTrip = () => useContext(TripContext);