import express from 'express';
import authRouter from './app/auth/auth.route.js';
import messageRouter from './app/message/message.route.js';
import userRouter from './app/user/user.route.js';

const app = express();

app.use(express.json());
app.use('/auth', authRouter);
app.use('/user', userRouter);
app.use('/message', messageRouter);

app.use((error, req, res, next) => {
    if (res.headersSent) return next(error);

    const validationError = error.name === 'ValidationError' || error.name === 'CastError';
    const status = error.code === 11000 ? 409 : validationError ? 400 : (error.status || 500);
    if (status >= 500) console.error(error);

    res.status(status).json({
        success: false,
        message: error.code === 11000
            ? 'User Already Exist.'
            : status >= 500 && !error.status ? 'Internal server error.' : error.message,
    });
});

export default app;
