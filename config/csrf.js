const csrfConfig = {
    /**
     * Base settings for the CSRF token
     */
    cookieName: 't3_csrf_token',
    tokenLength: 32,

    /**
     * Middleware options
     */
    exludePaths: [],
    ignoreMethods: ['GET', 'HEAD', 'OPTIONS'],
    
    /**
     * Cookie options
     */
    cookieOptions: {
        httpOnly: false,
        sameSite: 'Lax',
        secure: true,
    },

    /**
     * Header options
     */
    headerName: 'X-T3-CSRF',
};

export default csrfConfig;
