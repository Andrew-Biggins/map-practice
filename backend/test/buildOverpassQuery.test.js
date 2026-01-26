import { buildOverpassQuery } from "../src/domain/buildOverpassQuery.js";
import { parsePoisQuery } from "../src/domain/parsePoisQuery.js";

describe("buildOverpassQuery", () => {
  test("builds a basic query for cafes within radius", () => {
    const q = buildOverpassQuery({
      lat: 51.5,
      lng: -2.6,
      radius: 500,
      types: ["cafe"]
    });

    // We check for key fragments rather than exact full string formatting.
    expect(q).toContain('[out:json]');
    expect(q).toContain(`around:500,51.5,-2.6`);
    expect(q).toContain(`node["amenity"="cafe"]`);
    expect(q).toContain(`out center;`);
  });

  test("includes multiple amenity types", () => {
    const q = buildOverpassQuery({
        lat: 51.5,
        lng: -2.6,
        radius: 1000,
        types: ["cafe", "restaurant"]
    });

    expect(q).toContain(`node["amenity"="cafe"]`);
    expect(q).toContain(`node["amenity"="restaurant"]`);
    expect(q).toContain(`around:1000,51.5,-2.6`);
  });

  test("parses comma-separated types", () => {
    const result = parsePoisQuery({
        lat: "51.5",
        lng: "-2.6",
        types: "cafe,gym, park"
    });

    expect(result.types).toEqual(["cafe", "gym", "park"]);
  });
});
