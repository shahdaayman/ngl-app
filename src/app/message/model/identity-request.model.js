import {model, Schema} from 'mongoose';

const identityRequestSchema = new Schema(
    {
        message: {type: Schema.Types.ObjectId, ref: 'Message', required: true},
        requester: {type: Schema.Types.ObjectId, ref: 'User', required: true},
        sender: {type: Schema.Types.ObjectId, ref: 'User', required: true},
        status: {
            type: String,
            enum: ['pending', 'accepted', 'rejected'],
            default: 'pending',
            required: true
        }
    },
    {timestamps: true}
);

identityRequestSchema.index({message: 1, requester: 1}, {unique: true});
identityRequestSchema.index({sender: 1, status: 1, createdAt: -1});

export const IdentityRequest = model('IdentityRequest', identityRequestSchema);
