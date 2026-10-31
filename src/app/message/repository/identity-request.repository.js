import {IdentityRequest} from '../model/identity-request.model.js';

export async function findIdentityRequest(message, requester) {
    return IdentityRequest.findOne({message, requester});
}

export async function getIdentityRequestForSender(id, sender) {
    return IdentityRequest.findOne({_id: id, sender});
}

export async function createIdentityRequest(data) {
    return IdentityRequest.create(data);
}

export async function reopenIdentityRequest(id) {
    return IdentityRequest.findByIdAndUpdate(
        id,
        {status: 'pending'},
        {returnDocument: 'after', runValidators: true}
    );
}

export async function getRequestsForSender(sender) {
    return IdentityRequest.find({sender})
        .populate('requester', 'name')
        .populate('message', 'content createdAt visibility')
        .sort({createdAt: -1});
}

export async function getAcceptedRequestsForRecipient(requester, messageIds) {
    return IdentityRequest.find({
        requester,
        message: {$in: messageIds},
        status: 'accepted'
    }).select('message');
}

export async function updateRequestStatus(id, sender, status) {
    return IdentityRequest.findOneAndUpdate(
        {_id: id, sender, status: 'pending'},
        {status},
        {returnDocument: 'after', runValidators: true}
    );
}

export async function revertAcceptedRequest(id, sender) {
    return IdentityRequest.findOneAndUpdate(
        {_id: id, sender, status: 'accepted'},
        {status: 'pending'},
        {returnDocument: 'after', runValidators: true}
    );
}
