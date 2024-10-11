import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import path from "path";

import { connectDB } from "./db/connectDB.js";
import authRoutes from "./routes/auth.route.js";
import settingsRoutes from './routes/settings.route.js';
import albumMediaRoutes from './routes/albumMedia.route.js'
import challengeRoutes from './routes/challenges.route.js';
import likeRoutes from './routes/like.route.js';
import s3TestRoute from './routes/s3Test.route.js';
import userRoutes from './routes/userRoutes.js';
import profilePictureRoutes from './routes/profilePicture.route.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const __dirname = path.resolve();


app.use(cors({ origin: "https://e7ea99a1-f3aa-439b-97db-82d9e87187ed-00-1etsckkyhp4f3.spock.replit.dev:5173", credentials: true }));

app.use(express.json()); // allows us to parse incoming requests:req.body
app.use(cookieParser()); // allows us to parse incoming cookies
app.get('/', (req, res) => {
	res.send('Welcome to my backend API server!');
  });
app.use("/api/auth", authRoutes);
app.use("/api/settings", settingsRoutes);
// Serve static files from the uploads directory
app.use('/api/s3-test', s3TestRoute);



// Use the upload route
app.use('/api/profile-picture', profilePictureRoutes);
app.use('/api/album-media', albumMediaRoutes);
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Use the challenges route
app.use('/challenges', challengeRoutes);

// Apply your like route
app.use('/api', likeRoutes);
app.use('/api/user', userRoutes);


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

