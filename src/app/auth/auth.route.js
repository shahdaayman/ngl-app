import {Router} from 'express';
import * as authController from "./controller/auth.controller.js";
import {authenticate} from '../../common/middleware/auth.middleware.js';

const authRouter = Router();


authRouter.post('/register', authController.register);
authRouter.post('/send-otp', authController.sendOTP);
authRouter.patch('/verify-account', authController.verifyAccount);
authRouter.post('/login', authController.login);
authRouter.post('/logout', authenticate, authController.logout);
authRouter.post('/password-reset/send-otp', authController.sendPasswordResetOTP);
authRouter.post('/password-reset', authController.resetPassword);

export default authRouter;
