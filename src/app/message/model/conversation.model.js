import {model, Schema} from 'mongoose';

const conversationSchema = new Schema(
    {
        originalMessage: {type: Schema.Types.ObjectId, ref: 'Message', required: true, unique: true},
        participants: {
            type: [{type: Schema.Types.ObjectId, ref: 'User'}],
            required: true,
            validate: {
                validator: (participants) => participants.length === 2,
                message: 'A conversation must have exactly two participants.'
            }
        }
    },
    {timestamps: true}
);

conversationSchema.index({participants: 1, updatedAt: -1});

export const Conversation = model('Conversation', conversationSchema);
