const userModel = require("../models/user.model");
const jwt = require("jsonwebtoken");


async function authMiddleware(req, res, next) {
    
        const token = req.cookies.token || req.headers.authorization?.split(" ")[1];
    
        if (!token) {
            return res.status(401).json({
                message: "Access denied. No token provided.",
                status: "failed"
            });
        }
    
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
            const user = await userModel.findById(decoded.userID);
    
            if (!user) {
                return res.status(401).json({
                    message: "Access denied. User not found.",
                    status: "failed"
                });
            }
    
            req.user = user;
            next();
        } catch (error) {
            return res.status(400).json({
                message: "Invalid token.",
                status: "failed"
            });
        }
    }

module.exports = {
    authMiddleware
}
