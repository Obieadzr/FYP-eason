import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5000/api",
  timeout: 30000,
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem("eason_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  if (config.data instanceof FormData) {
    delete config.headers["Content-Type"];
  }

  return config;
});

API.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      console.warn("401 → clearing eason_token");
      localStorage.removeItem("eason_token");
      // Optional auto-redirect (uncomment if you want):
      // window.location.href = "/login";
    }
    return Promise.reject(err);
  }
);

export default API;