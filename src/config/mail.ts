/**
 * @description: Define cors config variables
 */

const mailConfig = {
    host: process.env.MAIL_HOST,
    port: process.env.MAIL_PORT ? parseInt(process.env.MAIL_PORT, 10) : null,
    secure: process.env.MAIL_SECURE === "true" || false,
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
    fromName: process.env.MAIL_FROM_NAME,
    fromEmail: process.env.MAIL_FROM_EMAIL
} as const;

export default mailConfig;