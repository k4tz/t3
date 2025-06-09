/**
 * @description: Define auth config variables
 */

const authConfig = {
    access_token_secret: process.env.access_token_secret || "secret",
    refresh_token_secret: process.env.refresh_token_secret || "refresh_secret",
    access_token_expires_in: process.env.access_token_expires_in || "1h",
    refresh_token_expires_in: process.env.refresh_token_expires_in || "1d"
};

export default authConfig;

