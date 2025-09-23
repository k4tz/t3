/**
 * @description: Define general app config variables
 * 
 * @defaults port: 5000
 */

const resolvedPort = process.env.PORT
    ? parseInt(process.env.PORT, 10)
    : process.env.APP_PORT
    ? parseInt(process.env.APP_PORT, 10)
    : 5000;

const appConfig = {
    port: resolvedPort,
    matchAutoCloseTimer: process.env.MATCH_AUTO_CLOSE_TIMER ? parseInt(process.env.MATCH_AUTO_CLOSE_TIMER, 10) : 300, // 5 minutes for cleanup
} as const;

export default appConfig;