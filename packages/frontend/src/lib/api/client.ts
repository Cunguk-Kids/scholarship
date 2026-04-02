import axios from "axios";

/**
 * Ponder v4 REST API client.
 * Base URL comes from VITE_BACKEND_HOST env var.
 */
export const api = axios.create({
  baseURL: `${import.meta.env.VITE_BACKEND_HOST}/v4`,
  timeout: 15_000,
  headers: { "Content-Type": "application/json" },
});

/** Raw backend client (non-v4 endpoints like /sse, /ipfs) */
export const rawApi = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_HOST,
  timeout: 15_000,
});
