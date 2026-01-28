const toPoint = (lat, lon) => ({
  type: "Point",
  coordinates: [lon, lat]
});

const getLatLon = (el) => {
  if (el.type === "node" && Number.isFinite(el.lat) && Number.isFinite(el.lon)) {
    return { lat: el.lat, lon: el.lon };
  }

  if (
    (el.type === "way" || el.type === "relation") &&
    el.center &&
    Number.isFinite(el.center.lat) &&
    Number.isFinite(el.center.lon)
  ) {
    return { lat: el.center.lat, lon: el.center.lon };
  }

  return null;
};

const toFeature = (el) => {
  const coords = getLatLon(el);
  if (!coords) return null;

  const tags = el.tags ?? {};

  return {
    type: "Feature",
    geometry: toPoint(coords.lat, coords.lon),
    properties: {
      osmType: el.type,
      osmId: el.id,
      ...tags
    }
  };
};

export const normalizeOverpassToGeoJson = (raw) => {
  const elements = raw?.elements ?? [];

  const features = elements
    .map(toFeature)
    .filter(Boolean);

  return {
    type: "FeatureCollection",
    features
  };
};
