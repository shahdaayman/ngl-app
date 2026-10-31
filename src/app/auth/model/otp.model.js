//Schema
import {model, Schema} from "mongoose";
const otpSchema = new Schema(
    {
        code: {type: String, required: true, length: 6},
        email: {type: String, required: true, trim: true },
        purpose: {type: String, enum: ['verification', 'password-reset'], default: 'verification', required: true},
        expiresAt: {type: Date, required: true, index: {expires: 0}},
    },
    {
        timestamps:{
            createdAt: true,
            updatedAt: false
        }
    })
otpSchema.index({email: 1, purpose: 1}, {unique: true});

//Model
export const OTP = model('OTP', otpSchema);














//Model
