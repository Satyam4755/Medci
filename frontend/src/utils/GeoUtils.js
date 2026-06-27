export const getCurrentLocation = () => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by your browser.'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      },
      (error) => {
        let msg = 'Failed to get location.';
        switch (error.code) {
          case error.PERMISSION_DENIED:
            msg = 'Permission to access location was denied. Please allow location access in your browser settings.';
            break;
          case error.POSITION_UNAVAILABLE:
            msg = 'Location information is unavailable.';
            break;
          case error.TIMEOUT:
            msg = 'The request to get user location timed out.';
            break;
          default:
            msg = 'An unknown error occurred while getting location.';
            break;
        }
        reject(new Error(msg));
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  });
};

export const reverseGeocode = async (lat, lon) => {
  try {
    const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lon}`);
    if (!res.ok) throw new Error('Network error');
    const data = await res.json();
    
    if (data.error) throw new Error(data.error);

    const addressObj = data.address || {};
    return {
      formattedAddress: data.display_name,
      address: addressObj.road || addressObj.suburb || addressObj.neighbourhood || '',
      city: addressObj.city || addressObj.town || addressObj.village || addressObj.county || '',
      state: addressObj.state || '',
      country: addressObj.country || '',
      pincode: addressObj.postcode || '',
      latitude: lat,
      longitude: lon,
      placeId: data.place_id?.toString() || ''
    };
  } catch (error) {
    throw new Error('Failed to reverse geocode coordinates.');
  }
};

export const searchLocation = async (query) => {
  try {
    const res = await fetch(`https://nominatim.openstreetmap.org/search?format=jsonv2&q=${encodeURIComponent(query)}&limit=5`);
    if (!res.ok) throw new Error('Network error');
    const data = await res.json();
    
    return data.map(item => ({
      formattedAddress: item.display_name,
      latitude: parseFloat(item.lat),
      longitude: parseFloat(item.lon),
      placeId: item.place_id?.toString() || ''
    }));
  } catch (error) {
    throw new Error('Failed to search location.');
  }
};

// Calculate Haversine distance in km between two [lng, lat] arrays
export const calculateDistance = (coord1, coord2) => {
  if (!coord1 || !coord2 || coord1.length !== 2 || coord2.length !== 2) return null;
  
  const toRad = (value) => (value * Math.PI) / 180;
  
  const lon1 = coord1[0];
  const lat1 = coord1[1];
  const lon2 = coord2[0];
  const lat2 = coord2[1];
  
  const R = 6371; // Earth radius in km
  
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
    
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  
  return distance;
};

export const formatDistance = (distanceInKm) => {
  if (distanceInKm === null || distanceInKm === undefined) return '';
  if (distanceInKm < 1) {
    return `${Math.round(distanceInKm * 1000)} m`;
  }
  return `${distanceInKm.toFixed(1)} km`;
};

// Create a GeoJSON Polygon for a circle
export const createGeoJSONCircle = (center, radiusInKm, points = 64) => {
  if (!center || center.length !== 2) return null;
  
  const coords = { latitude: center[1], longitude: center[0] };
  const km = radiusInKm;
  const ret = [];
  
  // Approximate conversion: 1 degree latitude = ~111.32 km
  const distanceX = km / (111.320 * Math.cos(coords.latitude * (Math.PI / 180)));
  const distanceY = km / 110.574;

  for (let i = 0; i < points; i++) {
    const theta = (i / points) * (2 * Math.PI);
    const x = distanceX * Math.cos(theta);
    const y = distanceY * Math.sin(theta);
    ret.push([coords.longitude + x, coords.latitude + y]);
  }
  ret.push(ret[0]); // close the polygon

  return {
    type: "FeatureCollection",
    features: [{
      type: "Feature",
      geometry: {
        type: "Polygon",
        coordinates: [ret]
      }
    }]
  };
};
