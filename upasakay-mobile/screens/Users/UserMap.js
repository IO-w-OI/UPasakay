import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import * as Location from 'expo-location';
import { router, Stack, useLocalSearchParams, useNavigation } from 'expo-router';
import { Pusher } from 'pusher-js/react-native';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  BackHandler,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { WebView } from 'react-native-webview';

import { useTrip } from '../../context/TripContext';
import { apiDelete, apiGet, apiPatch, apiPost } from '../../services/apiClient';
import { currentUser } from '../../services/UserStore';
import { moderateScale, scale } from '../../utils/responsive';

// Server enforces the same threshold — see PickupRequestController
// CANCEL_LOCK_RADIUS_METERS. We mirror it client-side so the Cancel button
// can be visibly disabled (with explanation) instead of failing on submit.
const CANCEL_LOCK_RADIUS_M = 200;

const PUSHER_KEY = process.env.EXPO_PUBLIC_PUSHER_KEY ?? 'f21efd02988d084b7b35';
const PUSHER_CLUSTER = process.env.EXPO_PUBLIC_PUSHER_CLUSTER ?? 'ap1';
const SHUTTLE_POLL_MS = 8000;

const ROUTE_COLORS = { north: '#3b82f6', south: '#22c55e', 'cebu city': '#f97316' };
const getRouteColor = (name = '') => {
  const n = name.toLowerCase();
  for (const [k, c] of Object.entries(ROUTE_COLORS)) {
    if (n.includes(k)) return c;
  }
  return '#f97316';
};

const CANCEL_REASONS = [
  'Changed my mind',
  'Driver is taking too long',
  'Wrong stop selected',
  'Emergency',
  'Other',
];

const isUpcStop = (stop) => {
  if (!stop?.name) return false;
  const n = stop.name.toLowerCase();
  return (n.includes('up') && n.includes('cebu')) || n.includes('upc');
};

// Great-circle distance in km (Haversine) — used to auto-select the nearest
// stop to the passenger's current position.
const haversineKm = (lat1, lng1, lat2, lng2) => {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

// Leaflet map HTML — all JS lives here and communicates back via ReactNativeWebView.postMessage
const leafletHTML = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0" />
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
  <style>
    html, body, #map { height: 100%; margin: 0; padding: 0; }
    .leaflet-control-attribution { display: none; }
    .user-pin {
      background: #2563eb;
      width: 22px; height: 22px;
      border-radius: 50%;
      border: 3px solid #fff;
      box-shadow: 0 0 0 6px rgba(37,99,235,0.25), 0 2px 6px rgba(0,0,0,0.35);
    }
    .shuttle-pin {
      font-size: 30px;
      transition: all 0.6s linear;
      filter: drop-shadow(0 2px 3px rgba(0,0,0,0.4));
    }
  </style>
</head>
<body>
  <div id="map"></div>
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  <script>
    var map = L.map('map', { zoomControl: false }).setView([10.3157, 123.8854], 15);
    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png').addTo(map);

    // ── User location marker (blue dot) ──────────────────────────────────────
    var userMarker = null;
    var userIcon = L.divIcon({
      className: '',
      html: '<div class="user-pin"></div>',
      iconSize: [22, 22],
      iconAnchor: [11, 11],
    });

    window.setUserLocation = function(lat, lng, pan) {
      if (!userMarker) {
        userMarker = L.marker([lat, lng], { icon: userIcon }).addTo(map);
      } else {
        userMarker.setLatLng([lat, lng]);
      }
      if (pan) map.setView([lat, lng], 16, { animate: true });
    };

    // ── Live shuttle markers ──────────────────────────────────────────────────
    var shuttleMarkers = {};
    var shuttleIcon = L.divIcon({
      className: '',
      html: '<div class="shuttle-pin">🚌</div>',
      iconSize: [34, 34],
      iconAnchor: [17, 17],
    });

    window.upsertShuttle = function(id, lat, lng) {
      if (shuttleMarkers[id]) {
        shuttleMarkers[id].setLatLng([lat, lng]);
      } else {
        shuttleMarkers[id] = L.marker([lat, lng], { icon: shuttleIcon, zIndexOffset: 1000 }).addTo(map);
      }
    };

    window.syncShuttles = function(ids) {
      Object.keys(shuttleMarkers).forEach(function(key) {
        if (ids.indexOf(parseInt(key, 10)) === -1 && ids.indexOf(key) === -1) {
          map.removeLayer(shuttleMarkers[key]);
          delete shuttleMarkers[key];
        }
      });
    };

    // ── Route stop markers ────────────────────────────────────────────────────
    var stopMarkers = {};

    window.renderRouteStops = function(stops, color) {
      Object.keys(stopMarkers).forEach(function(k) { map.removeLayer(stopMarkers[k]); });
      stopMarkers = {};

      var valid = stops.filter(function(s) {
        return s.is_active && s.latitude && s.longitude;
      });

      valid.forEach(function(stop) {
        var marker = L.circleMarker(
          [parseFloat(stop.latitude), parseFloat(stop.longitude)],
          { radius: 10, color: '#fff', fillColor: color, fillOpacity: 1, weight: 2.5, bubblingMouseEvents: false }
        );

        marker.on('click', function() {
          window.ReactNativeWebView.postMessage(JSON.stringify({
            type: 'STOP_TAPPED',
            id: stop.id,
            name: stop.name,
            lat: parseFloat(stop.latitude),
            lng: parseFloat(stop.longitude),
            sequence: stop.sequence,
          }));
        });

        marker.addTo(map);
        stopMarkers[stop.id] = marker;
      });

      var all = Object.keys(stopMarkers).map(function(k) { return stopMarkers[k]; });
      if (all.length > 0) {
        map.fitBounds(L.featureGroup(all).getBounds(), { padding: [60, 60] });
      }
    };

    // Recolour the chosen pickup/dropoff stops so the selection is visible.
    window.markStops = function(pickupId, dropoffId, color) {
      Object.keys(stopMarkers).forEach(function(k) {
        var m = stopMarkers[k];
        if (k == pickupId) {
          m.setStyle({ fillColor: '#22c55e', radius: 13, weight: 3 });
        } else if (k == dropoffId) {
          m.setStyle({ fillColor: '#ef4444', radius: 13, weight: 3 });
        } else {
          m.setStyle({ fillColor: color, radius: 10, weight: 2.5 });
        }
      });
    };

    window.highlightStop = function(lat, lng) {
      map.setView([lat, lng], 16, { animate: true });
    };

    // While waiting for the driver, keep both the passenger and the live
    // (moving) shuttle on screen so the bus is always visible approaching.
    window.fitUserAndShuttles = function() {
      var pts = [];
      if (userMarker) pts.push(userMarker.getLatLng());
      Object.keys(shuttleMarkers).forEach(function(k) {
        pts.push(shuttleMarkers[k].getLatLng());
      });
      if (pts.length === 1) {
        map.setView(pts[0], 16, { animate: true });
      } else if (pts.length > 1) {
        map.fitBounds(L.latLngBounds(pts), { padding: [90, 90], maxZoom: 16 });
      }
    };
  </script>
</body>
</html>
`;

const UserMap = () => {
  const { routeId, busName } = useLocalSearchParams();
  const { activeBooking, refreshActiveBooking } = useTrip();
  const navigation = useNavigation();
  const webRef = useRef(null);
  const pusherRef = useRef(null);
  const trackedShuttleIds = useRef(new Set());
  // Latest GPS of the assigned shuttle — kept fresh by both pollShuttles
  // and the Pusher 'location.updated' event. Used to compute the cancel
  // proximity guard without an extra round trip.
  const assignedShuttleLocRef = useRef(null);

  const [mapLoaded, setMapLoaded] = useState(false);
  const [routeStops, setRouteStops] = useState([]);
  const [routeColor, setRouteColor] = useState('#f97316');
  const [pickupStop, setPickupStop] = useState(null); // { id, name, lat, lng, sequence }
  const [dropoffStop, setDropoffStop] = useState(null);
  const [selecting, setSelecting] = useState('pickup'); // 'pickup' | 'dropoff'
  const [paraLoading, setParaLoading] = useState(false);
  const [shuttleOnline, setShuttleOnline] = useState(false);

  // Booking lifecycle: 'book' (choosing stops) → 'waiting' (driver coming,
  // live shuttle on the map) → 'onboard' (boarded). Reset on completion.
  const [phase, setPhase] = useState('book');
  const [pickupRequestId, setPickupRequestId] = useState(null);
  const [driverInfo, setDriverInfo] = useState(null); // { name, shuttle, eta }
  // The shuttle assigned to the current request. Set once the server-side
  // active-booking snapshot arrives (or as ride.accepted fires). We use this
  // to filter Pusher location updates down to "our" shuttle only.
  const [assignedShuttleId, setAssignedShuttleId] = useState(null);
  // Live distance (metres) from the assigned shuttle to the pickup stop —
  // drives the cancel proximity guard. null when unknown.
  const [shuttleDistanceM, setShuttleDistanceM] = useState(null);

  // Cancel-reason modal
  const [cancelVisible, setCancelVisible] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [cancelOtherText, setCancelOtherText] = useState('');

  const phaseRef = useRef('book');
  useEffect(() => {
    phaseRef.current = phase;
  }, [phase]);

  // Mirrors for pollShuttles (which is memoised on routeId only) so we don't
  // need to recreate the 8s polling interval whenever stops or shuttle change.
  const assignedShuttleIdRef = useRef(null);
  const pickupStopRef = useRef(null);
  useEffect(() => {
    assignedShuttleIdRef.current = assignedShuttleId;
  }, [assignedShuttleId]);
  useEffect(() => {
    pickupStopRef.current = pickupStop;
  }, [pickupStop]);

  const passengerId = currentUser?.passenger_id ?? currentUser?.id ?? null;

  // ── Lock the screen while a booking is in flight ──────────────────────────
  // Three layers of protection so the passenger can't accidentally leave the
  // waiting/onboard view:
  //   1. Consume Android hardware back (gesture + button).
  //   2. Veto any React Navigation removal event (catches router.back(),
  //      router.replace() from anywhere, and the in-app back arrow tap).
  //   3. Disable iOS swipe-back via Stack.Screen options below.
  // The only intended exit is Cancel (subject to the 200m proximity guard)
  // or ride completion.
  const locked = phase === 'waiting' || phase === 'onboard';

  useEffect(() => {
    if (!locked) return;
    const sub = BackHandler.addEventListener('hardwareBackPress', () => true);
    return () => sub.remove();
  }, [locked]);

  useEffect(() => {
    if (!locked) return;
    const unsub = navigation.addListener('beforeRemove', (e) => {
      e.preventDefault();
    });
    return unsub;
  }, [locked, navigation]);

  // ── Hydrate from any in-flight pickup request ─────────────────────────────
  // Refresh once on mount so the screen recovers state when the passenger
  // arrives here via the active-trip banner, a push notification, or after
  // killing/relaunching the app mid-ride.
  useEffect(() => {
    refreshActiveBooking();
  }, [refreshActiveBooking]);

  // When the trip context's activeBooking snapshot updates, seed the
  // booking-card state so the waiting/onboard UI shows the right driver,
  // stops, and assigned shuttle without needing the user to re-Para.
  useEffect(() => {
    const pr = activeBooking?.pickup_request;
    if (!pr) return;

    setPickupRequestId(pr.id);

    const seedStop = (s) =>
      s
        ? {
            id: s.id,
            name: s.name,
            lat: parseFloat(s.latitude),
            lng: parseFloat(s.longitude),
            sequence: s.sequence,
          }
        : null;
    if (pr.pickup_stop) setPickupStop(seedStop(pr.pickup_stop));
    if (pr.dropoff_stop) setDropoffStop(seedStop(pr.dropoff_stop));

    const driver = pr.assignment?.driver;
    const shuttle = driver?.shuttle;
    if (driver || shuttle) {
      setDriverInfo({
        name: driver?.user?.full_name ?? driver?.name ?? 'Your driver',
        shuttle: shuttle?.shuttle_code ?? null,
        eta: pr.eta_minutes ?? null,
      });
    }
    if (shuttle?.id) {
      setAssignedShuttleId(shuttle.id);
      const latest = shuttle.latest_location;
      if (latest?.latitude != null && latest?.longitude != null) {
        assignedShuttleLocRef.current = {
          lat: parseFloat(latest.latitude),
          lng: parseFloat(latest.longitude),
        };
      }
    }

    if (activeBooking?.shuttle_distance_meters != null) {
      setShuttleDistanceM(activeBooking.shuttle_distance_meters);
    }

    setPhase(pr.status === 'in_progress' ? 'onboard' : 'waiting');
  }, [activeBooking]);

  // Recompute shuttle→pickup distance whenever either side moves.
  useEffect(() => {
    if (!pickupStop || !assignedShuttleLocRef.current) {
      setShuttleDistanceM(null);
      return;
    }
    const { lat, lng } = assignedShuttleLocRef.current;
    const km = haversineKm(lat, lng, pickupStop.lat, pickupStop.lng);
    setShuttleDistanceM(km * 1000);
  }, [pickupStop, assignedShuttleId]);

  // ── 1. GPS permission + auto-center ────────────────────────────────────────
  const locateUser = useCallback(async (pan = true) => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Location Access Needed',
        'Turn on location services so the app can show your position near the bus stops.',
        [{ text: 'OK' }]
      );
      return;
    }
    const loc = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
    });
    const { latitude, longitude } = loc.coords;
    webRef.current?.injectJavaScript(
      `window.setUserLocation(${latitude}, ${longitude}, ${pan}); true;`
    );
  }, []);

  // ── 2. Fetch route stops from the API, then auto-select nearest pickup ────
  useEffect(() => {
    setRouteColor(getRouteColor(busName));
    if (!routeId) return;
    apiGet(`routes/${routeId}`).then(async ({ ok, data }) => {
      if (!ok || !Array.isArray(data?.stops)) return;
      const stops = data.stops.filter((s) => s.is_active);
      setRouteStops(stops);

      // Only auto-pick if the passenger hasn't already chosen a pickup.
      if (pickupStop) return;

      const upc = stops.find(isUpcStop);
      const geoStops = stops.filter((s) => s.latitude != null && s.longitude != null);
      if (geoStops.length === 0) return;

      try {
        const { status: perm } = await Location.requestForegroundPermissionsAsync();
        if (perm !== 'granted') return;
        const pos = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });
        const { latitude: myLat, longitude: myLng } = pos.coords;

        let nearest = geoStops[0];
        let bestKm = haversineKm(
          myLat,
          myLng,
          parseFloat(nearest.latitude),
          parseFloat(nearest.longitude),
        );
        for (const s of geoStops.slice(1)) {
          const d = haversineKm(
            myLat,
            myLng,
            parseFloat(s.latitude),
            parseFloat(s.longitude),
          );
          if (d < bestKm) {
            bestKm = d;
            nearest = s;
          }
        }

        const pickup = {
          id: nearest.id,
          name: nearest.name,
          lat: parseFloat(nearest.latitude),
          lng: parseFloat(nearest.longitude),
          sequence: nearest.sequence,
        };
        setPickupStop(pickup);

        // Enforce the "one side must be UP Cebu" rule on auto-pick too:
        // if the nearest isn't UPC, lock drop-off to UPC; if it is, leave
        // drop-off for the passenger to choose.
        if (upc && pickup.id !== upc.id) {
          setDropoffStop({
            id: upc.id,
            name: upc.name,
            lat: parseFloat(upc.latitude),
            lng: parseFloat(upc.longitude),
            sequence: upc.sequence,
          });
          setSelecting('pickup');
        } else if (upc && pickup.id === upc.id) {
          setSelecting('dropoff');
        }
      } catch (_) {
        // GPS unavailable — leave the passenger to tap a stop manually.
      }
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [routeId, busName]);

  // ── 3. Inject stop pins once map is loaded and stops are fetched ───────────
  useEffect(() => {
    if (!mapLoaded || routeStops.length === 0) return;
    webRef.current?.injectJavaScript(
      `window.renderRouteStops(${JSON.stringify(routeStops)}, '${routeColor}'); true;`
    );
  }, [mapLoaded, routeStops, routeColor]);

  // Recolour pickup/dropoff pins and pan to the pickup whenever they change
  // (covers both auto-selection and manual taps).
  useEffect(() => {
    if (!mapLoaded || routeStops.length === 0) return;
    webRef.current?.injectJavaScript(
      `window.markStops(${pickupStop?.id ?? 'null'}, ${dropoffStop?.id ?? 'null'}, '${routeColor}');` +
        (pickupStop ? ` window.highlightStop(${pickupStop.lat}, ${pickupStop.lng});` : '') +
        ' true;'
    );
  }, [mapLoaded, routeStops, pickupStop, dropoffStop, routeColor]);

  // ── 4. Live shuttle positions: poll + Pusher ──────────────────────────────
  const pollShuttles = useCallback(async () => {
    if (!routeId) return;
    const { ok, data } = await apiGet(`routes/${routeId}/shuttles`);
    if (!ok || !Array.isArray(data)) return;

    const ids = data.map((s) => s.id);
    trackedShuttleIds.current = new Set(ids);
    setShuttleOnline(ids.length > 0);

    data.forEach((s) => {
      webRef.current?.injectJavaScript(
        `window.upsertShuttle(${s.id}, ${s.latitude}, ${s.longitude}); true;`
      );
      // Track our assigned shuttle's latest GPS for the cancel proximity guard.
      // Read assignedShuttleId / pickupStop via refs so pollShuttles doesn't
      // need to be re-created (and the 8s interval reset) on every change.
      const myShuttle = assignedShuttleIdRef.current;
      if (myShuttle && s.id === myShuttle) {
        assignedShuttleLocRef.current = {
          lat: parseFloat(s.latitude),
          lng: parseFloat(s.longitude),
        };
        const pickup = pickupStopRef.current;
        if (pickup) {
          const km = haversineKm(
            assignedShuttleLocRef.current.lat,
            assignedShuttleLocRef.current.lng,
            pickup.lat,
            pickup.lng,
          );
          setShuttleDistanceM(km * 1000);
        }
      }
    });
    webRef.current?.injectJavaScript(
      `window.syncShuttles(${JSON.stringify(ids)});` +
        (phaseRef.current === 'waiting' ? ' window.fitUserAndShuttles();' : '') +
        ' true;'
    );
  }, [routeId]);

  useEffect(() => {
    if (!mapLoaded) return;
    pollShuttles();
    const interval = setInterval(pollShuttles, SHUTTLE_POLL_MS);
    return () => clearInterval(interval);
  }, [mapLoaded, pollShuttles]);

  useEffect(() => {
    if (!mapLoaded) return;
    let pusher;
    try {
      pusher = new Pusher(PUSHER_KEY, { cluster: PUSHER_CLUSTER, forceTLS: true });
      pusherRef.current = pusher;

      // Live shuttle GPS — moves the bus marker as the driver drives.
      const locCh = pusher.subscribe('shuttle-locations');
      locCh.bind('location.updated', (payload) => {
        if (!payload?.id) return;
        // Only move shuttles we know belong to this route.
        if (!trackedShuttleIds.current.has(payload.id)) return;
        webRef.current?.injectJavaScript(
          `window.upsertShuttle(${payload.id}, ${payload.latitude}, ${payload.longitude});` +
            (phaseRef.current === 'waiting' ? ' window.fitUserAndShuttles();' : '') +
            ' true;'
        );
        // Keep the proximity guard fresh between 8s polls.
        if (assignedShuttleIdRef.current && payload.id === assignedShuttleIdRef.current) {
          assignedShuttleLocRef.current = {
            lat: parseFloat(payload.latitude),
            lng: parseFloat(payload.longitude),
          };
          const pickup = pickupStopRef.current;
          if (pickup) {
            const km = haversineKm(
              assignedShuttleLocRef.current.lat,
              assignedShuttleLocRef.current.lng,
              pickup.lat,
              pickup.lng,
            );
            setShuttleDistanceM(km * 1000);
          }
        }
      });

      // Passenger-specific channel: driver assigned / boarded / ride done.
      if (passengerId != null) {
        const paxCh = pusher.subscribe(`passenger-${passengerId}`);

        paxCh.bind('ride.accepted', (data) => {
          setDriverInfo({
            name: data?.driver_name ?? 'Your driver',
            shuttle: data?.shuttle_number ?? null,
            eta: data?.eta_minutes ?? null,
          });
          if (data?.pickup_request_id) setPickupRequestId(data.pickup_request_id);
          if (data?.shuttle_id) setAssignedShuttleId(data.shuttle_id);
          setPhase('waiting');
          webRef.current?.injectJavaScript('window.fitUserAndShuttles(); true;');
          // The full active-booking snapshot (assigned shuttle, latest GPS,
          // distance) is now valid — fetch it so the proximity guard arms
          // immediately rather than waiting for the first location event.
          refreshActiveBooking();
        });

        paxCh.bind('passenger.boarded', () => setPhase('onboard'));

        paxCh.bind('ride.completed', () => {
          setPhase('book');
          setDriverInfo(null);
          setPickupRequestId(null);
          setAssignedShuttleId(null);
          setShuttleDistanceM(null);
          assignedShuttleLocRef.current = null;
        });
      }
    } catch (e) {
      console.warn('[Pusher] init error', e);
    }
    return () => {
      try {
        pusherRef.current?.disconnect();
        pusherRef.current = null;
      } catch {}
    };
  }, [mapLoaded, passengerId]);

  // Compute the route's UP Cebu stop (if any) — used to enforce that one side
  // of every booking is always UPC.
  const upcStop = routeStops.find(isUpcStop) ?? null;
  const upcStopObj = upcStop
    ? {
        id: upcStop.id,
        name: upcStop.name,
        lat: parseFloat(upcStop.latitude),
        lng: parseFloat(upcStop.longitude),
        sequence: upcStop.sequence,
      }
    : null;
  const isPickupUPC = Boolean(pickupStop && upcStopObj && pickupStop.id === upcStopObj.id);

  // ── 5. Handle messages from Leaflet ───────────────────────────────────────
  const handleMessage = (event) => {
    try {
      const msg = JSON.parse(event.nativeEvent.data);
      if (msg.type !== 'STOP_TAPPED') return;

      const stop = { id: msg.id, name: msg.name, lat: msg.lat, lng: msg.lng, sequence: msg.sequence };
      const tappedIsUPC = upcStopObj && stop.id === upcStopObj.id;

      let nextPickup = pickupStop;
      let nextDropoff = dropoffStop;

      if (selecting === 'pickup') {
        nextPickup = stop;
        setPickupStop(stop);

        if (upcStopObj) {
          if (!tappedIsUPC) {
            // Non-UPC pickup → drop-off is automatically UPC.
            nextDropoff = upcStopObj;
            setDropoffStop(upcStopObj);
          } else {
            // UPC pickup → clear drop-off so the passenger can choose, and
            // jump the selector to drop-off as a UX cue.
            nextDropoff = null;
            setDropoffStop(null);
            setSelecting('dropoff');
          }
        } else if (!dropoffStop) {
          setSelecting('dropoff');
        }
      } else {
        // Drop-off slot tap: only meaningful when pickup is UPC. Otherwise
        // tell the passenger why the drop-off is locked instead of silently
        // ignoring the tap.
        if (upcStopObj && !isPickupUPC && pickupStop) {
          Alert.alert(
            'Drop-off Locked',
            "When you're not coming from UP Cebu, your drop-off is automatically UP Cebu."
          );
          return;
        }
        if (upcStopObj && tappedIsUPC) {
          Alert.alert(
            'Same Stop',
            'Drop-off cannot also be UP Cebu. Tap another stop.'
          );
          return;
        }
        nextDropoff = stop;
        setDropoffStop(stop);
      }

      webRef.current?.injectJavaScript(
        `window.highlightStop(${msg.lat}, ${msg.lng}); ` +
          `window.markStops(${nextPickup?.id ?? 'null'}, ${nextDropoff?.id ?? 'null'}, '${routeColor}'); true;`
      );
    } catch (_) {}
  };

  const selectSlot = (slot) => {
    setSelecting(slot);
    const stop = slot === 'pickup' ? pickupStop : dropoffStop;
    if (stop) {
      webRef.current?.injectJavaScript(`window.highlightStop(${stop.lat}, ${stop.lng}); true;`);
    }
  };

  // ── 6. Para! → real pickup request ────────────────────────────────────────
  const handlePara = async () => {
    if (!pickupStop || !dropoffStop) {
      Alert.alert(
        'Choose Both Stops',
        'Tap a stop on the map for your pick-up point and another for your drop-off.'
      );
      return;
    }
    if (pickupStop.id === dropoffStop.id) {
      Alert.alert('Pick Different Stops', 'Your pick-up and drop-off must be different stops.');
      return;
    }

    setParaLoading(true);
    try {
      const { ok, status, data } = await apiPost('pickup-requests', {
        route_id: Number(routeId),
        pickup_stop_id: pickupStop.id,
        dropoff_stop_id: dropoffStop.id,
      });

      if (ok) {
        const accepted = data?.status === 'accepted' || data?.status === 'in_progress';
        setPickupRequestId(data?.id ?? null);
        // Driver name arrives on the `ride.accepted` broadcast; seed ETA now
        // if the request was auto-accepted so the card isn't blank.
        setDriverInfo(accepted ? { name: null, shuttle: null, eta: data?.eta_minutes ?? null } : null);
        if (data?.status === 'in_progress') {
          setPhase('onboard');
        } else {
          setPhase('waiting');
          // Frame the passenger + the live shuttle so the bus is visible
          // moving toward the pick-up while they wait.
          webRef.current?.injectJavaScript('window.fitUserAndShuttles(); true;');
        }
        return;
      }

      // Surface the most specific backend message we can.
      let message = data?.message || 'Could not request a ride. Please try again.';
      if (status === 422 && data?.errors) {
        const first = Object.values(data.errors)[0];
        if (Array.isArray(first) && first[0]) message = first[0];
        else if (typeof first === 'string') message = first;
      }
      Alert.alert('Ride Not Requested', message);
    } finally {
      setParaLoading(false);
    }
  };

  // Cancel is locked when the assigned shuttle is within 200m of the pickup
  // stop — the driver is essentially arriving. Mirrors the server-side guard
  // in PickupRequestController::update so we fail fast in the UI.
  const cancelLocked =
    shuttleDistanceM != null && shuttleDistanceM < CANCEL_LOCK_RADIUS_M;

  // Tapping "Cancel" opens the reason modal; the actual cancellation runs in
  // handleCancelConfirm once the passenger picks a reason. The reason is
  // surfaced to admins so we can spot patterns (e.g. drivers taking too long).
  const handleCancelPress = () => {
    if (cancelLocked) {
      Alert.alert(
        "Can't cancel right now",
        "The shuttle is already arriving — you can't cancel within 200 metres of the pickup. Please wait for the driver."
      );
      return;
    }
    setCancelReason('');
    setCancelOtherText('');
    setCancelVisible(true);
  };

  const handleCancelConfirm = async () => {
    const reason =
      cancelReason === 'Other'
        ? cancelOtherText.trim() || 'Other'
        : cancelReason;

    setCancelVisible(false);

    if (pickupRequestId) {
      // PATCH so cancel_reason is stored against the request. The server
      // re-checks the 200m proximity guard, so a stale-client bypass still
      // gets rejected with a clear message we surface below.
      const { ok, data } = await apiPatch(`pickup-requests/${pickupRequestId}`, {
        status: 'cancelled',
        cancel_reason: reason,
      });
      if (!ok) {
        if (data?.message) {
          Alert.alert("Can't cancel right now", data.message);
          return;
        }
        // Fall through to local reset on transport-level failures so the
        // passenger isn't trapped on a dead screen.
        apiDelete(`pickup-requests/${pickupRequestId}`).catch(() => {});
      }
    }

    setPhase('book');
    setDriverInfo(null);
    setPickupRequestId(null);
    setAssignedShuttleId(null);
    setShuttleDistanceM(null);
    assignedShuttleLocRef.current = null;
    refreshActiveBooking();
    if (routeStops.length > 0) {
      webRef.current?.injectJavaScript('window.fitUserAndShuttles(); true;');
    }
  };

  const canBook =
    pickupStop &&
    dropoffStop &&
    pickupStop.id !== dropoffStop.id &&
    (!routeStops.length || upcStopObj) &&
    (!upcStopObj ||
      pickupStop.id === upcStopObj.id ||
      dropoffStop.id === upcStopObj.id);

  return (
    <View style={styles.container}>
      {/* Disable iOS swipe-back when an active booking is in flight; the
          back button itself is also hidden below. The only exit is Cancel. */}
      <Stack.Screen options={{ gestureEnabled: !locked }} />

      <WebView
        ref={webRef}
        originWhitelist={['*']}
        source={{ html: leafletHTML }}
        style={StyleSheet.absoluteFill}
        javaScriptEnabled
        domStorageEnabled
        onLoad={() => {
          setMapLoaded(true);
          locateUser();
        }}
        onMessage={handleMessage}
      />

      {/* Back button — only while the passenger is still choosing stops.
          Once a booking is in flight, the only way out is Cancel. */}
      {!locked && (
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()} activeOpacity={0.8}>
          <BlurView intensity={80} tint="light" style={styles.glassSmall}>
            <Ionicons name="arrow-back" size={22} color="#1A2E1A" />
          </BlurView>
        </TouchableOpacity>
      )}

      {/* Shuttle status chip */}
      <View style={styles.statusChip}>
        <View style={[styles.statusDot, { backgroundColor: shuttleOnline ? '#22c55e' : '#9ca3af' }]} />
        <Text style={styles.statusText}>
          {shuttleOnline ? 'Shuttle online' : 'No shuttle online'}
        </Text>
      </View>

      {/* Recenter button */}
      <TouchableOpacity style={styles.recenterBtn} onPress={() => locateUser(true)} activeOpacity={0.8}>
        <BlurView intensity={90} tint="light" style={styles.glassButton}>
          <Ionicons
            name="navigate"
            size={26}
            color="#1A2E1A"
            style={{ transform: [{ translateX: -2 }, { translateY: -1.5 }] }}
          />
        </BlurView>
      </TouchableOpacity>

      {/* Bottom card — booking → waiting (live shuttle) → onboard */}
      <View style={styles.card}>
        {phase === 'book' && (
          <>
            <Text style={styles.routeLabel}>{busName ?? 'Bus Route'}</Text>
            <Text style={styles.cardTitle}>Book a Ride</Text>

            {/* Pick-up slot */}
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => selectSlot('pickup')}
              style={[styles.stopRow, selecting === 'pickup' && styles.stopRowActive]}
            >
              <View style={[styles.stopDot, { backgroundColor: pickupStop ? '#22c55e' : '#ccc' }]} />
              <View style={{ flex: 1 }}>
                <Text style={styles.slotLabel}>PICK-UP</Text>
                <Text
                  style={[styles.stopName, !pickupStop && styles.stopPlaceholder]}
                  numberOfLines={1}
                >
                  {pickupStop ? pickupStop.name : 'Tap a stop on the map'}
                </Text>
              </View>
              {pickupStop && <Text style={styles.stopSeq}>#{pickupStop.sequence}</Text>}
            </TouchableOpacity>

            {/* Drop-off slot. When pickup is set but is NOT UP Cebu, the
                drop-off is locked to UPC (auto). When pickup is UPC the
                passenger picks. */}
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => selectSlot('dropoff')}
              disabled={Boolean(pickupStop && !isPickupUPC && upcStopObj)}
              style={[styles.stopRow, selecting === 'dropoff' && styles.stopRowActive]}
            >
              <View style={[styles.stopDot, { backgroundColor: dropoffStop ? '#ef4444' : '#ccc' }]} />
              <View style={{ flex: 1 }}>
                <Text style={styles.slotLabel}>DROP-OFF</Text>
                <Text
                  style={[styles.stopName, !dropoffStop && styles.stopPlaceholder]}
                  numberOfLines={1}
                >
                  {dropoffStop ? dropoffStop.name : 'Tap a stop on the map'}
                </Text>
              </View>
              {pickupStop && !isPickupUPC && upcStopObj ? (
                <Text style={styles.autoBadge}>auto</Text>
              ) : dropoffStop ? (
                <Text style={styles.stopSeq}>#{dropoffStop.sequence}</Text>
              ) : null}
            </TouchableOpacity>

            {routeStops.length > 0 && !upcStopObj && (
              <Text style={styles.upcWarning}>
                This route has no UP Cebu stop configured. Booking unavailable.
              </Text>
            )}

            <TouchableOpacity
              style={[styles.paraBtn, (!canBook || paraLoading) && styles.paraBtnLoading]}
              onPress={handlePara}
              disabled={!canBook || paraLoading}
              activeOpacity={0.85}
            >
              {paraLoading ? (
                <ActivityIndicator color="#1A2E1A" />
              ) : (
                <Text style={styles.paraText}>Para!</Text>
              )}
            </TouchableOpacity>
          </>
        )}

        {phase === 'waiting' && (
          <>
            <View style={styles.waitHeader}>
              <View style={{ flex: 1 }}>
                <Text style={styles.waitTitle}>
                  {driverInfo?.eta != null
                    ? `Arriving in ~${driverInfo.eta} min`
                    : driverInfo
                      ? 'Your shuttle is on the way'
                      : 'Finding your driver…'}
                </Text>
                <Text style={styles.waitSub}>
                  {driverInfo
                    ? 'Watch the bus move on the map above.'
                    : "You're in the queue — the driver will be notified."}
                </Text>
              </View>
              {!driverInfo && <ActivityIndicator color="#1A2E1A" />}
            </View>

            <View style={styles.driverRow}>
              <View style={styles.driverAvatar}>
                <Ionicons name="person" size={22} color="#1A2E1A" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.driverName}>
                  {driverInfo?.name ?? 'Awaiting acceptance…'}
                </Text>
                <Text style={styles.driverMeta}>
                  {driverInfo?.shuttle ? `Shuttle ${driverInfo.shuttle}` : (busName ?? 'Bus Route')}
                </Text>
              </View>
            </View>

            {pickupRequestId && (
              <TouchableOpacity
                style={styles.boardBtn}
                onPress={() =>
                  router.push({ pathname: '/UserScan', params: { requestId: String(pickupRequestId) } })
                }
                activeOpacity={0.85}
              >
                <Ionicons name="qr-code-outline" size={20} color="#1A2E1A" />
                <Text style={styles.boardBtnText}>{"I'm on the bus — scan to board"}</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={[styles.cancelBtn, cancelLocked && styles.cancelBtnLocked]}
              onPress={handleCancelPress}
              activeOpacity={0.85}
            >
              <Text style={styles.cancelText}>
                {cancelLocked ? 'Cancel locked — shuttle arriving' : 'Cancel'}
              </Text>
            </TouchableOpacity>
          </>
        )}

        {phase === 'onboard' && (
          <View style={styles.onboardBox}>
            <Ionicons name="checkmark-circle" size={46} color="#1A7F37" />
            <Text style={styles.onboardTitle}>{"You're on board"}</Text>
            <Text style={styles.onboardSub}>Enjoy your ride with UPasakay!</Text>
          </View>
        )}
      </View>

      {cancelVisible && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalDim} />
          <View style={styles.cancelModal}>
            <Text style={styles.cancelModalTitle}>Why are you cancelling?</Text>
            <Text style={styles.cancelModalSub}>This helps us improve the service.</Text>
            {CANCEL_REASONS.map((reason) => (
              <TouchableOpacity
                key={reason}
                style={[styles.cancelOption, cancelReason === reason && styles.cancelOptionActive]}
                onPress={() => setCancelReason(reason)}
                activeOpacity={0.85}
              >
                <Ionicons
                  name={cancelReason === reason ? 'radio-button-on' : 'radio-button-off'}
                  size={20}
                  color={cancelReason === reason ? '#8B211E' : '#999'}
                  style={{ marginRight: 10 }}
                />
                <Text
                  style={[
                    styles.cancelOptionText,
                    cancelReason === reason && styles.cancelOptionTextActive,
                  ]}
                >
                  {reason}
                </Text>
              </TouchableOpacity>
            ))}
            {cancelReason === 'Other' && (
              <TextInput
                style={styles.cancelOtherInput}
                placeholder="Please describe..."
                placeholderTextColor="#999"
                value={cancelOtherText}
                onChangeText={setCancelOtherText}
                maxLength={200}
              />
            )}
            <TouchableOpacity
              style={[styles.cancelConfirmBtn, !cancelReason && { opacity: 0.45 }]}
              onPress={handleCancelConfirm}
              disabled={!cancelReason}
              activeOpacity={0.85}
            >
              <Text style={styles.cancelConfirmText}>Confirm Cancellation</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.cancelModalBack}
              onPress={() => setCancelVisible(false)}
              activeOpacity={0.85}
            >
              <Text style={styles.cancelModalBackText}>Keep my booking</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  backBtn: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 55 : 45,
    left: scale(16),
    zIndex: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  statusChip: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 60 : 50,
    alignSelf: 'center',
    zIndex: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255,255,255,0.92)',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 4,
  },
  statusDot: { width: 9, height: 9, borderRadius: 5 },
  statusText: { fontFamily: 'Nunito-Bold', fontSize: moderateScale(12), color: '#1A2E1A' },
  recenterBtn: {
    position: 'absolute',
    bottom: moderateScale(245),
    right: scale(16),
    zIndex: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
  },
  glassSmall: {
    width: moderateScale(44),
    height: moderateScale(44),
    borderRadius: moderateScale(22),
    backgroundColor: 'rgba(212,230,213,0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.45)',
  },
  glassButton: {
    width: moderateScale(56),
    height: moderateScale(56),
    borderRadius: moderateScale(28),
    backgroundColor: 'rgba(212,230,213,0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.4)',
  },
  card: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#F4F7F4',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: scale(24),
    paddingTop: moderateScale(20),
    paddingBottom: Platform.OS === 'ios' ? moderateScale(40) : moderateScale(28),
    borderWidth: 1.5,
    borderBottomWidth: 0,
    borderColor: '#3e5141',
    elevation: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  routeLabel: {
    fontSize: moderateScale(11),
    fontFamily: 'Nunito-SemiBold',
    color: '#888',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 2,
  },
  cardTitle: {
    fontSize: moderateScale(22),
    fontFamily: 'Nunito-Bold',
    color: '#1A2E1A',
    marginBottom: moderateScale(12),
  },
  stopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: moderateScale(12),
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: '#E2E8E2',
    marginBottom: moderateScale(10),
  },
  stopRowActive: {
    borderColor: '#3e5141',
  },
  stopDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 12,
  },
  slotLabel: {
    fontFamily: 'Nunito-Bold',
    fontSize: moderateScale(10),
    color: '#999',
    letterSpacing: 1,
    marginBottom: 1,
  },
  stopName: {
    fontFamily: 'Nunito-Bold',
    fontSize: moderateScale(15),
    color: '#1A2E1A',
  },
  stopPlaceholder: {
    color: '#bbb',
    fontFamily: 'Nunito-Regular',
    fontStyle: 'italic',
  },
  stopSeq: {
    fontFamily: 'Nunito-Bold',
    fontSize: moderateScale(12),
    color: '#999',
    marginLeft: 6,
  },
  paraBtn: {
    backgroundColor: '#FFB82E',
    height: moderateScale(54),
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: moderateScale(4),
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  paraBtnLoading: {
    opacity: 0.5,
  },
  paraText: {
    fontSize: moderateScale(20),
    color: '#1A2E1A',
    fontFamily: 'Nunito-Black',
  },

  // ── Waiting / onboard states ──────────────────────────────────────────────
  waitHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  waitTitle: {
    fontSize: moderateScale(20),
    fontFamily: 'Nunito-Bold',
    color: '#1A2E1A',
  },
  waitSub: {
    fontSize: moderateScale(13),
    fontFamily: 'Nunito-Regular',
    color: '#666',
    marginTop: 2,
  },
  driverRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: moderateScale(12),
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: '#E2E8E2',
    marginTop: moderateScale(14),
    marginBottom: moderateScale(14),
  },
  driverAvatar: {
    width: moderateScale(42),
    height: moderateScale(42),
    borderRadius: moderateScale(21),
    backgroundColor: '#D4E6D5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  driverName: {
    fontSize: moderateScale(16),
    fontFamily: 'Nunito-Bold',
    color: '#1A2E1A',
  },
  driverMeta: {
    fontSize: moderateScale(13),
    fontFamily: 'Nunito-Regular',
    color: '#666',
    marginTop: 1,
  },
  boardBtn: {
    flexDirection: 'row',
    gap: 8,
    backgroundColor: '#FFB82E',
    height: moderateScale(54),
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: moderateScale(10),
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  boardBtnText: {
    fontSize: moderateScale(16),
    color: '#1A2E1A',
    fontFamily: 'Nunito-Black',
  },
  cancelBtn: {
    backgroundColor: '#8B211E',
    height: moderateScale(50),
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelBtnLocked: {
    backgroundColor: '#9ca3af',
  },
  cancelText: {
    color: '#fff',
    fontSize: moderateScale(16),
    fontFamily: 'Nunito-Black',
  },
  onboardBox: {
    alignItems: 'center',
    paddingVertical: moderateScale(26),
  },
  onboardTitle: {
    fontSize: moderateScale(20),
    fontFamily: 'Nunito-Bold',
    color: '#1A2E1A',
    marginTop: 8,
  },
  onboardSub: {
    fontSize: moderateScale(13),
    fontFamily: 'Nunito-Regular',
    color: '#666',
    marginTop: 3,
  },

  autoBadge: {
    fontSize: moderateScale(10),
    fontFamily: 'Nunito-Bold',
    color: '#666',
    backgroundColor: '#eee',
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginLeft: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  upcWarning: {
    fontSize: moderateScale(12),
    color: '#8B211E',
    fontFamily: 'Nunito-Regular',
    marginTop: 2,
    marginBottom: 8,
    textAlign: 'center',
  },

  // Cancel-reason modal
  modalOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 100,
  },
  modalDim: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  cancelModal: {
    width: '88%',
    backgroundColor: '#F4F7F4',
    borderRadius: 28,
    padding: 24,
    borderWidth: 1.5,
    borderColor: '#8B211E',
  },
  cancelModalTitle: {
    fontSize: moderateScale(19),
    color: '#1A2E1A',
    fontFamily: 'Nunito-Bold',
    marginBottom: 4,
  },
  cancelModalSub: {
    fontSize: moderateScale(12),
    color: '#666',
    fontFamily: 'Nunito-Regular',
    marginBottom: 16,
  },
  cancelOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#fff',
    marginBottom: 8,
  },
  cancelOptionActive: {
    borderColor: '#8B211E',
    backgroundColor: '#fff5f5',
  },
  cancelOptionText: {
    fontSize: moderateScale(14),
    fontFamily: 'Nunito-Regular',
    color: '#444',
  },
  cancelOptionTextActive: {
    color: '#8B211E',
    fontFamily: 'Nunito-Bold',
  },
  cancelOtherInput: {
    borderWidth: 1,
    borderColor: '#3e5141',
    borderRadius: 14,
    padding: 12,
    fontSize: moderateScale(13),
    fontFamily: 'Nunito-Regular',
    color: '#1A2E1A',
    backgroundColor: '#fff',
    marginBottom: 8,
  },
  cancelConfirmBtn: {
    backgroundColor: '#8B211E',
    height: moderateScale(50),
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 6,
    marginBottom: 8,
  },
  cancelConfirmText: {
    fontSize: moderateScale(15),
    color: '#fff',
    fontFamily: 'Nunito-Black',
  },
  cancelModalBack: {
    alignItems: 'center',
    paddingVertical: 6,
  },
  cancelModalBackText: {
    fontSize: moderateScale(13),
    color: '#555',
    fontFamily: 'Nunito-Regular',
    textDecorationLine: 'underline',
  },
});

export default UserMap;
