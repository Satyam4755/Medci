import React, { useState } from 'react';
import { MapPin, Navigation, Loader2 } from 'lucide-react';
import { toast } from 'react-toastify';
import { getCurrentLocation, reverseGeocode } from '../utils/GeoUtils';
import MapModal from './MapModal';

const LocationPicker = ({ location, onLocationChange }) => {
  const [isLocating, setIsLocating] = useState(false);
  const [showMapModal, setShowMapModal] = useState(false);

  const handleUseCurrentLocation = async () => {
    setIsLocating(true);
    try {
      const { latitude, longitude } = await getCurrentLocation();
      const details = await reverseGeocode(latitude, longitude);
      onLocationChange(details);
      toast.success('Location detected successfully!');
    } catch (error) {
      toast.error(error.message || 'Failed to detect location.');
    } finally {
      setIsLocating(false);
    }
  };

  const handleMapConfirm = (details) => {
    onLocationChange(details);
    toast.success('Location selected from map!');
  };

  return (
    <div className="w-full space-y-4">
      {/* Current Location Display */}
      {location?.formattedAddress ? (
        <div className="p-4 bg-popover border border-border rounded-xl flex items-start gap-3">
          <MapPin className="text-primary shrink-0 mt-0.5" size={20} />
          <div className="flex-1">
            <p className="text-sm text-foreground font-medium leading-relaxed">
              {location.formattedAddress}
            </p>
            <p className="text-xs text-muted-foreground mt-1 font-mono">
              {location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}
            </p>
          </div>
        </div>
      ) : (
        <div className="p-4 border border-dashed border-border rounded-xl bg-card/50 text-center">
          <p className="text-sm text-muted-foreground">No location selected.</p>
        </div>
      )}

      {/* Action Buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <button
          type="button"
          onClick={handleUseCurrentLocation}
          disabled={isLocating}
          className="flex items-center justify-center gap-2 px-4 py-3 bg-card hover:bg-popover border border-border rounded-xl text-sm font-bold text-foreground transition-colors disabled:opacity-50"
        >
          {isLocating ? <Loader2 className="animate-spin" size={18} /> : <Navigation size={18} className="text-blue-400" />}
          {isLocating ? 'Detecting...' : 'Use Current Location'}
        </button>

        <button
          type="button"
          onClick={() => setShowMapModal(true)}
          className="flex items-center justify-center gap-2 px-4 py-3 bg-card hover:bg-popover border border-border rounded-xl text-sm font-bold text-foreground transition-colors"
        >
          <MapPin size={18} className="text-red-400" />
          Pick on Map
        </button>
      </div>

      {showMapModal && (
        <MapModal
          isOpen={showMapModal}
          onClose={() => setShowMapModal(false)}
          onConfirm={handleMapConfirm}
          initialLocation={location}
        />
      )}
    </div>
  );
};

export default LocationPicker;
