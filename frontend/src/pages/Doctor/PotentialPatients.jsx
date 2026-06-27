import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';
import { useGlobalLoading } from '../../context/GlobalLoadingContext';
import { SocketContext } from '../../context/SocketContext';
import { Map, MapMarker, MapControls, MarkerContent, MapGeoJSON } from '../../components/ui/map';
import SmartMapPopup from '../../components/SmartMapPopup';
import { calculateDistance, formatDistance, createGeoJSONCircle } from '../../utils/GeoUtils';
import { toast } from 'react-toastify';
import { User as UserIcon, MapPin, Eye } from 'lucide-react';
import { AnimatePresence } from 'framer-motion';

const PotentialPatients = () => {
  const { user, loading } = useContext(AuthContext);
  const socket = useContext(SocketContext);
  const { startLoading, stopLoading } = useGlobalLoading();

  const [requests, setRequests] = useState([]);
  const [radius, setRadius] = useState(20);
  const [mode, setMode] = useState('nearby'); // 'nearby' or 'worldwide'
  const [selectedRequest, setSelectedRequest] = useState(null);

  const userLocation = user?.location;

  const [viewport, setViewport] = useState({
    center: [
      userLocation?.coordinates?.[0] || 77.2090,
      userLocation?.coordinates?.[1] || 28.6139
    ],
    zoom: mode === 'worldwide' ? 2 : 11
  });

  useEffect(() => {
    if (mode === 'nearby' && (!userLocation || userLocation.coordinates[0] === 0)) {
      toast.warning('Please update your clinic location in Profile Settings first to find nearby patients.');
      return;
    }
    fetchNearbyPatients();
  }, [radius, mode, userLocation]);

  useEffect(() => {
    if (!socket) return;

    const handleLocationUpdate = (data) => {
      if (data.role === 'Patient') {
        fetchNearbyPatients(); // Refetch if a patient moved
      }
    };

    socket.on('location_updated', handleLocationUpdate);
    return () => socket.off('location_updated', handleLocationUpdate);
  }, [socket, radius, mode, userLocation]);

  const fetchNearbyPatients = async () => {
    try {
      startLoading('Finding active requests...');
      const userInfo = JSON.parse(localStorage.getItem('userInfo'));
      const token = userInfo?.token;
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5006';

      const lat = userLocation?.coordinates?.[1] || 0;
      const lng = userLocation?.coordinates?.[0] || 0;

      const res = await axios.get(`${API_URL}/api/consultations/nearby?lat=${lat}&lng=${lng}&radius=${radius}&mode=${mode}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      console.log("API RESP:", res.data); setRequests(res.data);
    } catch (error) {
      toast.error('Failed to fetch patient requests');
    } finally {
      stopLoading();
    }
  };

  const handleModeToggle = (newMode) => {
    setMode(newMode);
    if (newMode === 'worldwide') {
      setViewport(prev => ({ ...prev, zoom: 2 }));
    } else {
      setViewport(prev => ({ ...prev, zoom: 11, center: [userLocation.coordinates[0], userLocation.coordinates[1]] }));
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] bg-background">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-muted-foreground font-medium">Loading map...</p>
      </div>
    );
  }

  if (!userLocation || userLocation.coordinates[0] === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] bg-background text-center p-6">
        <MapPin size={48} className="text-primary mb-4" />
        <h2 className="text-2xl font-bold text-foreground mb-2">Location Not Set</h2>
        <p className="text-muted-foreground max-w-md">
          You need to set your clinic location in your profile settings before you can find patients on the map.
        </p>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-80px)] w-full flex flex-col animate-fade-in bg-background">
      {/* Header */}
      <div className="p-4 bg-card border-b border-border flex items-center justify-between z-10 flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Potential Patients</h1>
          <p className="text-sm text-muted-foreground">Showing active consultation requests</p>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex bg-popover rounded-lg p-1 border border-border">
            <button
              onClick={() => handleModeToggle('nearby')}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${mode === 'nearby' ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
            >
              Nearby
            </button>
            <button
              onClick={() => handleModeToggle('worldwide')}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${mode === 'worldwide' ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
            >
              Worldwide
            </button>
          </div>

          {mode === 'nearby' && (
            <select
              value={radius}
              onChange={e => setRadius(Number(e.target.value))}
              className="bg-popover border border-border text-foreground rounded-lg px-3 py-1.5 focus:outline-none focus:border-primary"
            >
              <option value={10}>10 km</option>
              <option value={20}>20 km</option>
              <option value={50}>50 km</option>
              <option value={100}>100 km</option>
              <option value={500}>500 km</option>
            </select>
          )}
        </div>
      </div>

      {/* Map Area */}
      <div className="flex-1 relative">
        <Map
          viewport={viewport}
          onViewportChange={setViewport}
          mapStyle="dark"
        >
          {/* Visual Search Radius for Nearby mode */}
          {mode === 'nearby' && userLocation.coordinates[0] !== 0 && (
            <MapGeoJSON
              id="search-radius"
              data={createGeoJSONCircle(userLocation.coordinates, radius)}
              fillPaint={{ "fill-color": "#3b82f6", "fill-opacity": 0.15 }}
              linePaint={{ "line-color": "#3b82f6", "line-width": 2, "line-opacity": 0.5 }}
            />
          )}

          {/* Current Doctor Marker */}
          <MapMarker
            longitude={userLocation.coordinates[0]}
            latitude={userLocation.coordinates[1]}
            anchor="bottom"
          >
            <MarkerContent>
              <div className="relative flex flex-col items-center justify-center -translate-y-1/2 group cursor-pointer">
                <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center shadow-lg shadow-primary/40 border-2 border-white animate-pulse">
                  <MapPin size={20} className="text-primary-foreground" />
                </div>
                <div className="absolute -bottom-1 w-3 h-1 bg-black/30 rounded-[100%] blur-[1px]"></div>

                <div className="absolute bottom-12 bg-popover text-foreground px-3 py-1.5 rounded-lg border border-border shadow-xl whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                  Your Clinic
                </div>
              </div>
            </MarkerContent>
          </MapMarker>

          {/* Patient Requests Markers */}
          {requests.map(req => {
            // Check if request itself has location, fallback to patient location
            let reqLocation = req.location?.coordinates;
            if (!reqLocation || reqLocation[0] === 0) {
              reqLocation = req.patient?.location?.coordinates;
            }
            if (!reqLocation || reqLocation[0] === 0) return null;

            return (
              <MapMarker
                key={req._id}
                longitude={reqLocation[0]}
                latitude={reqLocation[1]}
                anchor="bottom"
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedRequest(req);
                }}
              >
                <MarkerContent>
                  <div className={`relative flex flex-col items-center justify-center -translate-y-1/2 transition-transform cursor-pointer ${selectedRequest?._id === req._id ? 'scale-125 z-20' : 'hover:scale-110 z-10'}`}>
                    <div className={`w-8 h-8 bg-destructive rounded-full flex items-center justify-center shadow-lg border-2 border-white transition-all ${selectedRequest?._id === req._id ? 'shadow-red-600/80 ring-4 ring-red-600/30' : 'shadow-red-600/50'}`}>
                      <UserIcon size={16} className="text-destructive-foreground" />
                    </div>
                    <div className="absolute -bottom-1 w-3 h-1 bg-black/30 rounded-[100%] blur-[1px]"></div>
                  </div>
                </MarkerContent>
              </MapMarker>
            );
          })}

          {/* Patient Popup */}
          <AnimatePresence>
          {selectedRequest && (
            <SmartMapPopup
              longitude={(selectedRequest.location?.coordinates || selectedRequest.patient?.location?.coordinates)[0]}
              latitude={(selectedRequest.location?.coordinates || selectedRequest.patient?.location?.coordinates)[1]}
              onClose={() => setSelectedRequest(null)}
              offset={32}
            >
              <div className="p-3 bg-card text-foreground rounded-xl w-[260px] md:w-[280px] shadow-2xl border border-border">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-full bg-background flex items-center justify-center shrink-0 border border-border">
                    <UserIcon size={20} className="text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0 overflow-hidden">
                    <h3 className="font-bold text-foreground text-sm truncate">{selectedRequest.patient?.name}</h3>
                    <p className="text-[11px] text-muted-foreground capitalize truncate">{selectedRequest.status}</p>
                  </div>
                </div>

                <div className="space-y-1 text-xs text-muted-foreground mb-3">
                  <div className="truncate"><span className="font-medium text-foreground">Issue:</span> {selectedRequest.problemDescription}</div>
                  <div className="flex justify-between">
                    <span className="font-medium text-foreground">Budget:</span> 
                    <span>₹{selectedRequest.budgetRange?.min} - ₹{selectedRequest.budgetRange?.max}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium text-foreground">Distance:</span> 
                    <span>{
                      formatDistance(calculateDistance(
                        userLocation.coordinates,
                        selectedRequest.location?.coordinates || selectedRequest.patient?.location?.coordinates
                      ))
                    }</span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-1 mt-2 mb-2">
                  {selectedRequest.consultationModes?.map(m => (
                    <span key={m} className="text-[10px] px-2 py-0.5 rounded-full bg-background border border-border text-orange-400">
                      {m}
                    </span>
                  ))}
                </div>
              </div>
            </SmartMapPopup>
          )}
          </AnimatePresence>

          <div className="absolute bottom-6 right-6">
            <MapControls showCompass={true} />
          </div>
        </Map>
      </div>
    </div>
  );
};

export default PotentialPatients;
