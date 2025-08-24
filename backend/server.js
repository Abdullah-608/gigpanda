import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import path from "path";
import { fileURLToPath } from 'url';

import { connectDB } from "./db/connectDB.js";

import authRoutes from "./routes/auth.route.js";
import userRoutes from "./routes/user.route.js";
import postRoutes from "./routes/post.route.js";
import jobRoutes from "./routes/job.route.js";
import proposalRoutes from "./routes/proposal.route.js";
import messageRoutes from "./routes/message.routes.js";
import contractRoutes from "./routes/contract.route.js";
import { router as notificationRoutes } from "./routes/notifications.js";
import bookmarkRoutes from "./routes/bookmark.route.js"
import geminiRoutes from './routes/gemini.route.js'

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(cors({
	origin: process.env.NODE_ENV === "development" ? 
		process.env.DEV_CLIENT_URL || "http://localhost:5173" : 
		process.env.CLIENT_URL || process.env.FRONTEND_URL,
	credentials: true
}));

app.use(express.json({ limit: '50mb' })); // Increased limit for base64 images
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser()); // allows us to parse incoming cookies

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/jobs", jobRoutes);
app.use("/api/proposals", proposalRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/contracts", contractRoutes);
app.use('/api/bookmarks', bookmarkRoutes);
app.use('/api/gemini', geminiRoutes);


// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Something went wrong on the server',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});
if (process.env.NODE_ENV === "production") {
	app.use(express.static(path.join(__dirname, "/frontend/dist")));

	app.get("*", (req, res) => {
		res.sendFile(path.resolve(__dirname, "frontend", "dist", "index.html"));
	});
}

app.listen(PORT, () => {
	connectDB();
	console.log("Server is running on port: ", PORT);
});
