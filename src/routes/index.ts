import authRouter from './v1/auth.routes.ts';
import express from 'express';

export default function setupRouter(app: express.Express) {
    app.use("/v1", authRouter);
}