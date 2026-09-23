import {OTP} from "../model/otp.model.js";

export async function createOTP(otpData){
    return await OTP.create(otpData);
}

export async function replaceOTP(otpData){
    return await OTP.findOneAndUpdate(
        {email: otpData.email},
        {$set: otpData},
        {upsert: true, returnDocument: 'after', runValidators: true}
    );
}

export async function getOtpByEmail(email){
      return await OTP.findOne({email:email});
}


export async function deleteOTP(email){
    return await OTP.deleteMany({email:email});
}

