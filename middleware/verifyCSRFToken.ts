import csrfConfig from "../config/csrf.ts";
import {Request, Response, NextFunction} from 'express';

function verifyCsrfToken(req: Request, res: Response, next: NextFunction) {
    /**
     * Handle for exclusion of methods and paths
     */
    if (
        !csrfConfig.ignoreMethods.includes(req.method) &&
        !csrfConfig.exludePaths.includes(req.path)
    ) {
        const tokenFromCookie = req.cookies[csrfConfig.cookieName.toLowerCase()];
        const tokenFromHeader = req.headers[csrfConfig.headerName.toLowerCase()];

        if (!tokenFromCookie || !tokenFromHeader || tokenFromCookie !== tokenFromHeader) {
            res.status(403).json({ message: 'Invalid CSRF token' });
            return;
        }
    }
    
    next();
}

export default verifyCsrfToken;
