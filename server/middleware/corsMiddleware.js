import cors from "cors";

const allowedOrigins = new Set([
  process.env.FRONTEND_URL || "bulkmailerfrontend.vercel.app",
  "http://localhost:3000",
  "http://localhost:5173",
  "http://localhost:5174",
]);

export default function createCorsMiddleware() {
  return cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.has(origin)) {
        callback(null, true);
      } else {
        callback(new Error(`Not allowed: ${origin}`));
      }
    },
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
    maxAge: 86400, // Cache preflight for 24 hours
  });
}
