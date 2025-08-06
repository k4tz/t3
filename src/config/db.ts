/**
 * @description: Define database config variables
 */

const dbConfig = {
    url: process.env.DATABASE_CONN_URL,
} as const;

export default dbConfig;