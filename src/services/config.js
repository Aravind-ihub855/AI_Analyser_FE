const config = {
  apiBaseUrl: process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000/",
  PO_Base_url: process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000/",
  SO_Base_url: process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000/",
  FINANCE_AI_Base_url: process.env.NEXT_PUBLIC_FINANCE_AI_BASE_URL || "http://localhost:8000",
  STREAMING_WS_URL: process.env.NEXT_PUBLIC_STREAMING_WS_URL || "ws://localhost:8000/streaming/ws",
};

export default config;

