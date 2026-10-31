import {Message} from '../model/message.model.js';

export async function createMessage(messageData) {
    return Message.create(messageData);
}

export async function getMessageById(id) {
    return Message.findOne({_id: id, isDeleted: false});
}

export async function getReceivedMessages(receiver) {
    return Message.find({receiver, isDeleted: false})
        .populate('sender', 'name')
        .sort({createdAt: -1});
}

export async function getPublicMessages(receiver) {
    return Message.find({receiver, visibility: 'public', isDeleted: false})
        .sort({createdAt: -1})
        .select('content createdAt');
}

export async function deleteReceivedMessage(id, receiver) {
    return Message.findOneAndUpdate(
        {_id: id, receiver, isDeleted: false},
        {isDeleted: true},
        {returnDocument: 'after'}
    );
}
