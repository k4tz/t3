/**
 * @description: Define cors config variables
 */

const corsConfig = {
    allowed_origins: process.env.ALLOWED_ORIGINS || "http://localhost:3000",
    allowed_methods: process.env.ALLOWED_METHODS || ["GET", "POST", "PUT", "DELETE"],
    allowed_headers: process.env.ALLOWED_HEADERS || ["Content-Type", "Authorization", "Origin"],
    credentials: process.env.CREDENTIALS || true,
    max_age: process.env.MAX_AGE || 1800,
    preflight_continue: process.env.PREFLIGHT_CONTINUE || false,
    options_success_status: process.env.OPTIONS_SUCCESS_STATUS || 204
};

export default corsConfig;
