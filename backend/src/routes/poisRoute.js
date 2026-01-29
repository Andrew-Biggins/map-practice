import express from "express";

import { parsePoisQuery } from "../domain/parsePoisQuery.js";
import { buildOverpassQuery } from "../domain/buildOverpassQuery.js";
import { fetchOverpassData } from "../adapters/overpassClient.js";
import { normalizeOverpassToGeoJson } from "../domain/normalizeOverpassToGeoJson.js";

export const poisRoute = express.Router();

const cache = new Map();
const TTL_MS = 60_000;

const cacheKey = ({ lat, lng, radius, types }) =>
  `${lat.toFixed(5)}:${lng.toFixed(5)}:${radius}:${[...types].sort().join(",")}`;

poisRoute.get("/", async (req, res) => {
  try {
    const { lat, lng, radius, types } = parsePoisQuery(req.query);

    const key = cacheKey({ lat, lng, radius, types });
    const hit = cache.get(key);
    if (hit && Date.now() - hit.time < TTL_MS) return res.json(hit.value);

    const overpassQuery = buildOverpassQuery({
      lat,
      lng,
      radius,
      types
    });

    const rawData = await fetchOverpassData(overpassQuery);
    const geojson = normalizeOverpassToGeoJson(rawData);

    cache.set(key, { time: Date.now(), value: geojson });
    return res.json(geojson);

  } catch (err) {
    if (res.headersSent) return;

    const status = err?.response?.status; // axios errors may have this
    if (status === 429 || status === 504) {
      return res.status(503).json({ error: "Overpass is busy. Try again in a moment." });
    }

    return res.status(400).json({ error: err.message ?? "Unknown error" });
  }
});
