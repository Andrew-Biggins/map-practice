import axios from "axios";

const OVERPASS_URLS = [
  "https://overpass-api.de/api/interpreter",
  "https://overpass.kumi.systems/api/interpreter",
  "https://overpass.openstreetmap.ru/api/interpreter"
];

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

export const fetchOverpassData = async (overpassQuery) => {
  let lastErr = null;

  for (let i = 0; i < OVERPASS_URLS.length; i++) {
    const url = OVERPASS_URLS[i];

    try {
      const response = await axios.post(url, overpassQuery, {
        headers: { "Content-Type": "text/plain" },
        timeout: 20000 // Overpass can be slow; 20s is reasonable for a toy app
      });

      return response.data;
    } catch (err) {
      lastErr = err;

      // Quick backoff before trying next instance
      await sleep(300 + i * 400);
    }
  }

  // If all fail, throw the last error
  throw lastErr;
};
