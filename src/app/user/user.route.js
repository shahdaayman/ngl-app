import {Router} from 'express';
import * as userController from './controller/user.controller.js';
import {authenticate} from '../../common/middleware/auth.middleware.js';

const userRouter = Router();

userRouter.get('/me', authenticate, userController.getMyProfile);
userRouter.patch('/me', authenticate, userController.updateMyProfile);
userRouter.delete('/me', authenticate, userController.deleteMyProfile);
userRouter.get('/:userId', userController.getProfile);

export default userRouter;
