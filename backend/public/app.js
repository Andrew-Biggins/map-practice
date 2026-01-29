const map = L.map("map").setView([51.5074, -0.1278], 13); // London default

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  maxZoom: 19,
  attribution: "&copy; OpenStreetMap contributors"
}).addTo(map);

let clickMarker = null;
let radiusCircle = null;
let geoJsonLayer = null;

let isLoading = false;
let currentAbort = null;
let requestSeq = 0;

const radiusInput = document.getElementById("radius");
const typesInput = document.getElementById("types");
const clearBtn = document.getElementById("clear");

const clearLayers = () => {
  if (clickMarker) { map.removeLayer(clickMarker); clickMarker = null; }
  if (radiusCircle) { map.removeLayer(radiusCircle); radiusCircle = null; }
  if (geoJsonLayer) { map.removeLayer(geoJsonLayer); geoJsonLayer = null; }
};

const fetchPois = async ({ lat, lng, radius, types, signal }) => {
  const params = new URLSearchParams({
    lat: String(lat),
    lng: String(lng),
    radius: String(radius),
    types: types.join(",")
  });

  const res = await fetch(`/api/pois?${params.toString()}`, { signal });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Request failed (${res.status})`);
  }
  return res.json();
};


const renderGeoJson = (geojson) => {
  if (geoJsonLayer) map.removeLayer(geoJsonLayer);

  geoJsonLayer = L.geoJSON(geojson, {
    pointToLayer: (_feature, latlng) => L.circleMarker(latlng, { radius: 6 }),
    onEachFeature: (feature, layer) => {
      const name = feature.properties?.name ?? "(Unnamed)";
      const amenity = feature.properties?.amenity ?? "";
      layer.bindPopup(`<b>${name}</b><br/>${amenity}`);
    }
  }).addTo(map);
};

map.on("click", async (e) => {
  // Increment request id and cancel any in-flight request
  const mySeq = ++requestSeq;
  if (currentAbort) currentAbort.abort();
  currentAbort = new AbortController();

  const { lat, lng } = e.latlng;
  const radius = Number(radiusInput.value) || 500;
  const types = String(typesInput.value || "cafe")
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);

  clearLayers();

  clickMarker = L.marker([lat, lng]).addTo(map);
  radiusCircle = L.circle([lat, lng], { radius }).addTo(map);

  isLoading = true;
  try {
    const geojson = await fetchPois({
      lat,
      lng,
      radius,
      types,
      signal: currentAbort.signal
    });

    // Ignore late responses from previous clicks
    if (mySeq !== requestSeq) return;

    renderGeoJson(geojson);
  } catch (err) {
    // Ignore abort errors (they're expected)
    if (err.name !== "AbortError") alert(err.message);
  } finally {
    if (mySeq === requestSeq) isLoading = false;
  }
});

clearBtn.addEventListener("click", clearLayers);
