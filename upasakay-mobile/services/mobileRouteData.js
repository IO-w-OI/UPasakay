/**
 * Hardcoded landmark stops mirrored from the web's routeData.ts (liveMapRoutes).
 * These always show on the map regardless of what the admin has added to the database.
 * Admin-added stops from the API are merged on top of these at render time.
 *
 * Keep in sync with UPasakay/resources/js/data/routeData.ts → liveMapRoutes
 */

export const ROUTE_COLORS = {
    north:      '#3b82f6',
    south:      '#22c55e',
    cebuCity:   '#f97316',
};

export const liveMapLandmarks = {
    cebuCity: [
        { name: 'Bacayan',          lat: 10.370231192895845, lng: 123.91939456782869, sequence: 1 },
        { name: 'Gaisano Talamban', lat: 10.366354532260916, lng: 123.9137593968295,  sequence: 2 },
        { name: 'Cabancalan',       lat: 10.350996808797992, lng: 123.92415954908583, sequence: 3 },
        { name: 'USPF (front)',     lat: 10.329066480061208, lng: 123.90216149375473, sequence: 4 },
        { name: 'JY Square',        lat: 10.330508129133642, lng: 123.89792033979448, sequence: 5 },
        { name: 'Corner Sudlon',    lat: 10.32854085813706,  lng: 123.89729405708417, sequence: 6 },
    ],
    south: [
        { name: 'Gaisano Tabunok',                      lat: 10.2657,       lng: 123.8419,      sequence: 1 },
        { name: 'University of Cebu - Pardo & Talisay', lat: 10.2720425,    lng: 123.8476984,   sequence: 2 },
        { name: 'Shopwise / SuperMetro Mambaling',       lat: 10.2899117,    lng: 123.87033,     sequence: 3 },
        { name: 'Jollibee Punta Princesa',               lat: 10.295489,     lng: 123.8696003,   sequence: 4 },
        { name: 'Gaisano Tisa',                          lat: 10.299779,     lng: 123.869784,    sequence: 5 },
        { name: 'CCNSHS (Bus Stop)',                      lat: 10.300318,     lng: 123.878662,    sequence: 6 },
        { name: 'Guadalupe (Jollibee)',                  lat: 10.3155822,    lng: 123.885001,    sequence: 7 },
        { name: 'Capitol (Metrobank)',                   lat: 10.3161199,    lng: 123.8912534,   sequence: 8 },
        { name: 'UP Cebu (Oblation Sq.)',                lat: 10.322385,     lng: 123.898391,    sequence: 9 },
    ],
    north: [
        { name: 'SM Consolacion',               lat: 10.379421466919222, lng: 123.96500992917743, sequence: 1 },
        { name: "Home Builder's Consolacion",   lat: 10.378576269510365, lng: 123.96361680702032, sequence: 2 },
        { name: 'UP Cebu Lahug',                lat: 10.32240110974636,  lng: 123.89839499974325, sequence: 3 },
        { name: 'Pacific Mall Mandaue',         lat: 10.340956164883575, lng: 123.9485818683762,  sequence: 4 },
        { name: 'Gaisano Island Mall',          lat: 10.317342554183213, lng: 123.96261657121796, sequence: 5 },
        { name: 'San Miguel Brewery - Tipolo',  lat: 10.330419131323268, lng: 123.93289450989764, sequence: 6 },
        { name: 'Hipodromo',                    lat: 10.313965655571439, lng: 123.91404037008384, sequence: 7 },
        { name: 'CIC / Camp Sotero Cabahug',    lat: 10.312423759176745, lng: 123.90317026577462, sequence: 8 },
    ],
};

/**
 * Resolve a route name (as stored in the DB / passed from UserHome) to the
 * landmark key used in liveMapLandmarks.
 * Returns null if no hardcoded landmark set exists for that name.
 */
export const resolveRouteKey = (routeName = '') => {
    const n = routeName.toLowerCase();
    if (n.includes('north'))      return 'north';
    if (n.includes('south'))      return 'south';
    if (n.includes('cebu city') || n.includes('cebu'))  return 'cebuCity';
    return null;
};

/**
 * Return the route color for a given route name.
 */
export const getRouteColor = (routeName = '') => {
    const key = resolveRouteKey(routeName);
    return key ? ROUTE_COLORS[key] : '#f97316';
};

/**
 * Merge hardcoded landmarks with admin-added API stops for the given route name.
 * Landmarks come first (they are the base layer); API stops are appended.
 * Duplicate positions (same lat/lng rounded to 4 dp) are deduplicated, keeping
 * the API version so admin edits take precedence.
 */
export const getMergedStops = (routeName, apiStops = []) => {
    const key = resolveRouteKey(routeName);
    const landmarks = key ? liveMapLandmarks[key] : [];

    // Build a Set of rounded positions already covered by API stops
    const apiPositions = new Set(
        apiStops.map(s => `${parseFloat(s.latitude).toFixed(4)},${parseFloat(s.longitude).toFixed(4)}`)
    );

    // Only keep landmarks that are NOT already covered by an API stop
    const filteredLandmarks = landmarks.filter(lm => {
        const key = `${lm.lat.toFixed(4)},${lm.lng.toFixed(4)}`;
        return !apiPositions.has(key);
    });

    // Normalise landmark shape to match the API stop shape expected by renderRouteStops
    const normalisedLandmarks = filteredLandmarks.map(lm => ({
        id:         `lm_${lm.sequence}`,
        name:       lm.name,
        latitude:   lm.lat,
        longitude:  lm.lng,
        sequence:   lm.sequence,
        is_active:  true,
        isLandmark: true,
    }));

    // API stops (filter inactive)
    const activeApiStops = apiStops
        .filter(s => s.is_active)
        .map(s => ({ ...s, isLandmark: false }));

    return [...normalisedLandmarks, ...activeApiStops];
};
