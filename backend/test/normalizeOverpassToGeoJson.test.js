import { normalizeOverpassToGeoJson } from "../src/domain/normalizeOverpassToGeoJson.js";

describe("normalizeOverpassToGeoJson", () => {
  test("converts node elements to GeoJSON Point features", () => {
    const raw = {
      elements: [
        {
          type: "node",
          id: 1,
          lat: 51.5,
          lon: -2.6,
          tags: { amenity: "cafe", name: "Test Cafe" }
        }
      ]
    };

    const geo = normalizeOverpassToGeoJson(raw);

    expect(geo.type).toBe("FeatureCollection");
    expect(geo.features).toHaveLength(1);

    const f = geo.features[0];
    expect(f.type).toBe("Feature");
    expect(f.geometry).toEqual({
      type: "Point",
      coordinates: [-2.6, 51.5]
    });
    expect(f.properties).toMatchObject({
      osmType: "node",
      osmId: 1,
      amenity: "cafe",
      name: "Test Cafe"
    });
  });

  test("uses center for ways/relations when present", () => {
    const raw = {
      elements: [
        {
          type: "way",
          id: 99,
          center: { lat: 51.501, lon: -2.601 },
          tags: { amenity: "restaurant", name: "Test Food" }
        }
      ]
    };

    const geo = normalizeOverpassToGeoJson(raw);

    expect(geo.features).toHaveLength(1);
    expect(geo.features[0].geometry.coordinates).toEqual([-2.601, 51.501]);
    expect(geo.features[0].properties).toMatchObject({
      osmType: "way",
      osmId: 99,
      amenity: "restaurant"
    });
  });

  test("skips elements that have no coordinates", () => {
    const raw = {
      elements: [
        { type: "node", id: 1, tags: { amenity: "cafe" } }, // missing lat/lon
        { type: "way", id: 2, tags: { amenity: "pub" } }    // missing center
      ]
    };

    const geo = normalizeOverpassToGeoJson(raw);

    expect(geo.features).toHaveLength(0);
  });
});
