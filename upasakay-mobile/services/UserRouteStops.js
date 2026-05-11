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
  { id: 1, name: "JY Square Mall", lat: 10.3345, lng: 123.9042 },
  { id: 2, name: "IT Park Terminal", lat: 10.3298, lng: 123.9061 },
  { id: 3, name: "Lahug Elementary", lat: 10.3312, lng: 123.9015 },
  { id: 4, name: "Capitol Site", lat: 10.3176, lng: 123.8907 },
];