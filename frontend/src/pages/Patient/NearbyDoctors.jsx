import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';
import { useGlobalLoading } from '../../context/GlobalLoadingContext';
import { SocketContext } from '../../context/SocketContext';
import { Map, MapMarker, MapPopup, MapControls } from '../../components/ui/map';
import { calculateDistance, formatDistance } from '../../utils/GeoUtils';
import { toast } from 'react-toastify';
import { User as UserIcon, MapPin, BriefcaseMedical } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const NearbyDoctors = () => {
  const { user } = useContext(AuthContext);
  const { socket } = useContext(SocketContext);
  const { startLoading, stopLoading } = useGlobalLoading();
  const navigate = useNavigate();

  const [doctors, setDoctors] = useState([]);
  const [radius, setRadius] = useState(10);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  
  const userLocation = user?.location;

  const [viewState, setViewState] = useState({
    longitude: userLocation?.coordinates?.[0] || 77.2090,
    latitude: userLocation?.coordinates?.[1] || 28.6139,
    zoom: 11
  });

  useEffect(() => {
    if (userLocation?.coordinates && userLocation.coordinates[0] !== 0) {
      fetchNearbyDoctors();
    } else {
      toast.warning('Please update your location in Profile Settings first to find nearby doctors.');
    }
  }, [radius, userLocation]);

  useEffect(() => {
    if (!socket) return;
    
    const handleLocationUpdate = (data) => {
      if (data.role === 'Doctor') {
        fetchNearbyDoctors(); // Refetch if a doctor moved
      }
    };

    socket.on('location_updated', handleLocationUpdate);
    return () => socket.off('location_updated', handleLocationUpdate);
  }, [socket, radius, userLocation]);

  const fetchNearbyDoctors = async () => {
    try {
      startLoading('Finding doctors near you...');
      const userInfo = JSON.parse(localStorage.getItem('userInfo'));
      const token = userInfo?.token;
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5007';
      
      const res = await axios.get(`${API_URL}/api/doctors/nearby?lat=${userLocation.coordinates[1]}&lng=${userLocation.coordinates[0]}&radius=${radius}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setDoctors(res.data);
    } catch (error) {
      toast.error('Failed to fetch nearby doctors');
    } finally {
      stopLoading();
    }
  };

  const handleRaiseRequest = (doctorId) => {
    navigate('/patient/request', { state: { preferredDoctorId: doctorId } });
  };

  if (!userLocation || userLocation.coordinates[0] === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] bg-[var(--color-theme-from)] text-center p-6">
        <MapPin size={48} className="text-[var(--color-theme-primary)] mb-4" />
        <h2 className="text-2xl font-bold text-[var(--color-theme-text)] mb-2">Location Not Set</h2>
        <p className="text-[var(--color-theme-muted)] max-w-md">
          You need to set your location in your profile settings before you can find nearby doctors.
        </p>
        <button 
          onClick={() => navigate('/patient/profile')}
          className="mt-6 px-6 py-2 bg-[var(--color-theme-primary)] text-white font-bold rounded-xl"
        >
          Go to Profile
        </button>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-80px)] w-full flex flex-col animate-fade-in bg-[var(--color-theme-from)]">
      {/* Header */}
      <div className="p-4 bg-[var(--color-theme-panel)] border-b border-[var(--color-theme-border)] flex items-center justify-between z-10">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-theme-text)]">Nearby Doctors</h1>
          <p className="text-sm text-[var(--color-theme-muted)]">Showing doctors within {radius} km</p>
        </div>
        
        <div className="flex items-center gap-3">
          <label className="text-sm text-[var(--color-theme-text)]">Search Radius:</label>
          <select 
            value={radius} 
            onChange={e => setRadius(Number(e.target.value))}
            className="bg-[var(--color-theme-dropdown)] border border-[var(--color-theme-border)] text-[var(--color-theme-text)] rounded-lg px-3 py-1.5 focus:outline-none focus:border-[var(--color-theme-primary)]"
          >
            <option value={5}>5 km</option>
            <option value={10}>10 km</option>
            <option value={20}>20 km</option>
            <option value={50}>50 km</option>
            <option value={100}>100 km</option>
            <option value={500}>500 km</option>
          </select>
        </div>
      </div>

      {/* Map Area */}
      <div className="flex-1 relative">
        <Map
          viewState={viewState}
          onMove={e => setViewState(e.viewState)}
          mapStyle="dark"
        >
          {/* Current User Marker */}
          <MapMarker
            longitude={userLocation.coordinates[0]}
            latitude={userLocation.coordinates[1]}
            anchor="bottom"
          >
            <div className="relative flex flex-col items-center group cursor-pointer">
              <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center shadow-lg shadow-blue-500/50 border-2 border-white z-10">
                <UserIcon size={20} className="text-white" />
              </div>
              <div className="absolute -bottom-2 w-4 h-4 bg-black/30 rounded-full blur-[3px]"></div>
              
              <div className="absolute bottom-12 bg-[var(--color-theme-dropdown)] text-[var(--color-theme-text)] px-3 py-1.5 rounded-lg border border-[var(--color-theme-border)] shadow-xl whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                You are here
              </div>
            </div>
          </MapMarker>

          {/* Doctor Markers */}
          {doctors.map(doc => {
            const docLocation = doc.user?.location?.coordinates;
            if (!docLocation || docLocation[0] === 0) return null;
            
            return (
              <MapMarker
                key={doc._id}
                longitude={docLocation[0]}
                latitude={docLocation[1]}
                anchor="bottom"
                onClick={(e) => {
                  e.originalEvent.stopPropagation();
                  setSelectedDoctor(doc);
                }}
              >
                <div className="relative flex flex-col items-center hover:scale-110 transition-transform cursor-pointer">
                  <div className="w-10 h-10 bg-[var(--color-theme-primary)] rounded-full overflow-hidden shadow-lg shadow-[var(--color-theme-primary)]/50 border-2 border-[var(--color-theme-from)] z-10">
                    {doc.user?.profileImage ? (
                      <img src={doc.user.profileImage} alt={doc.user?.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-[var(--color-theme-primary)] text-white">
                        <BriefcaseMedical size={20} />
                      </div>
                    )}
                  </div>
                  <div className="absolute -bottom-2 w-4 h-4 bg-black/30 rounded-full blur-[3px]"></div>
                </div>
              </MapMarker>
            );
          })}

          {/* Doctor Popup */}
          {selectedDoctor && selectedDoctor.user?.location?.coordinates && (
            <MapPopup
              longitude={selectedDoctor.user.location.coordinates[0]}
              latitude={selectedDoctor.user.location.coordinates[1]}
              anchor="bottom"
              onClose={() => setSelectedDoctor(null)}
              closeButton={true}
              closeOnClick={false}
              offset={[0, -40]}
              className="z-50"
            >
              <div className="p-4 bg-[var(--color-theme-panel)] text-[var(--color-theme-text)] rounded-xl w-64 shadow-2xl border border-[var(--color-theme-border)]">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 rounded-full overflow-hidden border border-[var(--color-theme-border)] shrink-0">
                    {selectedDoctor.user?.profileImage ? (
                      <img src={selectedDoctor.user.profileImage} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-[var(--color-theme-from)] flex items-center justify-center text-[var(--color-theme-muted)]">
                        <UserIcon size={24} />
                      </div>
                    )}
                  </div>
                  <div>
                    <h3 className="font-bold text-[var(--color-theme-text)] truncate">Dr. {selectedDoctor.user?.name}</h3>
                    <p className="text-xs text-[var(--color-theme-primary)]">{selectedDoctor.qualification}</p>
                  </div>
                </div>
                
                <div className="space-y-1.5 text-sm text-[var(--color-theme-muted)] mb-4">
                  <p><span className="font-medium text-[var(--color-theme-text)]">Experience:</span> {selectedDoctor.experience} years</p>
                  <p><span className="font-medium text-[var(--color-theme-text)]">Fee:</span> ₹{selectedDoctor.feeRange?.min} - ₹{selectedDoctor.feeRange?.max}</p>
                  <p><span className="font-medium text-[var(--color-theme-text)]">Distance:</span> {
                    formatDistance(calculateDistance(
                      userLocation.coordinates, 
                      selectedDoctor.user.location.coordinates
                    ))
                  }</p>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {selectedDoctor.consultationMode?.map(mode => (
                      <span key={mode} className="text-[10px] px-2 py-0.5 rounded-full bg-[var(--color-theme-from)] border border-[var(--color-theme-border)]">
                        {mode}
                      </span>
                    ))}
                  </div>
                </div>
                
                <button 
                  onClick={() => handleRaiseRequest(selectedDoctor.user?._id)}
                  className="w-full py-2 bg-[var(--color-theme-primary)] hover:bg-[var(--color-theme-primary-hover)] text-white font-bold rounded-lg transition-colors text-sm"
                >
                  Raise Request
                </button>
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

export default NearbyDoctors;
