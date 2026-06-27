import React from 'react';
import { renderToString } from 'react-dom/server';
import { createGeoJSONCircle } from './frontend/src/utils/GeoUtils.js';

try {
  const data = createGeoJSONCircle([77.2090, 28.6139], 10);
  console.log("createGeoJSONCircle SUCCESS");
} catch(e) {
  console.log("createGeoJSONCircle CRASH", e);
}

