import jwt from "jsonwebtoken";

export const generateTokenAndSetCookies = (res, userId) => {
    const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
        expiresIn: "7d",
    });

    res.cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "none" : "lax", // "none" allows cross-site cookies
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        path: "/",
        // Don't set domain for cross-origin cookies to work
    });

    return token;
}