import * as messageService from '../service/message.service.js';

export async function sendMessage(req, res, next) {
    try {
        const data = await messageService.sendMessage(
            req.user._id,
            req.params.receiverId,
            req.body?.content,
            req.body?.visibility
        );
        res.status(201).json({success: true, data});
    } catch (error) {
        next(error);
    }
}

export async function getInbox(req, res, next) {
    try {
        const data = await messageService.getInbox(req.user._id);
        res.json({success: true, data});
    } catch (error) {
        next(error);
    }
}

export async function getMessage(req, res, next) {
    try {
        const data = await messageService.getMessage(req.params.messageId, req.user._id);
        res.json({success: true, data});
    } catch (error) {
        next(error);
    }
}

export async function deleteMessage(req, res, next) {
    try {
        const data = await messageService.deleteMessage(req.params.messageId, req.user._id);
        res.json({success: true, data});
    } catch (error) {
        next(error);
    }
}

export async function requestSenderIdentity(req, res, next) {
    try {
        const data = await messageService.requestSenderIdentity(req.params.messageId, req.user._id);
        res.status(201).json({success: true, data});
    } catch (error) {
        next(error);
    }
}

export async function getIdentityRequests(req, res, next) {
    try {
        const data = await messageService.getIdentityRequests(req.user._id);
        res.json({success: true, data});
    } catch (error) {
        next(error);
    }
}

export async function respondToIdentityRequest(req, res, next) {
    try {
        const data = await messageService.respondToIdentityRequest(
            req.params.requestId,
            req.user._id,
            req.body?.status
        );
        res.json({success: true, data});
    } catch (error) {
        next(error);
    }
}

export async function getConversations(req, res, next) {
    try {
        const data = await messageService.getConversations(req.user._id);
        res.json({success: true, data});
    } catch (error) {
        next(error);
    }
}

export async function sendConversationMessage(req, res, next) {
    try {
        const data = await messageService.sendConversationMessage(
            req.params.conversationId,
            req.user._id,
            req.body?.content
        );
        res.status(201).json({success: true, data});
    } catch (error) {
        next(error);
    }
}

export async function getConversationMessages(req, res, next) {
    try {
        const data = await messageService.getConversationMessages(
            req.params.conversationId,
            req.user._id,
            req.query.limit
        );
        res.json({success: true, data});
    } catch (error) {
        next(error);
    }
}