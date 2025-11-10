// src/app/controlC/HU4/lib/http.ts
import axios from "axios";

// Detecta si estás en desarrollo o producción
const isLocal = typeof window !== "undefined" && window.location.hostname === "localhost";

// Base para API: usa env o fallback automático
const base =
  process.env.NEXT_PUBLIC_API_URL ||
  (isLocal
    ? "http://localhost:8000"  // backend local
    : "https://back-hu9-1pne.vercel.app"); // backend en Vercel

const http = axios.create({
  baseURL: `${base}/api/controlC`, // prefijo común
  timeout: 10000,
  headers: { "Content-Type": "application/json" },
  withCredentials: true, // si usas cookies; si no, puedes quitarlo
});

// Interceptor para añadir token
http.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("servineo_token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default http;

