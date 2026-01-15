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
      console.warn("401 Unauthorized → clearing token & redirecting");
      localStorage.removeItem("eason_token");
      window.location.href = "/login?session_expired=true"; // Auto redirect
    }
    return Promise.reject(err);
  }
);

export default API;