const apiVersion = "/api";

const config = {
  /* eslint-disable no-nested-ternary */
  baseUrl: process.env.REACT_APP_API_URL
    ? process.env.REACT_APP_API_URL
    : process.env.NODE_ENV !== "production"
    ? process.env.REACT_APP_HTTPS
      ? `https://localhost:8001${apiVersion}`
      : `http://localhost:8001${apiVersion}`
    : apiVersion,
};

export default config;
