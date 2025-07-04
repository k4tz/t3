import {Request, Response} from 'express';
import authConfig from '../config/auth.ts';

const authenticateToken = async (req: Request, res: Response, next) => {
    const token = req.cookies?.accessToken;
    if (!token) {
        return res.status(401).json({ error: 'Unauthorized.' });
    }

    try {
        req.user = await utils.auth.verifyTokenAsync(token, authConfig.access_token_secret);
        next();
    } catch (err) {
        res.status(401).json({ error: 'Invalid token.' });
    }
};

export default authenticateToken;