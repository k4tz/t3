interface CSRFConfig {
    readonly cookieName: string;
    readonly tokenLength: number;
    readonly exludePaths: string[];
    readonly ignoreMethods: string[];
    readonly cookieOptions: {
        httpOnly: boolean;
        sameSite: 'lax' | 'strict' | 'none';
        secure: boolean;
    };
    readonly headerName: string;
};

const csrfConfig: CSRFConfig = {
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
        sameSite: 'lax',
        secure: true,
    },

    /**
     * Header options
     */
    headerName: 'X-T3-CSRF',
};

export default csrfConfig;
