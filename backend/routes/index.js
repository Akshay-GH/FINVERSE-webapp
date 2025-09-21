import express from 'express';
import userRouter from './user.js';
import accountRouter from './accounts.js';

const router = express.Router();

router.use('/users', userRouter);
router.use('/accounts', accountRouter);

export default router;