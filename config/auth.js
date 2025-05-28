/**
 * @description: Define config settings by reading them from env and if env isn't set, we use a default value.
 * Defining the default values here makes it easier to change the default values in one place.
 * 
 * This particular file is used for auth related to config variables
 */

const authConfig = {
    access_token_secret: process.env.access_token_secret || "secret",
    refresh_token_secret: process.env.refresh_token_secret || "refresh_secret",
    access_token_expires_in: process.env.access_token_expires_in || "1h",
    refresh_token_expires_in: process.env.refresh_token_expires_in || "1d"
};

export default authConfig;

