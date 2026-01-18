import axios from "axios";

export const httpGetJson = async (url) => {
  const response = await axios.get(url, {
    timeout: 5000
  });

  return response.data;
};
