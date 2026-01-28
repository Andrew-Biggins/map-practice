const map = L.map("map").setView([51.5074, -0.1278], 13); // London default

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  maxZoom: 19,
  attribution: "&copy; OpenStreetMap contributors"
}).addTo(map);

let clickMarker = null;
let radiusCircle = null;
let geoJsonLayer = null;

const radiusInput = document.getElementById("radius");
const typesInput = document.getElementById("types");
const clearBtn = document.getElementById("clear");

const clearLayers = () => {
  if (clickMarker) { map.removeLayer(clickMarker); clickMarker = null; }
  if (radiusCircle) { map.removeLayer(radiusCircle); radiusCircle = null; }
  if (geoJsonLayer) { map.removeLayer(geoJsonLayer); geoJsonLayer = null; }
};

const fetchPois = async ({ lat, lng, radius, types }) => {
  const params = new URLSearchParams({
    lat: String(lat),
    lng: String(lng),
    radius: String(radius),
    types: types.join(",")
  });

  const res = await fetch(`/api/pois?${params.toString()}`);
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
  const { lat, lng } = e.latlng;
  const radius = Number(radiusInput.value) || 500;
  const types = String(typesInput.value || "cafe")
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);

  clearLayers();

  clickMarker = L.marker([lat, lng]).addTo(map);
  radiusCircle = L.circle([lat, lng], { radius }).addTo(map);

  try {
    const geojson = await fetchPois({ lat, lng, radius, types });
    renderGeoJson(geojson);
  } catch (err) {
    alert(err.message);
  }
});

clearBtn.addEventListener("click", clearLayers);
