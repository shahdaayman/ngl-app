import {Router} from 'express';
import * as messageController from './controller/message.controller.js';
import {authenticate} from '../../common/middleware/auth.middleware.js';

const messageRouter = Router();

messageRouter.use(authenticate);
messageRouter.post('/to/:receiverId', messageController.sendMessage);
messageRouter.get('/inbox', messageController.getInbox);
messageRouter.get('/identity-requests', messageController.getIdentityRequests);
messageRouter.patch('/identity-requests/:requestId', messageController.respondToIdentityRequest);
messageRouter.get('/conversations', messageController.getConversations);
messageRouter.post('/conversations/:conversationId/messages', messageController.sendConversationMessage);
messageRouter.get('/conversations/:conversationId/messages', messageController.getConversationMessages);
messageRouter.post('/:messageId/identity-requests', messageController.requestSenderIdentity);
messageRouter.get('/:messageId', messageController.getMessage);
messageRouter.delete('/:messageId', messageController.deleteMessage);

export default messageRouter;
