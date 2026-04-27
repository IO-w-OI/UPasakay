import axios from "axios";

// Replace with your Laravel backend IP or domain
const api = axios.create({
  baseURL: "http://YOUR_SERVER_IP/api",
  timeout: 10000, // optional
});

export default api;
