import axios from "axios";

const OVERPASS_URL = "https://overpass-api.de/api/interpreter";

/**
 * Calls the Overpass API with a query string and returns raw JSON.
 * Side-effecty network code belongs here, not in domain/.
 */
export const fetchOverpassData = async (overpassQuery) => {
  const response = await axios.post(OVERPASS_URL, overpassQuery, {
    headers: {
      "Content-Type": "text/plain"
    },
    timeout: 10000
  });

  return response.data;
};
