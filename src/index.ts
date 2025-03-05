import dotenv from "dotenv";
import express, { Application } from "express";
import cors from "cors";

// Import routes
import sourceRoutes from "./routes";

dotenv.config();

const app: Application = express();
const PORT: number | string = process.env.PORT || 5000;

// Enable CORS for all requests
app.use(cors());

// Middleware
app.use(express.json());

app.use("/api", sourceRoutes);

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
