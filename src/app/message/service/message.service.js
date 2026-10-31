import * as authRepository from '../../auth/repository/auth.repository.js';
import * as messageRepository from '../repository/message.repository.js';
import * as requestRepository from '../repository/identity-request.repository.js';
import * as conversationRepository from '../repository/conversation.repository.js';

function badRequest(message) {
    return Object.assign(new Error(message), {status: 400});
}

function notFound(message) {
    return Object.assign(new Error(message), {status: 404});
}

function conflict(message) {
    return Object.assign(new Error(message), {status: 409});
}

export async function sendMessage(senderId, receiverId, content, visibility = 'anonymous') {
    if (typeof content !== 'string' || content.trim().length < 1 || content.trim().length > 200) {
        throw badRequest('Message content must be between 1 and 200 characters.');
    }
    if (!['anonymous', 'public'].includes(visibility)) {
        throw badRequest('Visibility must be anonymous or public.');
    }
    const receiver = await authRepository.getActiveVerifiedUserById(receiverId);
    if (!receiver) throw notFound('Recipient not found.');
    if (receiver._id.equals(senderId)) throw badRequest('You cannot send a message to yourself.');

    return messageRepository.createMessage({
        sender: senderId,
        receiver: receiver._id,
        content: content.trim(),
        visibility
    });
}

export async function getInbox(receiverId) {
    const messages = await messageRepository.getReceivedMessages(receiverId);
    const acceptedRequests = await requestRepository.getAcceptedRequestsForRecipient(
        receiverId,
        messages.map((message) => message._id)
    );
    const revealedMessageIds = new Set(acceptedRequests.map((request) => String(request.message)));

    return messages.map((message) => {
        const result = message.toObject();
        if (result.visibility === 'anonymous' && !revealedMessageIds.has(String(result._id))) {
            delete result.sender;
        }
        return result;
    });
}

export async function getMessage(messageId, receiverId) {
    const message = await messageRepository.getMessageById(messageId);
    if (!message || !message.receiver.equals(receiverId)) throw notFound('Message not found.');
    let identityRevealed = message.visibility === 'public';
    if (!identityRevealed) {
        const identityRequest = await requestRepository.findIdentityRequest(messageId, receiverId);
        identityRevealed = identityRequest?.status === 'accepted';
    }
    if (identityRevealed) await message.populate('sender', 'name');
    const result = message.toObject();
    if (!identityRevealed) delete result.sender;
    return result;
}

export async function deleteMessage(messageId, receiverId) {
    const message = await messageRepository.deleteReceivedMessage(messageId, receiverId);
    if (!message) throw notFound('Message not found.');
    return {deleted: true};
}

export async function requestSenderIdentity(messageId, requesterId) {
    const message = await messageRepository.getMessageById(messageId);
    if (!message || !message.receiver.equals(requesterId)) throw notFound('Message not found.');
    if (message.visibility === 'public') throw conflict('The sender identity is already public.');

    const existing = await requestRepository.findIdentityRequest(messageId, requesterId);
    if (!existing) {
        return requestRepository.createIdentityRequest({
            message: message._id,
            requester: requesterId,
            sender: message.sender
        });
    }
    if (existing.status !== 'rejected') {
        throw conflict('An identity request already exists for this message.');
    }
    return requestRepository.reopenIdentityRequest(existing._id);
}

export async function getIdentityRequests(senderId) {
    return requestRepository.getRequestsForSender(senderId);
}

export async function respondToIdentityRequest(requestId, senderId, status) {
    if (!['accepted', 'rejected'].includes(status)) {
        throw badRequest('Status must be accepted or rejected.');
    }
    const identityRequest = await requestRepository.getIdentityRequestForSender(requestId, senderId);
    if (!identityRequest) throw notFound('Identity request not found.');
    if (identityRequest.status !== 'pending') {
        throw conflict('This identity request has already been resolved.');
    }

    const updatedRequest = await requestRepository.updateRequestStatus(requestId, senderId, status);
    if (!updatedRequest) throw conflict('This identity request has already been resolved.');
    let conversation = null;
    if (status === 'accepted') {
        try {
            conversation = await conversationRepository.createConversation(
                identityRequest.message,
                [identityRequest.sender, identityRequest.requester]
            );
        } catch (error) {
            await requestRepository.revertAcceptedRequest(requestId, senderId);
            throw error;
        }
    }
    return {request: updatedRequest, conversation};
}

export async function getConversations(userId) {
    return conversationRepository.getConversationsForParticipant(userId);
}

export async function sendConversationMessage(conversationId, senderId, content) {
    if (typeof content !== 'string' || content.trim().length < 1 || content.trim().length > 2000) {
        throw badRequest('Message content must be between 1 and 2000 characters.');
    }
    const authorizedConversation = await conversationRepository.getConversationForParticipant(
        conversationId,
        senderId
    );
    if (!authorizedConversation) throw notFound('Conversation not found.');

    return conversationRepository.createConversationMessage({
        conversation: authorizedConversation._id,
        sender: senderId,
        content: content.trim()
    });
}

export async function getConversationMessages(conversationId, userId, requestedLimit) {
    const limit = requestedLimit === undefined ? 100 : Number(requestedLimit);
    if (!Number.isInteger(limit) || limit < 1 || limit > 100) {
        throw badRequest('Limit must be an integer between 1 and 100.');
    }
    const conversation = await conversationRepository.getConversationForParticipant(conversationId, userId);
    if (!conversation) throw notFound('Conversation not found.');
    const messages = await conversationRepository.getConversationMessages(conversation._id, limit);
    return messages.reverse();
}