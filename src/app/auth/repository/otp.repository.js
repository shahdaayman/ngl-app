import {OTP} from "../model/otp.model.js";

export async function createOTP(otpData){
    return await OTP.create(otpData);
}

export async function replaceOTP(otpData){
    return await OTP.findOneAndUpdate(
        {email: otpData.email, purpose: otpData.purpose || 'verification'},
        {$set: otpData},
        {upsert: true, returnDocument: 'after', runValidators: true}
    );
}

export async function getOtpByEmail(email, purpose = 'verification'){
      return await OTP.findOne({email, purpose});
}

export async function consumeOTP(email, code, purpose) {
    return OTP.findOneAndDelete({
        email,
        code,
        purpose,
        expiresAt: {$gt: new Date()}
    });
}

export async function deleteOTP(email, purpose){
    return await OTP.deleteMany(purpose ? {email, purpose} : {email});
}
