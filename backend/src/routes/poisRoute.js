import express from "express";

import { parsePoisQuery } from "../domain/parsePoisQuery.js";
import { buildOverpassQuery } from "../domain/buildOverpassQuery.js";
import { fetchOverpassData } from "../adapters/overpassClient.js";
import { normalizeOverpassToGeoJson } from "../domain/normalizeOverpassToGeoJson.js";

export const poisRoute = express.Router();

poisRoute.get("/", async (req, res) => {
  try {
    // 1) Parse + validate query params
    const { lat, lng, radius, types } = parsePoisQuery(req.query);

    // 2) Build Overpass QL string
    const overpassQuery = buildOverpassQuery({
      lat,
      lng,
      radius,
      types
    });

    // 3) Call Overpass API
    const rawData = await fetchOverpassData(overpassQuery);

    // 4) Return raw for now
    const geojson = normalizeOverpassToGeoJson(rawData);
    res.json(geojson);

  } catch (err) {
    res.status(400).json({
      error: err.message
    });
  }
});
