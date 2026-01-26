const AMENITY_TYPES = new Set([
  "cafe",
  "restaurant",
  "bar",
  "pub",
  "fast_food",
  "gym",
  "park"
]);

export const buildOverpassQuery = ({ lat, lng, radius, types }) => {
  const safeTypes = (types ?? []).filter((t) => AMENITY_TYPES.has(t));

  // If no valid types passed, default to cafe so the query is never empty.
  const finalTypes = safeTypes.length > 0 ? safeTypes : ["cafe"];

  const selectors = finalTypes
    .map((t) => `node["amenity"="${t}"](around:${radius},${lat},${lng});`)
    .join("\n");

  return `
[out:json][timeout:25];
(
${selectors}
);
out center;
`.trim();
};
