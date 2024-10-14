import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import path from "path";
import http from 'http';
import { Server } from 'socket.io';

import { connectDB } from "./db/connectDB.js";
import socketEvents from './utils/socketEvents.js';
import authRoutes from "./routes/auth.route.js";
import settingsRoutes from './routes/settings.route.js';
import albumMediaRoutes from './routes/albumMedia.route.js';
import challengeRoutes from './routes/challenges.route.js';
import likeRoutes from './routes/like.route.js';
import s3TestRoute from './routes/s3Test.route.js';
import userRoutes from './routes/userRoutes.js';
import profilePictureRoutes from './routes/profilePicture.route.js';
import commentsRouter from './routes/comments.route.js';
import stripeRoutes from './routes/stripeRoutes.js';

// Lade Umgebungsvariablen
dotenv.config();

const app = express();
const server = http.createServer(app);

// Dynamische Auswahl der Client-URL für CORS und Socket.IO
const CLIENT_URL = process.env.NODE_ENV === 'production'
	? process.env.CLIENT_URL_PROD
	: process.env.CLIENT_URL_DEV;

// Initialisierung von Socket.IO mit dynamischem CORS
const io = new Server(server, {
	cors: {
		origin: CLIENT_URL,
		methods: ["GET", "POST", "DELETE", "PUT"],
		credentials: true
	}
});
app.set('io', io);

const PORT = process.env.PORT || 5000;
const __dirname = path.resolve();

// Middleware
app.use(cors({
	origin: process.env.CLIENT_URL_DEV,
	credentials: true,
}));

app.use(express.json());
app.use(cookieParser());

// Test route
app.get('/', (req, res) => {
	res.send('Welcome to my backend API server!');
});

// API routes
app.use("/api/auth", authRoutes);
app.use("/api/settings", settingsRoutes);
app.use('/api/s3-test', s3TestRoute);
app.use('/api/comments', commentsRouter);
app.use('/api/profile-picture', profilePictureRoutes);
app.use('/api/album-media', albumMediaRoutes);
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/challenges', challengeRoutes);
app.use('/api', likeRoutes);
app.use('/api/user', userRoutes);

// Stripe Payment Routes
app.use('/api/stripe', stripeRoutes);

// Socket.IO events
socketEvents(io);

// Statische Dateien im Produktionsmodus ausliefern
if (process.env.NODE_ENV === "production") {
	app.use(express.static(path.join(__dirname, "/frontend/dist")));
	app.get("*", (req, res) => {
		res.sendFile(path.resolve(__dirname, "frontend", "dist", "index.html"));
	});
}

// Server starten
server.listen(PORT, () => {
	connectDB();
	console.log("Server is running on port:", PORT);
	console.log("Client URL:", CLIENT_URL);
});
