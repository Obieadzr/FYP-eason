import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5000/api",
  timeout: 30000,
});

// Auto add Bearer token
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("eason_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auto logout + redirect on 401
API.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem("eason_token");
      window.location.href = "/login?expired=true";
    }
    return Promise.reject(err);
  }
);

export default API;