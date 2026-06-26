import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Map, MapMarker, MapControls } from './ui/map';
import { reverseGeocode, searchLocation } from '../utils/GeoUtils';
import { toast } from 'react-toastify';
import { Search, MapPin, Check, X, Loader2 } from 'lucide-react';

const MapModal = ({ isOpen, onClose, onConfirm, initialLocation }) => {
  const [viewState, setViewState] = useState({
    longitude: initialLocation?.longitude || 77.2090, // Default to New Delhi
    latitude: initialLocation?.latitude || 28.6139,
    zoom: 12
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
        // Silent fail on search to not spam user
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
      zoom: 14
    }));
    setMarkerState({
      longitude: result.longitude,
      latitude: result.latitude
    });
    setAddressDetails(result); // result already has partial address, but we can do a full geocode if needed
    setSearchQuery('');
    setSearchResults([]);
    // Fetch full details
    updateLocationDetails(result.longitude, result.latitude);
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
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div 
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          onClick={onClose}
        />
        
        {/* Modal */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 20 }} 
          animate={{ opacity: 1, scale: 1, y: 0 }} 
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-4xl bg-[var(--color-theme-panel)] rounded-2xl shadow-2xl border border-[var(--color-theme-border)] overflow-hidden flex flex-col h-[85vh] max-h-[800px]"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-[var(--color-theme-border)] bg-[var(--color-theme-dropdown)]">
            <h2 className="text-xl font-bold flex items-center gap-2 text-[var(--color-theme-text)]">
              <MapPin className="text-[var(--color-theme-primary)]" /> Pick Your Location
            </h2>
            <button onClick={onClose} className="p-2 hover:bg-[var(--color-theme-border)] rounded-full transition-colors text-[var(--color-theme-muted)] hover:text-white">
              <X size={20} />
            </button>
          </div>

          {/* Search Bar */}
          <div className="absolute top-20 left-1/2 -translate-x-1/2 w-full max-w-md z-10 px-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Search for a place or address..."
                value={searchQuery}
                onChange={handleSearch}
                className="w-full bg-[var(--color-theme-panel)]/90 backdrop-blur-md border border-[var(--color-theme-border)] text-[var(--color-theme-text)] rounded-xl px-12 py-3 shadow-lg focus:outline-none focus:border-[var(--color-theme-primary)] transition"
              />
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-theme-muted)]" size={18} />
              {isSearching && <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 animate-spin text-[var(--color-theme-primary)]" size={18} />}
            </div>
            
            {/* Search Results Dropdown */}
            {searchResults.length > 0 && (
              <div className="absolute mt-2 w-[calc(100%-2rem)] mx-4 bg-[var(--color-theme-dropdown)] border border-[var(--color-theme-border)] rounded-xl shadow-xl overflow-hidden z-20 max-h-60 overflow-y-auto custom-scrollbar">
                {searchResults.map((res, i) => (
                  <button
                    key={i}
                    onClick={() => handleSelectSearchResult(res)}
                    className="w-full text-left px-4 py-3 hover:bg-[var(--color-theme-from)]/20 text-sm text-[var(--color-theme-text)] border-b border-[var(--color-theme-border)] last:border-0 transition-colors"
                  >
                    {res.formattedAddress}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Map Area */}
          <div className="flex-1 relative bg-[var(--color-theme-from)]">
            <Map
              viewState={viewState}
              onMove={e => setViewState(e.viewState)}
              mapStyle="dark"
            >
              <MapMarker
                longitude={markerState.longitude}
                latitude={markerState.latitude}
                draggable={true}
                onDragEnd={handleDragEnd}
              >
                <div className="relative flex items-center justify-center -translate-y-1/2">
                  <div className="w-8 h-8 bg-[var(--color-theme-primary)] rounded-full flex items-center justify-center shadow-lg shadow-[var(--color-theme-primary)]/40 border-2 border-white cursor-grab active:cursor-grabbing">
                    <MapPin size={16} className="text-white" />
                  </div>
                  <div className="absolute -bottom-2 w-2 h-2 bg-black/20 rounded-full blur-[2px]"></div>
                </div>
              </MapMarker>
              
              <div className="absolute bottom-6 right-6">
                <MapControls showCompass={false} />
              </div>
            </Map>
          </div>

          {/* Footer Details */}
          <div className="p-4 sm:p-6 bg-[var(--color-theme-dropdown)] border-t border-[var(--color-theme-border)] flex flex-col sm:flex-row items-center gap-4">
            <div className="flex-1 w-full flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-[var(--color-theme-from)]/30 flex items-center justify-center shrink-0 border border-[var(--color-theme-border)]">
                {isGeocoding ? (
                  <Loader2 className="animate-spin text-[var(--color-theme-primary)]" size={24} />
                ) : (
                  <MapPin className="text-[var(--color-theme-primary)]" size={24} />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-[var(--color-theme-muted)] uppercase tracking-wider mb-1">Selected Location</p>
                <p className="text-sm font-medium text-[var(--color-theme-text)] truncate">
                  {isGeocoding ? 'Resolving address...' : addressDetails?.formattedAddress || 'Drag the marker to select a location'}
                </p>
              </div>
            </div>
            
            <button
              onClick={handleConfirm}
              disabled={isGeocoding || !addressDetails}
              className="w-full sm:w-auto px-8 py-3 bg-[var(--color-theme-primary)] hover:bg-[var(--color-theme-primary-hover)] disabled:bg-[var(--color-theme-primary)]/50 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-all shadow-lg flex items-center justify-center gap-2"
            >
              <Check size={18} /> Confirm Location
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default MapModal;
