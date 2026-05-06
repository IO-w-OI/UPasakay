import { API_URL } from './UserStore'; // Reuse the IP we already fixed

export const getOrderedStops = async (routeId, token) => {
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