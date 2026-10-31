import {Conversation} from '../model/conversation.model.js';
import {ConversationMessage} from '../model/conversation-message.model.js';

export async function getConversationForParticipant(id, participant) {
    return Conversation.findOne({_id: id, participants: participant});
}

export async function createConversation(originalMessage, participants) {
    return Conversation.findOneAndUpdate(
        {originalMessage},
        {$setOnInsert: {originalMessage, participants}},
        {upsert: true, returnDocument: 'after', runValidators: true}
    );
}

export async function getConversationsForParticipant(participant) {
    return Conversation.find({participants: participant})
        .populate('participants', 'name')
        .populate('originalMessage', 'content createdAt')
        .sort({updatedAt: -1});
}

export async function createConversationMessage(data) {
    const message = await ConversationMessage.create(data);
    await Conversation.updateOne({_id: data.conversation}, {$set: {updatedAt: new Date()}});
    return message;
}

export async function getConversationMessages(conversation, limit) {
    return ConversationMessage.find({conversation})
        .populate('sender', 'name')
        .sort({createdAt: -1})
        .limit(limit);
}
