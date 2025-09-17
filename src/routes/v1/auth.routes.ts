import express, {Request, Response} from "express";
import authenticateToken from "../../middleware/authenticateToken.ts";
import authService from "../../tictactoe/http/authService.ts";
import asyncHandler from "express-async-handler";
import HttpError from "../../errors/HttpError.ts";

const authRouter = express.Router();

authRouter.post("/register", asyncHandler(async (req: Request, res: Response) => {
    
    if(!req.body?.username || !req.body?.password) {
        throw new HttpError("Username and password are required.", 400);
    }

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
    
    return;
}));

authRouter.post("/login", asyncHandler(async (req: Request, res: Response) => {

    if(!req.body?.username || !req.body?.password) {
        throw new HttpError("Username and password are required.", 400);
    }

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
}));

authRouter.post('/logout', (req, res) => {
    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');
    res.status(200).json({});
});

authRouter.post("/refresh", asyncHandler(async (req: Request, res: Response) => {
    const refreshToken = req.cookies?.refreshToken;
    
    if(!refreshToken) {
        throw new HttpError("Refresh token is required.", 400);
    }

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
}));

authRouter.get("/me", authenticateToken, (req, res) => {
    res.status(200).json(req.user);
});

authRouter.post("/change-password", authenticateToken, asyncHandler(async (req: Request, res: Response) => {
    const { currentPassword, newPassword } = req.body;
    
    if (!currentPassword || !newPassword) {
        throw new HttpError("Current password and new password are required.", 400);
    }

    if (newPassword.length < 6) {
        throw new HttpError("New password must be at least 6 characters long.", 400);
    }

    const result = await authService.changePassword(req.user.id, currentPassword, newPassword);
    res.status(200).json(result);
}));

export default authRouter