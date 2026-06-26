import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';
import { useGlobalLoading } from '../../context/GlobalLoadingContext';
import { SocketContext } from '../../context/SocketContext';
import { Map, MapMarker, MapPopup, MapControls } from '../../components/ui/map';
import { calculateDistance, formatDistance } from '../../utils/GeoUtils';
import { toast } from 'react-toastify';
import { User as UserIcon, MapPin, Eye } from 'lucide-react';

const PotentialPatients = () => {
  const { user } = useContext(AuthContext);
  const { socket } = useContext(SocketContext);
  const { startLoading, stopLoading } = useGlobalLoading();

  const [requests, setRequests] = useState([]);
  const [radius, setRadius] = useState(20);
  const [mode, setMode] = useState('nearby'); // 'nearby' or 'worldwide'
  const [selectedRequest, setSelectedRequest] = useState(null);
  
  const userLocation = user?.location;

  const [viewState, setViewState] = useState({
    longitude: userLocation?.coordinates?.[0] || 77.2090,
    latitude: userLocation?.coordinates?.[1] || 28.6139,
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
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5007';
      
      const lat = userLocation?.coordinates?.[1] || 0;
      const lng = userLocation?.coordinates?.[0] || 0;
      
      const res = await axios.get(`${API_URL}/api/consultations/nearby?lat=${lat}&lng=${lng}&radius=${radius}&mode=${mode}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setRequests(res.data);
    } catch (error) {
      toast.error('Failed to fetch patient requests');
    } finally {
      stopLoading();
    }
  };

  const handleModeToggle = (newMode) => {
    setMode(newMode);
    if (newMode === 'worldwide') {
      setViewState(prev => ({ ...prev, zoom: 2 }));
    } else {
      setViewState(prev => ({ ...prev, zoom: 11, longitude: userLocation.coordinates[0], latitude: userLocation.coordinates[1] }));
    }
  };

  if (!userLocation || userLocation.coordinates[0] === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] bg-[var(--color-theme-from)] text-center p-6">
        <MapPin size={48} className="text-[var(--color-theme-primary)] mb-4" />
        <h2 className="text-2xl font-bold text-[var(--color-theme-text)] mb-2">Location Not Set</h2>
        <p className="text-[var(--color-theme-muted)] max-w-md">
          You need to set your clinic location in your profile settings before you can find patients on the map.
        </p>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-80px)] w-full flex flex-col animate-fade-in bg-[var(--color-theme-from)]">
      {/* Header */}
      <div className="p-4 bg-[var(--color-theme-panel)] border-b border-[var(--color-theme-border)] flex items-center justify-between z-10 flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-theme-text)]">Potential Patients</h1>
          <p className="text-sm text-[var(--color-theme-muted)]">Showing active consultation requests</p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex bg-[var(--color-theme-dropdown)] rounded-lg p-1 border border-[var(--color-theme-border)]">
            <button 
              onClick={() => handleModeToggle('nearby')}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${mode === 'nearby' ? 'bg-[var(--color-theme-primary)] text-white shadow-sm' : 'text-[var(--color-theme-muted)] hover:text-[var(--color-theme-text)]'}`}
            >
              Nearby
            </button>
            <button 
              onClick={() => handleModeToggle('worldwide')}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${mode === 'worldwide' ? 'bg-[var(--color-theme-primary)] text-white shadow-sm' : 'text-[var(--color-theme-muted)] hover:text-[var(--color-theme-text)]'}`}
            >
              Worldwide
            </button>
          </div>
          
          {mode === 'nearby' && (
            <select 
              value={radius} 
              onChange={e => setRadius(Number(e.target.value))}
              className="bg-[var(--color-theme-dropdown)] border border-[var(--color-theme-border)] text-[var(--color-theme-text)] rounded-lg px-3 py-1.5 focus:outline-none focus:border-[var(--color-theme-primary)]"
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
          viewState={viewState}
          onMove={e => setViewState(e.viewState)}
          mapStyle="dark"
        >
          {/* Current Doctor Marker */}
          <MapMarker
            longitude={userLocation.coordinates[0]}
            latitude={userLocation.coordinates[1]}
            anchor="bottom"
          >
            <div className="relative flex flex-col items-center group cursor-pointer">
              <div className="w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center shadow-lg shadow-emerald-500/50 border-2 border-white z-10">
                <MapPin size={20} className="text-white" />
              </div>
              <div className="absolute -bottom-2 w-4 h-4 bg-black/30 rounded-full blur-[3px]"></div>
              
              <div className="absolute bottom-12 bg-[var(--color-theme-dropdown)] text-[var(--color-theme-text)] px-3 py-1.5 rounded-lg border border-[var(--color-theme-border)] shadow-xl whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                Your Clinic
              </div>
            </div>
          </MapMarker>

          {/* Patient Requests Markers */}
          {requests.map(req => {
            // Check if request itself has location, fallback to patient location
            const reqLocation = req.location?.coordinates || req.patient?.location?.coordinates;
            if (!reqLocation || reqLocation[0] === 0) return null;
            
            return (
              <MapMarker
                key={req._id}
                longitude={reqLocation[0]}
                latitude={reqLocation[1]}
                anchor="bottom"
                onClick={(e) => {
                  e.originalEvent.stopPropagation();
                  setSelectedRequest(req);
                }}
              >
                <div className="relative flex flex-col items-center hover:scale-110 transition-transform cursor-pointer">
                  <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center shadow-lg shadow-orange-500/50 border-2 border-[var(--color-theme-from)] z-10">
                    <UserIcon size={16} className="text-white" />
                  </div>
                  <div className="absolute -bottom-1 w-3 h-3 bg-black/30 rounded-full blur-[2px]"></div>
                </div>
              </MapMarker>
            );
          })}

          {/* Patient Popup */}
          {selectedRequest && (
            <MapPopup
              longitude={(selectedRequest.location?.coordinates || selectedRequest.patient?.location?.coordinates)[0]}
              latitude={(selectedRequest.location?.coordinates || selectedRequest.patient?.location?.coordinates)[1]}
              anchor="bottom"
              onClose={() => setSelectedRequest(null)}
              closeButton={true}
              closeOnClick={false}
              offset={[0, -32]}
              className="z-50"
            >
              <div className="p-4 bg-[var(--color-theme-panel)] text-[var(--color-theme-text)] rounded-xl w-64 shadow-2xl border border-[var(--color-theme-border)]">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-[var(--color-theme-from)] flex items-center justify-center shrink-0 border border-[var(--color-theme-border)]">
                    <UserIcon size={20} className="text-[var(--color-theme-muted)]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-[var(--color-theme-text)] truncate">{selectedRequest.patient?.name}</h3>
                    <p className="text-xs text-[var(--color-theme-muted)] capitalize">{selectedRequest.status}</p>
                  </div>
                </div>
                
                <div className="space-y-1.5 text-sm text-[var(--color-theme-muted)] mb-4">
                  <p className="truncate"><span className="font-medium text-[var(--color-theme-text)]">Issue:</span> {selectedRequest.problemDescription}</p>
                  <p><span className="font-medium text-[var(--color-theme-text)]">Budget:</span> ₹{selectedRequest.budgetRange?.min} - ₹{selectedRequest.budgetRange?.max}</p>
                  <p><span className="font-medium text-[var(--color-theme-text)]">Distance:</span> {
                    formatDistance(calculateDistance(
                      userLocation.coordinates, 
                      selectedRequest.location?.coordinates || selectedRequest.patient?.location?.coordinates
                    ))
                  }</p>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {selectedRequest.consultationModes?.map(m => (
                      <span key={m} className="text-[10px] px-2 py-0.5 rounded-full bg-[var(--color-theme-from)] border border-[var(--color-theme-border)] text-orange-400">
                        {m}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </MapPopup>
          )}

          <div className="absolute bottom-6 right-6">
            <MapControls showCompass={true} />
          </div>
        </Map>
      </div>
    </div>
  );
};

export default PotentialPatients;
