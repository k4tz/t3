import csrfConfig from "../config/csrf.js";

function verifyCsrfToken(req, res, next) {
    if (csrfConfig.ignoreMethods.includes(req.method)) {
        return next();
    }

    const tokenFromCookie = req.cookies[csrfConfig.cookieName.toLowerCase()];
    const tokenFromHeader = req.headers[csrfConfig.headerName.toLowerCase()];

    if (!tokenFromCookie || !tokenFromHeader || tokenFromCookie !== tokenFromHeader) {
        return res.status(403).json({ message: 'Invalid CSRF token' });
    }

    next();
}

export default verifyCsrfToken;
