//import { API_URL } from './UserStore'; // Reuse the IP we already fixed

/**export const getOrderedStops = async (routeId, token) => {
  try {
    const response = await fetch(`${API_URL}/routes/${routeId}/ordered-stops`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json',
      },
    });

    const result = await response.json();
  } catch (error) {
    console.error("RouteService Error:", error);
    return { success: false, message: error.message };
  }
};
*/
export const ROUTE_STOPS = [
  { id: 51, name: "UP Cebu Lahug", lat: 10.3381, lng: 123.9116, route_id: 34 },
  { id: 46, name: "Guadalupe (Jollibee)", lat: 10.3298, lng: 123.9061, route_id: 34 },
  { id: 47, name: "Capitol (Metrobank)", lat: 10.3176, lng: 123.8907, route_id: 34 },
  { id: 48, name: "UP Cebu (Oblation Sq.)", lat: 10.3345, lng: 123.9042, route_id: 34 },
  { id: 49, name: "SM Consolacion", lat: 10.3312, lng: 123.9015, route_id: 34 },
];