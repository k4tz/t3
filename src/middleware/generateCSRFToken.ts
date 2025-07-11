import crypto from 'crypto';
import csrfConfig from '../config/csrf.ts'; 
import Express from 'express';

function generateCsrfToken(req: Express.Request, res: Express.Response, next: Express.NextFunction) {
    const cookieName = csrfConfig.cookieName.toLowerCase();
    const token = req.cookies[cookieName];

    if (!token) {
        const newToken = crypto.randomBytes(csrfConfig.tokenLength).toString('hex');
        res.cookie(cookieName, newToken, csrfConfig.cookieOptions);
    }

    next();
}

export default generateCsrfToken;
