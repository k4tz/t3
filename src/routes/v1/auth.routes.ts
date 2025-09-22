import express, {Request, Response} from "express";
import authenticateToken from "../../middleware/authenticateToken.ts";
import authService from "../../tictactoe/http/authService.ts";
import asyncHandler from "express-async-handler";
import HttpError from "../../errors/HttpError.ts";
import User from "../../db/models/User.ts";
import { calculateRank } from "../../tictactoe/utils/rank.ts";
import cookieConfig from "../../config/cookies.ts";

const authRouter = express.Router();

authRouter.post("/register", asyncHandler(async (req: Request, res: Response) => {
    
    if(!req.body?.username || !req.body?.password) {
        throw new HttpError("Username and password are required.", 400);
    }

    const user = await authService.register(req.body);

    const [accessToken, refreshToken] = await authService.login(req.body);

    //set cookie with refresh and access tokens
    res.cookie('accessToken', accessToken, cookieConfig.accessToken());
    res.cookie('refreshToken', refreshToken, cookieConfig.refreshToken());

    res.status(201).json(user);
    
    return;
}));

authRouter.post("/login", asyncHandler(async (req: Request, res: Response) => {

    if(!req.body?.username || !req.body?.password) {
        throw new HttpError("Username and password are required.", 400);
    }

    const [accessToken, refreshToken] = await authService.login(req.body);

    //set cookie with refresh and access tokens
    res.cookie('accessToken', accessToken, cookieConfig.accessToken());
    res.cookie('refreshToken', refreshToken, cookieConfig.refreshToken());

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
    res.cookie('accessToken', accessToken, cookieConfig.accessToken());
    res.cookie('refreshToken', refToken, cookieConfig.refreshToken());

    res.status(200).json({});
}));

authRouter.get("/me", authenticateToken, asyncHandler(async (req: Request, res: Response) => {
    // Load fresh stats from DB to ensure wins/losses/draws/totalMatches are up to date
    const dbUser = await User.findById(req.user.id)
        .select("username wins losses draws totalMatches totalStars")
        .lean();

    if (!dbUser) {
        throw new HttpError("User not found", 404);
    }

    res.status(200).json({
        id: req.user.id,
        username: dbUser.username,
        wins: dbUser.wins ?? 0,
        losses: dbUser.losses ?? 0,
        draws: dbUser.draws ?? 0,
        totalMatches: dbUser.totalMatches ?? 0,
        totalStars: dbUser.totalStars ?? 0,
    });
}));

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

authRouter.get("/leaderboard", asyncHandler(async (req: Request, res: Response) => {
    try {
        // Fetch top 10 players by wins (which determines rank)
        const topPlayers = await User.find({})
            .sort({ totalStars: -1, wins: -1, losses: 1 }) // Sort primarily by stars, then wins
            .limit(10)
            .select('username wins losses draws totalMatches totalStars')
            .lean();

        // Calculate rank information for each player
        const leaderboard = topPlayers.map((player, index) => {
            const rankInfo = calculateRank(player.totalStars);
            return {
                rank: index + 1,
                username: player.username,
                wins: player.wins,
                losses: player.losses,
                draws: player.draws,
                totalMatches: player.totalMatches,
                tier: rankInfo.tier,
                displayText: rankInfo.displayText,
                progress: rankInfo.progress,
                winRate: player.totalMatches > 0 ? Math.round((player.wins / player.totalMatches) * 100) : 0,
                totalStars: player.totalStars ?? 0
            };
        });

        res.status(200).json({
            success: true,
            leaderboard
        });

    } catch (error) {
        console.error('Error fetching leaderboard:', error);
        throw new HttpError('Failed to fetch leaderboard', 500);
    }
}));

export default authRouter