import Express from 'express';
import authConfig from '../config/auth.ts';

const authenticateToken = async (req: Express.Request, res: Express.Response, next: Express.NextFunction) => {
    const token = req.cookies?.accessToken;
    if (!token) {
        res.status(401).json({ error: 'Unauthorized.' });
        return;
    }
    try {
        req.user = await utils.auth.verifyTokenAsync(token, authConfig.access_token_secret);
        next();
    } catch (err) {
        res.status(401).json({ error: 'Invalid token.' });
    }
};

export default authenticateToken;