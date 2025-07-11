import express, {Request, Response} from "express";
import authenticateToken from "../../middleware/authenticateToken.ts";
import authService from "../../tictactoe/http/authService.ts";
import asyncHandler from "express-async-handler";

const authRouter = express.Router();

authRouter.post("/register", asyncHandler(async (req: Request, res: Response) => {
    
    if(!req.body?.username || !req.body?.password) {
        throw new HttpError("Username and password are required.", 400);
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

        res.status(201).json(user);
    }catch(err: any){
        let code = err.status;
        let message = err.message;
        if(err.code === 11000){
            code = 409;
            message = "User already exists.";
        }
        res.status(500).json({
            error: "Something went wrong."
        });
    }
}));

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

        res.status(200).json({});
        return;
    }catch(err: any){
        res.status(err.status).json({
            error: err.message
        });
        return;
    }
});

authRouter.post('/logout', (req, res) => {
    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');
    res.status(200).json({});
});

authRouter.post("/refresh", async (req, res, next) => {
    const refreshToken = req.cookies?.refreshToken;
    
    if(!refreshToken) {
        res.status(400).json({
            error: "Refresh token is required."
        });
        return;
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

        res.status(200).json({});
        return;
    }catch(err: any) {
        next(err);
    }
});

authRouter.get("/me", authenticateToken, (req, res) => {
    res.status(200).json(req.user);
});

export default authRouter