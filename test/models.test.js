import test from 'node:test';
import assert from 'node:assert/strict';
import {Types} from 'mongoose';
import {Conversation} from '../src/app/message/model/conversation.model.js';
import {ConversationMessage} from '../src/app/message/model/conversation-message.model.js';
import {IdentityRequest} from '../src/app/message/model/identity-request.model.js';
import {Message} from '../src/app/message/model/message.model.js';

const firstUser = new Types.ObjectId();
const secondUser = new Types.ObjectId();
const messageId = new Types.ObjectId();
const conversationId = new Types.ObjectId();

test('message requires a recipient, sender, and valid visibility', async () => {
    const message = new Message({
        content: 'hello',
        receiver: firstUser,
        sender: secondUser,
        visibility: 'anonymous'
    });
    await assert.doesNotReject(message.validate());

    message.visibility = 'private';
    await assert.rejects(message.validate());
});

test('identity requests only support pending, accepted, and rejected states', async () => {
    const request = new IdentityRequest({
        message: messageId,
        requester: firstUser,
        sender: secondUser,
        status: 'pending'
    });
    await assert.doesNotReject(request.validate());

    request.status = 'ignored';
    await assert.rejects(request.validate());
});

test('conversations require exactly two participants', async () => {
    const conversation = new Conversation({
        originalMessage: messageId,
        participants: [firstUser, secondUser]
    });
    await assert.doesNotReject(conversation.validate());

    conversation.participants = [firstUser];
    await assert.rejects(conversation.validate());
});

test('conversation messages enforce the content limit', async () => {
    const message = new ConversationMessage({
        conversation: conversationId,
        sender: firstUser,
        content: 'hello'
    });
    await assert.doesNotReject(message.validate());

    message.content = 'x'.repeat(2001);
    await assert.rejects(message.validate());
});
