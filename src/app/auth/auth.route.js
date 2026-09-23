import {Router} from 'express';
import * as authController from "./controller/auth.controller.js";
import {verifyAccount} from "./controller/auth.controller.js";

const authRouter = Router();


authRouter.post('/register', authController.register);
authRouter.post('/send-otp', authController.sendOTP);
authRouter.patch('/verify-account', authController.verifyAccount);
authRouter.post('/login', authController.login);

export default authRouter;
