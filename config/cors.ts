/**
 * @description: Define cors config variables
 */

const corsConfig = {
    origin: process.env.ALLOWED_ORIGINS?.split(',') || ["http://localhost:3000"],
    methods: process.env.ALLOWED_METHODS?.split(',') || ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: process.env.ALLOWED_HEADERS?.split(',') || ["Content-Type", "Authorization", "Origin", "X-T3-CSRF"],
    credentials: process.env.CREDENTIALS === "true" || true, // ensure it's a boolean
    maxAge: process.env.MAX_AGE ? parseInt(process.env.MAX_AGE, 10) : 1800,
    preflightContinue: process.env.PREFLIGHT_CONTINUE === "true" || false,
    optionsSuccessStatus: process.env.OPTIONS_SUCCESS_STATUS ? parseInt(process.env.OPTIONS_SUCCESS_STATUS, 10) : 204
} as const;

export default corsConfig;
