/**
 * @description: Define general app config variables
 * 
 * @defaults port: 5000
 */

const appConfig = {
    port: process.env.APP_PORT ? parseInt(process.env.APP_PORT, 10) : 5000,
} as const;

export default appConfig;