/**
 * @description: Define auth config variables
 */

const authConfig = {
    access_token_secret: () => process.env.ACCESS_TOKEN_SECRET || "secret",
    refresh_token_secret: () => process.env.REFRESH_TOKEN_SECRET || "refresh_secret",
    access_token_expires_in: () => process.env.access_token_expires_in || "1d",
    refresh_token_expires_in: () => process.env.refresh_token_expires_in || "30d"
} as const;

export default authConfig;

