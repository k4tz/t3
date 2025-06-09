const authenticateToken = async (req, res, next) => {
    const token = req.cookies?.accessToken;
    if (!token) {
        return res.status(401).json({ error: 'Unauthorized.' });
    }

    try {
        const verified = await utils.auth.verifyTokenAsync(token, process.env.ACCESS_TOKEN_SECRET);
        req.user = verified;
        next();
    } catch (err) {
        res.status(401).json({ error: 'Invalid token.' });
    }
};

export default authenticateToken;