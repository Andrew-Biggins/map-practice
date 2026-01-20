import { parsePoisQuery } from "../src/domain/parsePoisQuery.js";

describe("parsePoisQuery", () => {
  test("parses valid lat, lng and radius", () => {
    const result = parsePoisQuery({
      lat: "51.5",
      lng: "-2.6",
      radius: "500"
    });

    expect(result).toEqual({
      lat: 51.5,
      lng: -2.6,
      radius: 500,
      types: []
    });
  });
});
