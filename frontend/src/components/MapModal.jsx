import React, { useState, useEffect, useRef, useCallback, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Map, MapMarker, MapControls } from './ui/map';
import { reverseGeocode, searchLocation, getCurrentLocation } from '../utils/GeoUtils';
import { toast } from 'react-toastify';
import { Search, MapPin, Check, ChevronLeft, Loader2, Navigation, Focus } from 'lucide-react';
import { ThemeContext } from '../context/ThemeContext';
import { theme as appTheme } from '../utils/theme';

const MapModal = ({ isOpen, onClose, onConfirm, initialLocation }) => {
  const { theme } = useContext(ThemeContext);
  const isDark = theme === 'dark';

  const [viewState, setViewState] = useState({
    longitude: initialLocation?.longitude || 77.2090, // Default to New Delhi
    latitude: initialLocation?.latitude || 28.6139,
    zoom: 14
  });
  
  const [markerState, setMarkerState] = useState({
    longitude: initialLocation?.longitude || 77.2090,
    latitude: initialLocation?.latitude || 28.6139
  });

  const [addressDetails, setAddressDetails] = useState(initialLocation || null);
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const searchTimeoutRef = useRef(null);
  const mapRef = useRef(null);

  useEffect(() => {
    if (isOpen && initialLocation?.longitude && initialLocation?.latitude) {
      setViewState(prev => ({
        ...prev,
        longitude: initialLocation.longitude,
        latitude: initialLocation.latitude
      }));
      setMarkerState({
        longitude: initialLocation.longitude,
        latitude: initialLocation.latitude
      });
      setAddressDetails(initialLocation);
    }
  }, [isOpen, initialLocation]);

  const updateLocationDetails = useCallback(async (lon, lat) => {
    setIsGeocoding(true);
    try {
      const details = await reverseGeocode(lat, lon);
      setAddressDetails(details);
    } catch (error) {
      toast.error('Could not fetch address details for this location.');
    } finally {
      setIsGeocoding(false);
    }
  }, []);

  const handleDragEnd = useCallback((event) => {
    const { lng, lat } = event.lngLat;
    setMarkerState({ longitude: lng, latitude: lat });
    updateLocationDetails(lng, lat);
  }, [updateLocationDetails]);

  const handleSearch = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    
    if (query.length < 3) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    searchTimeoutRef.current = setTimeout(async () => {
      try {
        const results = await searchLocation(query);
        setSearchResults(results);
      } catch (error) {
        // Silent fail on search
      } finally {
        setIsSearching(false);
      }
    }, 800);
  };

  const handleSelectSearchResult = (result) => {
    setViewState(prev => ({
      ...prev,
      longitude: result.longitude,
      latitude: result.latitude,
      zoom: 15
    }));
    setMarkerState({
      longitude: result.longitude,
      latitude: result.latitude
    });
    setAddressDetails(result);
    setSearchQuery('');
    setSearchResults([]);
    updateLocationDetails(result.longitude, result.latitude);
  };

  const handleLocateMe = async () => {
    setIsGeocoding(true);
    try {
      const { latitude, longitude } = await getCurrentLocation();
      setViewState(prev => ({
        ...prev,
        longitude,
        latitude,
        zoom: 15
      }));
      setMarkerState({ longitude, latitude });
      updateLocationDetails(longitude, latitude);
    } catch (error) {
      toast.error(error.message || 'Failed to get current location.');
    } finally {
      setIsGeocoding(false);
    }
  };

  const handleConfirm = () => {
    if (!addressDetails) {
      toast.error('Please wait for the address to be resolved.');
      return;
    }
    onConfirm(addressDetails);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[9999] flex flex-col bg-background overflow-hidden">
        {/* Fullscreen Map Area */}
        <motion.div 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          exit={{ opacity: 0 }}
          className="flex-1 relative w-full h-full"
        >
          <Map
            ref={mapRef}
            viewState={viewState}
            onMove={e => setViewState(e.viewState)}
            mapStyle={isDark ? 'dark' : 'light'}
            className="w-full h-full"
          >
            {/* Draggable Marker */}
            <MapMarker
              longitude={markerState.longitude}
              latitude={markerState.latitude}
              draggable={true}
              onDragEnd={handleDragEnd}
            >
              <div className="relative flex flex-col items-center justify-center -translate-y-1/2 cursor-grab active:cursor-grabbing">
                <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center shadow-lg shadow-primary/40 border-2 border-white animate-bounce-short">
                  <MapPin size={20} className="text-primary-foreground" />
                </div>
                <div className="absolute -bottom-1 w-3 h-1 bg-black/30 rounded-[100%] blur-[1px]"></div>
              </div>
            </MapMarker>
            
            {/* Map Controls */}
            <div className="absolute top-[30%] right-4 flex flex-col gap-2">
              <MapControls showCompass={true} />
              <button 
                onClick={handleLocateMe}
                className="w-8 h-8 mt-2 bg-card border border-border rounded-md shadow-md flex items-center justify-center text-foreground hover:bg-popover transition"
              >
                <Focus size={18} />
              </button>
            </div>
          </Map>

          {/* Top Navbar & Search Bar overlay */}
          <div className="absolute top-0 left-0 w-full p-4 pt-6 md:pt-8 flex flex-col items-center gap-4 bg-gradient-to-b from-black/50 to-transparent pointer-events-none">
            <div className="w-full max-w-lg relative flex items-center pointer-events-auto gap-3">
              <button 
                onClick={onClose} 
                className="w-12 h-12 bg-card rounded-full shadow-lg border border-border flex items-center justify-center text-foreground hover:bg-popover transition"
              >
                <ChevronLeft size={24} />
              </button>
              
              <div className="flex-1 relative">
                <input
                  type="text"
                  placeholder="Search for your area or landmark"
                  value={searchQuery}
                  onChange={handleSearch}
                  className="w-full h-12 bg-card/95 backdrop-blur-md border border-border text-foreground rounded-full pl-12 pr-4 shadow-lg focus:outline-none focus:border-primary transition placeholder:text-muted-foreground"
                />
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
                {isSearching && <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 animate-spin text-primary" size={18} />}
              </div>
            </div>

            {/* Search Results */}
            {searchResults.length > 0 && (
              <div className="w-full max-w-lg bg-card border border-border rounded-2xl shadow-xl overflow-hidden pointer-events-auto max-h-60 overflow-y-auto ml-14 md:ml-0 custom-scrollbar">
                {searchResults.map((res, i) => (
                  <button
                    key={i}
                    onClick={() => handleSelectSearchResult(res)}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-popover text-left border-b border-border last:border-0 transition-colors"
                  >
                    <MapPin size={16} className="text-muted-foreground shrink-0" />
                    <p className="text-sm text-foreground truncate">{res.formattedAddress}</p>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Bottom Sheet */}
          <motion.div 
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="absolute bottom-0 left-0 w-full flex justify-center pb-0"
          >
            <div className="w-full max-w-2xl bg-card/95 backdrop-blur-xl border-t border-border rounded-t-3xl shadow-[0_-10px_40px_rgba(0,0,0,0.2)] p-6 pt-8 pb-10 flex flex-col gap-6">
              
              <div className="absolute top-3 left-1/2 -translate-x-1/2 w-12 h-1.5 bg-border rounded-full"></div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0 border border-primary/20">
                  {isGeocoding ? (
                    <Loader2 className="animate-spin text-primary" size={24} />
                  ) : (
                    <Navigation className="text-primary" size={24} />
                  )}
                </div>
                <div className="flex-1 min-w-0 pt-1">
                  <h3 className="text-xl font-bold text-foreground mb-1">Confirm Location</h3>
                  <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                    {isGeocoding ? 'Fetching precise address details...' : addressDetails?.formattedAddress || 'Drag the map to select your exact location'}
                  </p>
                </div>
              </div>
              
              <button
                onClick={handleConfirm}
                disabled={isGeocoding || !addressDetails}
                className={`w-full h-14 ${appTheme.buttonPrimary} disabled:opacity-50 disabled:cursor-not-allowed text-lg font-bold rounded-2xl transition-all shadow-xl flex items-center justify-center gap-2`}
              >
                <Check size={20} /> Save & Proceed
              </button>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default MapModal;
