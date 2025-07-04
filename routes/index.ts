import express from 'express';

import authRouter from './auth.routes.ts';

const router = express.Router();

router.use('/', authRouter);

export default router;
