import crypto from 'crypto';
import csrfConfig from '../config/csrf.js'; 

function generateCsrfToken(req, res, next) {
    const cookieName = csrfConfig.cookieName.toLowerCase();
    const token = req.cookies[cookieName];

    if (!token) {
        const newToken = crypto.randomBytes(csrfConfig.tokenLength).toString('hex');
        res.cookie(cookieName, newToken, csrfConfig.cookieOptions);
    }

    next();
}

export default generateCsrfToken;
