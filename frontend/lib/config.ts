
export const config = {
  apiUrl: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000",
  environment: process.env.NEXT_PUBLIC_ENV || "development",
  isDevelopment: process.env.NEXT_PUBLIC_ENV === "development" || process.env.NODE_ENV === "development",
  isProduction: process.env.NEXT_PUBLIC_ENV === "production" || process.env.NODE_ENV === "production",
} as const;

export default config;


