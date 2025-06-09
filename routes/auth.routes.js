import express from "express";
import authenticateToken from "../middleware/authenticateToken.js";
import authService from "../tictactoe/http/authService.js";

const authRouter = express.Router();

authRouter.post("/register", async (req, res) => {
    
    if(!req.body?.username || !req.body?.password) {
        res.status(400).json({
            error: "Username and password are required."
        });

        return;
    }

    try {
        const user = await authService.register(req.body);

        const [accessToken, refreshToken] = await authService.login(req.body);

        //set cookie with refresh and access tokens
        res.cookie('accessToken', accessToken, {
            httpOnly: true, 
            // secure: true, 
            sameSite: 'lax', // Prevent CSRF
            maxAge: 15 * 60 * 1000 
        });
        res.cookie('refreshToken', refreshToken, {
            httpOnly: true, 
            // secure: true, 
            sameSite: 'lax', // Prevent CSRF
            maxAge: 24 * 60 * 60 * 1000 
        });

        return res.status(201).json(user);
    }catch(err){
        if(err.code === 11000){
            return res.status(400).json({
                error: "Username already exists."
            });
        }
        return res.status(500).json({
            error: "Something went wrong."
        });
    }
});

authRouter.post("/login", async (req, res) => {

    if(!req.body?.username || !req.body?.password) {
        res.status(400).json({
            error: "Username and password are required."
        });

        return;
    }

    try {
        const [accessToken, refreshToken] = await authService.login(req.body);

        //set cookie with refresh and access tokens
        res.cookie('accessToken', accessToken, {
            httpOnly: true, 
            // secure: true, 
            // sameSite: 'Strict', // Prevent CSRF
            maxAge: 15 * 60 * 1000 // Set expiration time (15 minutes)
        });
        res.cookie('refreshToken', refreshToken, {
            httpOnly: true, 
            // secure: true, 
            // sameSite: 'Strict', // Prevent CSRF
            maxAge: 24 * 60 * 60 * 1000 // Set expiration time (1 Day)
        });

        return res.status(200).json({});
    }catch(err){
        return res.status(err.status).json({
            error: err.message
        });
    }
});

authRouter.post('/logout', (req, res) => {
    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');
    res.status(200).json({});
});

authRouter.post("/refresh", async (req, res) => {

    const refreshToken = req.cookies?.refreshToken;
    
    if(!refreshToken) {
        return res.status(400).json({
            error: "Refresh token is required."
        });
    }

    try {
        const [accessToken, refToken] = await authService.refreshToken(refreshToken);

        //set cookie with refresh and access tokens
        res.cookie('accessToken', accessToken, {
            httpOnly: true, 
            // secure: true, 
            // sameSite: 'Strict', // Prevent CSRF
            maxAge: 15 * 60 * 1000 // Set expiration time (15 minutes)
        });
        res.cookie('refreshToken', refToken, {
            httpOnly: true, 
            // secure: true, 
            // sameSite: 'Strict', // Prevent CSRF
            maxAge: 24 * 60 * 60 * 1000 // Set expiration time (1 Day)
        });

        return res.status(200).json({});
    }catch(err) {
        return res.status(err.status).json({
            error: err.message
        });
    }
});

authRouter.get("/me", authenticateToken, (req, res) => {
    res.status(200).json(req.user);
});

export default authRouter