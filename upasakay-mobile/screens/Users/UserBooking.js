import React, { useState, useRef, useEffect } from 'react';
import { StyleSheet, View, TextInput, TouchableOpacity, Text, Image, LayoutAnimation, Platform, UIManager, Dimensions, Alert } from 'react-native';
import * as Location from 'expo-location';
import { WebView } from 'react-native-webview';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { Pusher } from 'pusher-js/react-native';
import { currentUser } from '../../services/UserStore';

import * as Notifications from 'expo-notifications';
import { useTrip } from '../../context/TripContext';
import { ROUTE_STOPS } from '../../services/UserRouteStops';
import { apiGet, apiPost, apiPatch } from '../../services/apiClient';

const { width } = Dimensions.get('window');

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const SnappyAnim = {
  duration: 200,
  update: { type: LayoutAnimation.Types.easeInEaseOut },
  create: { type: LayoutAnimation.Types.easeInEaseOut, property: LayoutAnimation.Properties.opacity },
  delete: { type: LayoutAnimation.Types.easeInEaseOut, property: LayoutAnimation.Properties.opacity },
};

const PUSHER_KEY    = 'f21efd02988d084b7b35';
const PUSHER_CLUSTER = 'ap1';

const ROUTE_COLORS = {
  north:      '#3b82f6',
  south:      '#22c55e',
  'cebu city': '#f97316',
};

const CANCEL_REASONS = [
  'Changed my mind',
  'Driver is taking too long',
  'Wrong stop selected',
  'Emergency',
  'Other',
];

const getRouteColor = (name = '') => {
  const n = name.toLowerCase();
  for (const [key, color] of Object.entries(ROUTE_COLORS)) {
    if (n.includes(key)) return color;
  }
  return '#f97316';
};

const haversineKm = (lat1, lng1, lat2, lng2) => {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

const UserMapScreen = () => {
  const { active, routeId } = useLocalSearchParams();
  const { setActiveTrip, activeRequest, setActiveRequest } = useTrip();
  const webViewRef = useRef(null);
  const reverseGeocodeTimer = useRef(null);
  const pusherRef = useRef(null);

  const [status, setStatus] = useState(() => {
    if (activeRequest?.status) return activeRequest.status;
    return active === 'true' ? 'booking' : 'searching';
  });
  const [pickupAddress, setPickupAddress] = useState('Locating...');
  const [currentCoords, setCurrentCoords] = useState({ lat: 10.3381, lng: 123.9116 });
  const [searchText, setSearchText] = useState('');
  const [driverInfo, setDriverInfo] = useState(activeRequest?.driverInfo ?? null);
  const [pickupRequestId, setPickupRequestId] = useState(activeRequest?.id ?? null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [routeStops, setRouteStops] = useState([]);
  const [routeColor, setRouteColor] = useState('#f97316');
  const [selectedStopId, setSelectedStopId] = useState(null);
  const [dropoffSearchText, setDropoffSearchText] = useState('');
  const [dropoffAddress, setDropoffAddress] = useState('');
  const [dropoffStopId, setDropoffStopId] = useState(null);
  // Auto-selected stop coords — used to pan the map once it loads
  const [autoStop, setAutoStop] = useState(null);

  // Feedback modal
  const [feedbackVisible, setFeedbackVisible] = useState(false);
  const [feedbackRequestId, setFeedbackRequestId] = useState(null);
  const [selectedRating, setSelectedRating] = useState(0);
  const [feedbackComment, setFeedbackComment] = useState('');
  const [submittingFeedback, setSubmittingFeedback] = useState(false);

  // Cancel reason modal
  const [cancelVisible, setCancelVisible] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [cancelOtherText, setCancelOtherText] = useState('');

  // Ref so the Pusher ride.completed closure always sees the current request ID
  const pickupRequestIdRef = useRef(null);

  // Keep ref current so Pusher closures see the latest pickupRequestId
  useEffect(() => { pickupRequestIdRef.current = pickupRequestId; }, [pickupRequestId]);

  // ── Pusher real-time subscriptions ────────────────────────────────────────
  useEffect(() => {
    const passengerId = currentUser?.passenger_id ?? currentUser?.id ?? 1;

    const pusher = new Pusher(PUSHER_KEY, { cluster: PUSHER_CLUSTER });
    pusherRef.current = pusher;

    // Channel 1: Live shuttle location — pan the map as the bus moves
    const locationCh = pusher.subscribe('shuttle-locations');
    locationCh.bind('location.updated', (data) => {
      webViewRef.current?.injectJavaScript(
        `window.panTo(${data.latitude}, ${data.longitude}); true;`
      );
    });

    // Channel 2: Passenger-specific — accept / complete events
    const passengerCh = pusher.subscribe(`passenger-${passengerId}`);

    passengerCh.bind('ride.accepted', (data) => {
      const newDriverInfo = {
        name: data.driver_name,
        shuttleNumber: data.shuttle_number,
        eta: data.eta_minutes,
      };
      setDriverInfo(newDriverInfo);
      setPickupRequestId(data.pickup_request_id ?? null);
      setActiveRequest(prev => prev
        ? { ...prev, status: 'booking', driverInfo: newDriverInfo }
        : { id: data.pickup_request_id, status: 'booking', driverInfo: newDriverInfo }
      );
      setActiveTrip({
        driverName: data.driver_name,
        etaText: data.eta_minutes ? `${data.eta_minutes} min` : 'On the way',
        distanceText: 'Arriving Soon',
        avatarUri: data.avatar_uri ?? 'https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=100',
        route: data.route_name ?? 'UP Cebu Bus Route',
      });
      LayoutAnimation.configureNext(SnappyAnim);
      setStatus('booking');
      Notifications.scheduleNotificationAsync({
        content: {
          title: 'Your Para! was accepted! 🚌',
          body: `${data.driver_name} is on the way. ETA: ${data.eta_minutes ?? '?'} min.`,
          sound: true,
        },
        trigger: null,
      });
    });

    passengerCh.bind('passenger.boarded', () => {
      setActiveRequest(prev => prev ? { ...prev, status: 'onboard' } : prev);
      LayoutAnimation.configureNext(SnappyAnim);
      setStatus('onboard');
      Notifications.scheduleNotificationAsync({
        content: {
          title: "You're on board ✅",
          body: 'Enjoy your ride with UPasakay!',
          sound: true,
        },
        trigger: null,
      });
    });

    passengerCh.bind('ride.completed', () => {
      setActiveRequest(prev => prev ? { ...prev, status: 'arrived' } : prev);
      Notifications.scheduleNotificationAsync({
        content: {
          title: 'You have arrived!',
          body: 'Thank you for riding with UPasakay! Please rate your trip.',
          sound: true,
        },
        trigger: null,
      });
      setFeedbackRequestId(pickupRequestIdRef.current);
      setFeedbackVisible(true);
      LayoutAnimation.configureNext(SnappyAnim);
      setStatus('arrived');
    });

    return () => {
      locationCh.unbind_all();
      passengerCh.unbind_all();
      pusher.unsubscribe('shuttle-locations');
      pusher.unsubscribe(`passenger-${passengerId}`);
      pusher.disconnect();
    };
  }, [setActiveTrip]);
  // ──────────────────────────────────────────────────────────────────────────

  // On mount: verify any persisted request is still active so stale context
  // doesn't lock the passenger in a phantom booking state.
  useEffect(() => {
    if (!activeRequest?.id) return;
    apiGet(`pickup-requests/${activeRequest.id}`).then(({ ok, data }) => {
      if (!ok || !data) return;
      const s = data.status;
      if (s === 'completed' || s === 'cancelled') {
        setActiveRequest(null);
        setStatus('searching');
        setPickupRequestId(null);
        setDriverInfo(null);
      } else if (s === 'in_progress') {
        setStatus('onboard');
      } else {
        setStatus('booking');
      }
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Fetch stops for the selected route, then auto-select the nearest one
  useEffect(() => {
    if (!routeId) return;
    apiGet(`routes/${routeId}`).then(({ ok, data }) => {
      if (ok && data?.stops?.length) {
        const stops = data.stops;
        setRouteStops(stops);
        setRouteColor(getRouteColor(data.name));

        // Auto-select nearest active stop based on current GPS position.
        // Only runs if the passenger hasn't already picked a stop.
        (async () => {
          try {
            const { status: perm } = await Location.requestForegroundPermissionsAsync();
            if (perm !== 'granted') return;
            const pos = await Location.getCurrentPositionAsync({
              accuracy: Location.Accuracy.Balanced,
            });
            const { latitude: myLat, longitude: myLng } = pos.coords;

            const active = stops.filter(
              s => s.is_active && s.latitude != null && s.longitude != null
            );
            if (active.length === 0) return;

            let nearest = active[0];
            let nearestDist = haversineKm(
              myLat, myLng,
              parseFloat(nearest.latitude), parseFloat(nearest.longitude)
            );
            for (const s of active.slice(1)) {
              const d = haversineKm(
                myLat, myLng,
                parseFloat(s.latitude), parseFloat(s.longitude)
              );
              if (d < nearestDist) { nearestDist = d; nearest = s; }
            }

            setSelectedStopId(nearest.id);
            setPickupAddress(nearest.name);
            setCurrentCoords({ lat: parseFloat(nearest.latitude), lng: parseFloat(nearest.longitude) });
            setAutoStop({ lat: parseFloat(nearest.latitude), lng: parseFloat(nearest.longitude) });
          } catch (_) {
            // GPS unavailable — let the user search manually
          }
        })();
      }
    });
  }, [routeId]);

  // Pan the map to the auto-selected stop once both are ready
  useEffect(() => {
    if (!mapLoaded || !autoStop) return;
    webViewRef.current?.injectJavaScript(
      `window.panTo(${autoStop.lat}, ${autoStop.lng}); true;`
    );
  }, [mapLoaded, autoStop]);

  // Inject stop markers once the map WebView has loaded and stops are ready
  useEffect(() => {
    if (!mapLoaded || routeStops.length === 0) return;
    const stopsJson = JSON.stringify(routeStops);
    webViewRef.current?.injectJavaScript(
      `window.renderRouteStops(${stopsJson}, '${routeColor}'); true;`
    );
  }, [mapLoaded, routeStops, routeColor]);

  // Prepare Waypoints for OSRM URL
  const waypointsString = ROUTE_STOPS.map(s => `${s.lng},${s.lat}`).join(';');

  useEffect(() => {
    if (active === 'true' && status === 'booking') {
      const timer = setTimeout(() => {
        webViewRef.current?.injectJavaScript(`window.startBusFromUPC(${currentCoords.lat}, ${currentCoords.lng}); true;`);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [active]);

  const mapHtml = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
        <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
        <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
        <style>
          body { margin: 0; padding: 0; background-color: white; }
          #map { height: 100vh; width: 100vw; }
          .leaflet-control-attribution { display: none; }
          .bus-marker-icon {
            transition: all 0.4s linear;
            font-size: 32px;
            display: flex;
            justify-content: center;
            align-items: center;
          }
        </style>
      </head>
      <body>
        <div id="map"></div>
        <script>
          var map = L.map('map', { zoomControl: false }).setView([10.3381, 123.9116], 16);
          L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png').addTo(map);

          var busMarker = null;
          var destMarker = null;
          var estimatorLine = null;
          var fullRouteLine = null;
          window.stopDrive = false;

          var stopMarkers = [];
          window.renderRouteStops = function(stops, color) {
            stopMarkers.forEach(function(m) { map.removeLayer(m); });
            stopMarkers = [];
            var valid = stops.filter(function(s) {
              return s.is_active && s.latitude && s.longitude;
            });
            valid.forEach(function(stop) {
              var marker = L.circleMarker(
                [parseFloat(stop.latitude), parseFloat(stop.longitude)],
                { radius: 8, color: color, fillColor: color, fillOpacity: 1, weight: 2, bubblingMouseEvents: false }
              )
              .bindPopup(
                '<div style="font-family:sans-serif;min-width:110px">' +
                '<b>' + stop.name + '</b><br>' +
                '<span style="color:#666;font-size:12px">Stop #' + stop.sequence + '</span>' +
                '</div>'
              )
              .addTo(map);
              stopMarkers.push(marker);
            });
            if (stopMarkers.length > 0) {
              map.fitBounds(L.featureGroup(stopMarkers).getBounds(), { padding: [60, 60] });
            }
          };

          function clearRoute() {
            if (busMarker)      { map.removeLayer(busMarker);      busMarker = null; }
            if (destMarker)     { map.removeLayer(destMarker);     destMarker = null; }
            if (estimatorLine)  { map.removeLayer(estimatorLine);  estimatorLine = null; }
            if (fullRouteLine)  { map.removeLayer(fullRouteLine);  fullRouteLine = null; }
          }
          window.clearRoute = clearRoute;

          window.panTo = function(lat, lng) {
            map.setView([lat, lng], 16, { animate: true });
          };

          window.startBusFromUPC = async function(destLat, destLng) {
            window.stopDrive = false;
            clearRoute();
            var startLat = 10.3381;
            var startLng = 123.9116;
            try {
              const url = "https://router.project-osrm.org/route/v1/driving/" +
                          startLng + "," + startLat + ";" + "${waypointsString}" + ";" + destLng + "," + destLat +
                          "?overview=full&geometries=geojson";
              const response = await fetch(url);
              const data = await response.json();
              const routeCoords = data.routes[0].geometry.coordinates;
              const latLngs = routeCoords.map(c => [c[1], c[0]]);

              destMarker = L.marker([destLat, destLng]).addTo(map);
              fullRouteLine = L.polyline(latLngs, { color: '#3e5141', weight: 3, opacity: 0.25, dashArray: '6,8' }).addTo(map);
              estimatorLine = L.polyline(latLngs, { color: '#7B2D26', weight: 5, opacity: 0.9, lineJoin: 'round' }).addTo(map);

              var busIcon = L.divIcon({ className: 'bus-marker-icon', html: '🚌', iconSize:[40,40] });
              busMarker = L.marker(latLngs[0], { icon: busIcon }).addTo(map);
              map.fitBounds(L.latLngBounds(latLngs), { padding: [80, 80] });

              let i = 0;
              function drive() {
                if (window.stopDrive) return;
                if (i < latLngs.length) {
                  busMarker.setLatLng(latLngs[i]);
                  estimatorLine.setLatLngs(latLngs.slice(i));
                  i++;
                  setTimeout(drive, 400);
                } else {
                  window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'ARRIVED' }));
                }
              }
              drive();
            } catch (err) { console.error(err); }
          };

          map.on('move', function() {
            var center = map.getCenter();
            window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'MOVE', lat: center.lat, lng: center.lng }));
          });
        </script>
      </body>
    </html>
  `;

  const clearMap = () => {
    webViewRef.current?.injectJavaScript('window.stopDrive = true; window.clearRoute && window.clearRoute(); true;');
  };

  const reverseGeocode = async (lat, lng) => {
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=16&addressdetails=1`, { headers: { 'Accept-Language': 'en' } });
      const data = await res.json();
      const a = data.address || {};
      return a.suburb || a.neighbourhood || a.village || a.town || a.city_district || a.city || a.county || data.display_name || 'Unknown area';
    } catch (e) { return 'Unknown area'; }
  };

  const forwardGeocode = async (query) => {
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query + ', Cebu, Philippines')}&limit=1&addressdetails=1`, { headers: { 'Accept-Language': 'en' } });
      const data = await res.json();
      if (!data || data.length === 0) return null;
      const hit = data[0];
      const a = hit.address || {};
      const label = a.suburb || a.neighbourhood || a.village || a.town || a.city_district || a.city || hit.display_name;
      return { lat: parseFloat(hit.lat), lng: parseFloat(hit.lon), label };
    } catch (e) { return null; }
  };

  const handleSearchSubmit = async () => {
    const q = searchText.trim();
    if (!q) return;
    setPickupAddress('Searching...');

    const dummyHit = ROUTE_STOPS.find(stop => stop.name.toLowerCase().includes(q.toLowerCase()));

    if (dummyHit) {
      setCurrentCoords({ lat: dummyHit.lat, lng: dummyHit.lng });
      setPickupAddress(dummyHit.name);
      webViewRef.current?.injectJavaScript(`window.panTo(${dummyHit.lat}, ${dummyHit.lng}); true;`);
      // Match against API-loaded stops to get the real backend stop ID
      const apiStop = routeStops.find(s =>
        s.name.toLowerCase().includes(dummyHit.name.toLowerCase()) ||
        dummyHit.name.toLowerCase().includes(s.name.toLowerCase())
      );
      setSelectedStopId(apiStop?.id ?? null);
      setDropoffStopId(null);
      setDropoffAddress('');
      setDropoffSearchText('');
    } else {
      const hit = await forwardGeocode(q);
      if (!hit) { setPickupAddress('No results for "' + q + '"'); return; }
      setCurrentCoords({ lat: hit.lat, lng: hit.lng });
      setPickupAddress(hit.label);
      webViewRef.current?.injectJavaScript(`window.panTo(${hit.lat}, ${hit.lng}); true;`);
      setSelectedStopId(null);
      setDropoffStopId(null);
      setDropoffAddress('');
      setDropoffSearchText('');
    }
  };

  const handleDropoffSearchSubmit = () => {
    const q = dropoffSearchText.trim();
    if (!q) return;
    const match = routeStops.find(s =>
      s.is_active && s.name.toLowerCase().includes(q.toLowerCase())
    );
    if (match) {
      setDropoffAddress(match.name);
      setDropoffStopId(match.id);
    } else {
      setDropoffAddress('No stops matching "' + q + '"');
      setDropoffStopId(null);
    }
  };

  const handleMessage = async (event) => {
    const data = JSON.parse(event.nativeEvent.data);
    if (data.type === 'MOVE') {
      setCurrentCoords({ lat: data.lat, lng: data.lng });
      if (status === 'searching') {
        if (reverseGeocodeTimer.current) clearTimeout(reverseGeocodeTimer.current);
        reverseGeocodeTimer.current = setTimeout(async () => {
          const name = await reverseGeocode(data.lat, data.lng);
          setPickupAddress(name);
        }, 500);
      }
    }
    if (data.type === 'ARRIVED') {
      await Notifications.scheduleNotificationAsync({
        content: { title: "Bus Arrived! 🚌", body: "Sir Sanford is at your location.", sound: true },
        trigger: null,
      });
      LayoutAnimation.configureNext(SnappyAnim);
      setStatus('arrived');
    }
  };

  const upcStop = routeStops.find(s => {
    const n = s.name.toLowerCase();
    return (n.includes('up') && n.includes('cebu')) || n.includes('upc');
  });
  const isPickupUPC = Boolean(selectedStopId && upcStop && selectedStopId === upcStop.id);
  const effectiveDropoffStopId = isPickupUPC ? dropoffStopId : (upcStop?.id ?? null);

  const handleParaPress = async () => {
    if (!selectedStopId) {
      Alert.alert('Select a stop', 'Search for a bus stop before requesting a pickup.');
      return;
    }
    if (!effectiveDropoffStopId) {
      Alert.alert(
        isPickupUPC ? 'Select a drop-off stop' : 'Route error',
        isPickupUPC ? 'Search for the stop you want to be dropped off at.' : 'No UP Cebu stop found for this route.'
      );
      return;
    }

    LayoutAnimation.configureNext(SnappyAnim);
    setStatus('booking');

    const { ok, data } = await apiPost('pickup-requests', {
      route_id: routeId,
      pickup_stop_id: selectedStopId,
      dropoff_stop_id: effectiveDropoffStopId,
    });

    if (!ok) {
      LayoutAnimation.configureNext(SnappyAnim);
      setStatus('searching');
      Alert.alert('Request failed', JSON.stringify(data));
      return;
    }

    setPickupRequestId(data.id);
    setActiveRequest({ id: data.id, status: 'booking', driverInfo: null });
    webViewRef.current?.injectJavaScript(`window.startBusFromUPC(${currentCoords.lat}, ${currentCoords.lng});`);
  };

  // Show the cancel reason modal instead of cancelling immediately
  const handleCancelPress = () => {
    setCancelReason('');
    setCancelOtherText('');
    setCancelVisible(true);
  };

  const handleCancelConfirm = async () => {
    const reason = cancelReason === 'Other'
      ? (cancelOtherText.trim() || 'Other')
      : cancelReason;

    setCancelVisible(false);

    if (pickupRequestId && reason) {
      await apiPatch(`pickup-requests/${pickupRequestId}`, {
        status: 'cancelled',
        cancel_reason: reason,
      });
    }

    clearMap();
    LayoutAnimation.configureNext(SnappyAnim);
    setStatus('searching');
    setDriverInfo(null);
    setPickupRequestId(null);
    setActiveRequest(null);
    setActiveTrip(null);
  };

  const handleArrived = () => {
    clearMap();
    LayoutAnimation.configureNext(SnappyAnim);
    setStatus('searching');
    setActiveTrip(null);
  };

  const closeFeedback = () => {
    setFeedbackVisible(false);
    setFeedbackRequestId(null);
    setSelectedRating(0);
    setFeedbackComment('');
    clearMap();
    LayoutAnimation.configureNext(SnappyAnim);
    setStatus('searching');
    setDriverInfo(null);
    setPickupRequestId(null);
    setActiveRequest(null);
    setActiveTrip(null);
  };

  const submitFeedback = async () => {
    if (selectedRating === 0) {
      Alert.alert('Rating required', 'Please select at least 1 star.');
      return;
    }
    setSubmittingFeedback(true);
    const { ok } = await apiPost(`pickup-requests/${feedbackRequestId}/feedback`, {
      rating: selectedRating,
      comment: feedbackComment.trim() || null,
    });
    setSubmittingFeedback(false);
    if (!ok) {
      Alert.alert('Error', 'Could not submit feedback. Please try again.');
      return;
    }
    closeFeedback();
    setDriverInfo(null);
    setPickupRequestId(null);
    setActiveRequest(null);
    setActiveTrip(null);
  };

  return (
    <View style={styles.container}>
      <View style={styles.mapWrapper}>
        <WebView
          ref={webViewRef}
          source={{ html: mapHtml }}
          onMessage={handleMessage}
          onLoad={() => setMapLoaded(true)}
          style={styles.map}
          containerStyle={{ backgroundColor: '#fff' }}
        />
      </View>

      {(status === 'searching' || status === 'booking') && (
        <View style={styles.topContainer}>
          {status === 'searching' ? (
            <View style={styles.searchPill}>
              <TouchableOpacity onPress={() => router.back()}>
                <Ionicons name="arrow-back" size={24} color="#1A2E1A" />
              </TouchableOpacity>
              <TextInput
                style={[styles.searchInput, {fontFamily: 'Nunito-Regular'}]}
                placeholder="Change pick-up stop..."
                value={searchText}
                onChangeText={setSearchText}
                onSubmitEditing={handleSearchSubmit}
                returnKeyType="search"
              />
              <TouchableOpacity onPress={handleSearchSubmit}>
                <Ionicons name="search" size={22} color="#1A2E1A" />
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              style={styles.backCircle}
              onPress={() => {
                clearMap();
                router.replace('/Users/UserHome');
              }}
            >
              <Ionicons name="arrow-back" size={28} color="#1A2E1A" />
            </TouchableOpacity>
          )}
        </View>
      )}

      {status === 'searching' && (
        <View style={styles.centerPinContainer} pointerEvents="none">
          <Ionicons name="location" size={50} color="#7B2D26" />
        </View>
      )}

      <View style={styles.bookingCard}>
        {status === 'searching' ? (
          <>
            <Text style={styles.cardHeader}>Pick-up Stop</Text>
            <View style={styles.inputBox}>
              <View style={styles.greenDot}><Ionicons name="location" size={14} color="white" /></View>
              <Text style={styles.addressText} numberOfLines={1}>
                {pickupAddress === 'Locating...' && !selectedStopId ? 'Detecting nearest stop…' : pickupAddress}
              </Text>
              {selectedStopId && (
                <Ionicons name="checkmark-circle" size={18} color="#004d00" style={{ marginLeft: 6 }} />
              )}
            </View>

            {/* Show auto-selected drop-off when pickup is NOT UP Cebu */}
            {!isPickupUPC && selectedStopId && upcStop && (
              <>
                <Text style={[styles.cardHeader, { marginTop: 10, fontSize: 16 }]}>Drop-off</Text>
                <View style={[styles.inputBox, { marginBottom: 0 }]}>
                  <View style={[styles.greenDot, { backgroundColor: '#8B0000' }]}>
                    <Ionicons name="location" size={14} color="white" />
                  </View>
                  <Text style={styles.addressText} numberOfLines={1}>{upcStop.name}</Text>
                  <Text style={styles.autoLabel}>auto</Text>
                </View>
              </>
            )}

            {/* Dropoff search when pickup IS UP Cebu */}
            {isPickupUPC && (
              <>
                <Text style={[styles.cardHeader, { marginTop: 10, fontSize: 16 }]}>Drop-off Stop</Text>
                <View style={styles.dropoffSearchRow}>
                  <TextInput
                    style={[styles.dropoffInput, { fontFamily: 'Nunito-Regular' }]}
                    placeholder="Search drop-off stop..."
                    value={dropoffSearchText}
                    onChangeText={setDropoffSearchText}
                    onSubmitEditing={handleDropoffSearchSubmit}
                    returnKeyType="search"
                  />
                  <TouchableOpacity onPress={handleDropoffSearchSubmit}>
                    <Ionicons name="search" size={20} color="#1A2E1A" />
                  </TouchableOpacity>
                </View>
                {dropoffAddress ? (
                  <View style={[styles.inputBox, { marginTop: 8 }]}>
                    <View style={[styles.greenDot, { backgroundColor: '#8B0000' }]}>
                      <Ionicons name="location" size={14} color="white" />
                    </View>
                    <Text style={styles.addressText} numberOfLines={1}>{dropoffAddress}</Text>
                  </View>
                ) : null}
              </>
            )}

            {/* No UP Cebu stop warning */}
            {selectedStopId && !upcStop && (
              <Text style={styles.noUpcWarning}>
                This route has no UP Cebu stop configured. Booking unavailable.
              </Text>
            )}

            <TouchableOpacity
              style={[styles.paraBtn, { marginTop: 15 }, !effectiveDropoffStopId && { opacity: 0.5 }]}
              onPress={handleParaPress}
              disabled={!selectedStopId || !effectiveDropoffStopId}
            >
              <Text style={styles.paraText}>Para!</Text>
            </TouchableOpacity>
          </>
        ) : status === 'onboard' ? (
          <View style={styles.waitingContent}>
            <View style={styles.onboardBox}>
              <Ionicons name="checkmark-circle" size={48} color="#1A7F37" />
              <Text style={styles.onboardTitle}>You're on board</Text>
              <Text style={styles.onboardSub}>Enjoy your ride with UPasakay!</Text>
            </View>
          </View>
        ) : (
          <View style={styles.waitingContent}>
            <View style={styles.row}>
               <View>
                 <Text style={styles.arriveTitle}>
                   {driverInfo ? `ETA: ${driverInfo.eta ?? '?'} min` : 'Waiting for driver...'}
                 </Text>
                 <Text style={styles.arriveSub}>
                   {driverInfo ? `Shuttle ${driverInfo.shuttleNumber ?? ''}` : 'Connecting to shuttle...'}
                 </Text>
               </View>
               <View style={styles.timeline}>
                 <Ionicons name="bus" size={20} color="#1A2E1A"/><Text style={{color: '#ccc'}}>---</Text><Ionicons name="person" size={20} color="#1A2E1A"/>
               </View>
            </View>
            <View style={styles.driverSection}>
              <Image source={{ uri: 'https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=100' }} style={styles.avatar} />
              <View>
                <Text style={styles.dName}>{driverInfo?.name ?? 'Awaiting acceptance...'}</Text>
                <Text style={styles.dRoute}>UP Cebu Bus Route</Text>
              </View>
            </View>
            {pickupRequestId ? (
              <TouchableOpacity
                style={styles.boardBtn}
                onPress={() =>
                  router.push({ pathname: '/UserScan', params: { requestId: pickupRequestId } })
                }
              >
                <Ionicons name="qr-code-outline" size={20} color="#1A2E1A" />
                <Text style={styles.boardBtnText}>I'm on the bus — scan to board</Text>
              </TouchableOpacity>
            ) : null}
            <TouchableOpacity style={styles.cancelBtn} onPress={handleCancelPress}>
              <Text style={styles.cancelText}>Cancel Para</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {status === 'arrived' && (
        <View style={styles.overlay}>
          <View style={styles.dimmer} />
          <View style={styles.arrivalModal}>
            <View style={styles.modalTop}>
              <Image source={{ uri: 'https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=100' }} style={styles.modalAvatar} />
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={styles.modalTitle}>{"You've arrived! 🎉"}</Text>
                <Text style={styles.modalSub}>
                  {driverInfo?.name ? `Thanks for riding with ${driverInfo.name}!` : 'Thanks for riding with UPasakay!'}
                </Text>
              </View>
            </View>
            <TouchableOpacity style={styles.boardedBtn} onPress={handleArrived}>
              <Text style={styles.boardedText}>Done</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* ── Feedback / rating modal ── */}
      {feedbackVisible && (
        <View style={styles.overlay}>
          <View style={styles.dimmer} />
          <View style={styles.feedbackModal}>
            <Text style={styles.feedbackTitle}>Rate your ride</Text>
            <Text style={styles.feedbackSub}>How was your experience?</Text>
            <View style={styles.starsRow}>
              {[1, 2, 3, 4, 5].map(star => (
                <TouchableOpacity key={star} onPress={() => setSelectedRating(star)}>
                  <Ionicons
                    name={star <= selectedRating ? 'star' : 'star-outline'}
                    size={38}
                    color={star <= selectedRating ? '#FFB82E' : '#ccc'}
                    style={{ marginHorizontal: 4 }}
                  />
                </TouchableOpacity>
              ))}
            </View>
            <TextInput
              style={styles.feedbackInput}
              placeholder="Optional comment..."
              placeholderTextColor="#999"
              value={feedbackComment}
              onChangeText={setFeedbackComment}
              multiline
              maxLength={500}
            />
            <TouchableOpacity
              style={[styles.feedbackSubmit, submittingFeedback && { opacity: 0.6 }]}
              onPress={submitFeedback}
              disabled={submittingFeedback}
            >
              <Text style={styles.feedbackSubmitText}>{submittingFeedback ? 'Submitting…' : 'Submit'}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.feedbackSkip} onPress={closeFeedback}>
              <Text style={styles.feedbackSkipText}>Skip</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* ── Cancel reason modal ── */}
      {cancelVisible && (
        <View style={styles.overlay}>
          <View style={styles.dimmer} />
          <View style={styles.cancelModal}>
            <Text style={styles.cancelModalTitle}>Why are you cancelling?</Text>
            <Text style={styles.cancelModalSub}>This helps us improve the service.</Text>
            {CANCEL_REASONS.map(reason => (
              <TouchableOpacity
                key={reason}
                style={[styles.cancelOption, cancelReason === reason && styles.cancelOptionActive]}
                onPress={() => setCancelReason(reason)}
              >
                <Ionicons
                  name={cancelReason === reason ? 'radio-button-on' : 'radio-button-off'}
                  size={20}
                  color={cancelReason === reason ? '#8B211E' : '#999'}
                  style={{ marginRight: 10 }}
                />
                <Text style={[styles.cancelOptionText, cancelReason === reason && styles.cancelOptionTextActive]}>
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
            >
              <Text style={styles.cancelConfirmText}>Confirm Cancellation</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.cancelModalBack} onPress={() => setCancelVisible(false)}>
              <Text style={styles.cancelModalBackText}>Keep my booking</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  mapWrapper: { flex: 1, backgroundColor: '#fff' },
  map: { flex: 1, opacity: 0.99 },
  topContainer: { position: 'absolute', top: 60, width: '100%', paddingHorizontal: 20, zIndex: 10 },
  searchPill: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', height: 55, borderRadius: 30, paddingHorizontal: 15, elevation: 5 },
  searchInput: { flex: 1, marginLeft: 10, fontSize: 16 },
  backCircle: { width: 50, height: 50, borderRadius: 25, backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center', elevation: 5 },
  centerPinContainer: { ...StyleSheet.absoluteFillObject, justifyContent: 'center', alignItems: 'center', zIndex: 5 },
  bookingCard: {
    position: 'absolute', bottom: -1, left: 0, right: 0,
    padding: 30, paddingBottom: Platform.OS === 'ios' ? 45 : 35,
    backgroundColor: '#F4F7F4', borderTopLeftRadius: 40, borderTopRightRadius: 40,
    borderWidth: 1.5, borderBottomWidth: 0, borderColor: '#3e5141', elevation: 20, zIndex: 20,
  },
  cardHeader: { fontSize: 22, color: '#1A2E1A', marginBottom: 15, fontFamily: 'Nunito-Bold' },
  inputBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', padding: 15, borderRadius: 30, borderWidth: 1, borderColor: '#1A2E1A', marginBottom: 15 },
  greenDot: { width: 24, height: 24, borderRadius: 12, backgroundColor: '#004d00', justifyContent: 'center', alignItems: 'center', marginRight: 10 },
  addressText: { flex: 1, fontFamily: 'Nunito-Regular', color: '#1A2E1A' },
  autoLabel: { fontSize: 11, fontFamily: 'Nunito-Bold', color: '#888', backgroundColor: '#eee', borderRadius: 8, paddingHorizontal: 6, paddingVertical: 2, marginLeft: 6 },
  noUpcWarning: { fontSize: 13, color: '#8B211E', fontFamily: 'Nunito-Regular', marginTop: 4, marginBottom: 8, textAlign: 'center' },
  paraBtn: { backgroundColor: '#FFB82E', height: 55, borderRadius: 30, justifyContent: 'center', alignItems: 'center', elevation: 3 },
  paraText: { fontSize: 20, color: '#1A2E1A', fontFamily: 'Nunito-Black' },
  arriveTitle: { fontSize: 22, color: '#1A2E1A', fontFamily: 'Nunito-Bold' },
  arriveSub: { fontSize: 14, color: '#666', fontFamily: 'Nunito-Regular' },
  dName: { fontSize: 18, color: '#1A2E1A', fontFamily: 'Nunito-Bold' },
  dRoute: { fontSize: 14, color: '#444', fontFamily: 'Nunito-Regular' },
  cancelBtn: { backgroundColor: '#8B211E', height: 55, borderRadius: 30, justifyContent: 'center', alignItems: 'center' },
  cancelText: { color: '#fff', fontSize: 18, fontFamily: 'Nunito-Black' },
  overlay: { ...StyleSheet.absoluteFillObject, justifyContent: 'center', alignItems: 'center', zIndex: 100 },
  dimmer: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.4)' },
  arrivalModal: { width: width * 0.85, backgroundColor: '#F4F7F4', borderRadius: 35, padding: 25, borderWidth: 1.5, borderColor: '#3e5141' },
  modalTitle: { fontSize: 18, color: '#1A2E1A', fontFamily: 'Nunito-Bold' },
  modalSub: { fontSize: 13, color: '#555', fontFamily: 'Nunito-Regular' },
  boardedBtn: { backgroundColor: '#FFB82E', height: 55, borderRadius: 30, justifyContent: 'center', alignItems: 'center' },
  boardedText: { fontSize: 18, color: '#1A2E1A', fontFamily: 'Nunito-Black' },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  timeline: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  driverSection: { flexDirection: 'row', alignItems: 'center', marginVertical: 20 },
  avatar: { width: 60, height: 60, borderRadius: 30, marginRight: 15 },
  modalTop: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  modalAvatar: { width: 60, height: 60, borderRadius: 30, marginRight: 15 },
  boardBtn: { flexDirection: 'row', gap: 8, backgroundColor: '#FFB82E', height: 55, borderRadius: 30, justifyContent: 'center', alignItems: 'center', marginBottom: 14, elevation: 3 },
  boardBtnText: { fontSize: 17, color: '#1A2E1A', fontFamily: 'Nunito-Black' },
  dropoffSearchRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', paddingHorizontal: 15, paddingVertical: 10, borderRadius: 30, borderWidth: 1, borderColor: '#1A2E1A', marginBottom: 4 },
  dropoffInput: { flex: 1, marginRight: 8, fontSize: 15 },
  onboardBox: { alignItems: 'center', paddingVertical: 30 },
  onboardTitle: { fontSize: 22, color: '#1A2E1A', fontFamily: 'Nunito-Bold', marginTop: 10 },
  onboardSub: { fontSize: 14, color: '#666', fontFamily: 'Nunito-Regular', marginTop: 4 },
  waitingContent: {},
  feedbackModal: {
    width: width * 0.88, backgroundColor: '#F4F7F4', borderRadius: 35,
    padding: 28, borderWidth: 1.5, borderColor: '#3e5141', alignItems: 'center',
  },
  feedbackTitle: { fontSize: 22, color: '#1A2E1A', fontFamily: 'Nunito-Bold', marginBottom: 6 },
  feedbackSub: { fontSize: 14, color: '#555', fontFamily: 'Nunito-Regular', marginBottom: 20 },
  starsRow: { flexDirection: 'row', marginBottom: 20 },
  feedbackInput: {
    width: '100%', borderWidth: 1, borderColor: '#3e5141', borderRadius: 16,
    padding: 14, fontSize: 14, fontFamily: 'Nunito-Regular', color: '#1A2E1A',
    backgroundColor: '#fff', minHeight: 80, textAlignVertical: 'top', marginBottom: 16,
  },
  feedbackSubmit: {
    width: '100%', backgroundColor: '#FFB82E', height: 52, borderRadius: 30,
    justifyContent: 'center', alignItems: 'center', marginBottom: 10,
  },
  feedbackSubmitText: { fontSize: 17, color: '#1A2E1A', fontFamily: 'Nunito-Black' },
  feedbackSkip: { paddingVertical: 8 },
  feedbackSkipText: { fontSize: 14, color: '#888', fontFamily: 'Nunito-Regular', textDecorationLine: 'underline' },

  // Cancel reason modal
  cancelModal: {
    width: width * 0.88, backgroundColor: '#F4F7F4', borderRadius: 35,
    padding: 28, borderWidth: 1.5, borderColor: '#8B211E',
  },
  cancelModalTitle: { fontSize: 20, color: '#1A2E1A', fontFamily: 'Nunito-Bold', marginBottom: 4 },
  cancelModalSub: { fontSize: 13, color: '#666', fontFamily: 'Nunito-Regular', marginBottom: 18 },
  cancelOption: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: 12, paddingHorizontal: 16,
    borderRadius: 16, borderWidth: 1, borderColor: '#ddd',
    backgroundColor: '#fff', marginBottom: 10,
  },
  cancelOptionActive: { borderColor: '#8B211E', backgroundColor: '#fff5f5' },
  cancelOptionText: { fontSize: 15, fontFamily: 'Nunito-Regular', color: '#444' },
  cancelOptionTextActive: { color: '#8B211E', fontFamily: 'Nunito-Bold' },
  cancelOtherInput: {
    borderWidth: 1, borderColor: '#3e5141', borderRadius: 16,
    padding: 12, fontSize: 14, fontFamily: 'Nunito-Regular', color: '#1A2E1A',
    backgroundColor: '#fff', marginBottom: 10,
  },
  cancelConfirmBtn: {
    backgroundColor: '#8B211E', height: 52, borderRadius: 30,
    justifyContent: 'center', alignItems: 'center', marginTop: 6, marginBottom: 10,
  },
  cancelConfirmText: { fontSize: 16, color: '#fff', fontFamily: 'Nunito-Black' },
  cancelModalBack: { alignItems: 'center', paddingVertical: 8 },
  cancelModalBackText: { fontSize: 14, color: '#555', fontFamily: 'Nunito-Regular', textDecorationLine: 'underline' },
});

export default UserMapScreen;
