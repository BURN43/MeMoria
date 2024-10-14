import jwt from "jsonwebtoken";

export const generateTokenAndSetCookie = (res, userId) => {
	const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
		expiresIn: "7d",
	});

	res.cookie("token", token, {
		httpOnly: true,
		secure: process.env.NODE_ENV === "production", // Nur über HTTPS in Produktion
		sameSite: "None",                               // Ermöglicht Cross-Site-Cookies
		maxAge: 7 * 24 * 60 * 60 * 1000,               // Ablaufzeit auf 7 Tage gesetzt
	});

	return token;
};
