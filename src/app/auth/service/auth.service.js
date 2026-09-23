import * as authRepository from "../repository/auth.repository.js";
import * as otpRepository from "../repository/otp.repository.js";
import * as userRepository from "../../user/repository/user.repository.js"
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken"
import {sendEmail} from "../../../common/email/nodemailer.js";
import {toMs, toSeconds} from "../../../common/utils/time.js"
import {
    invalidCode, invalidPassword,
    otpExpired,
    userAlreadyExist,
    userAlreadyVerified,
    userNotExist,
    userNotVerified
} from "../../../common/errors/errors.js"
import {generateOTP} from "../../../common/utils/otp.js";

export async function register(userData){
    const {name, email, password, dob, gender} = userData || {};
    if (typeof name !== 'string' || name.trim().length < 3 || name.trim().length > 20) {
        throw Object.assign(new Error('Name must be between 3 and 20 characters.'), {status: 400});
    }
    if (typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
        throw Object.assign(new Error('A valid email is required.'), {status: 400});
    }
    if (typeof password !== 'string' || password.length === 0 || Buffer.byteLength(password, 'utf8') > 72) {
        throw Object.assign(new Error('Password is required and must not exceed 72 bytes.'), {status: 400});
    }

    const normalizedEmail = email.trim().toLowerCase();
    const userExist = await authRepository.checkUserExistByEmail(normalizedEmail);
    if (userExist) throw userAlreadyExist;

    const createdUser = await authRepository.createUser({
        name: name.trim(),
        email: normalizedEmail,
        password: await bcrypt.hash(password, 10),
        dob,
        gender,
        provider: 'local',
        isVerified: false
    });
    try {
        const otp = generateOTP();
        await otpRepository.replaceOTP({
            code: otp,
            email: normalizedEmail,
            expiresAt: new Date(Date.now() + toMs(5, 'minutes'))
        });
        await sendEmail(normalizedEmail, 'verification code', `<h1>Your verification code is: ${otp}</h1>`);
    } catch (error) {
        // Keep the account reserved until this attempt's OTP has been removed.
        await otpRepository.deleteOTP(normalizedEmail);
        await authRepository.deleteUserById(createdUser._id);
        throw error;
    }
    const result = createdUser.toObject();
    delete result.password;
    return result;
}

export async function verifyEmail(email,code){
    // 1. Check User Existence
    const user = await authRepository.checkUserExistByEmail(email);
    // 1.1 if not exist
    if(!user) throw userNotExist;
    // 1.2 if isVerified = true -> error: you already verified
    if(user.isVerified === true) throw userAlreadyVerified;
    // 2. Check OTP validation
    const otp = await otpRepository.getOtpByEmail(email);
    // 2.1 not exist into DB >> error >> "OTP Expired" >> resend OTP
    if(!otp || otp.expiresAt <= new Date()) throw otpExpired;
    // 2.2 OTP stored into DB >> code not equal code stored >> error >> "Invalid OTP"
    if(otp.code !== String(code).trim()) throw invalidCode;
    // 3. make isVerified = true
    const updatedUser = await userRepository.updateUserByEmail(email, {isVerified: true});
    // 4. delete OTP from DB
    await otpRepository.deleteOTP(email);
    return updatedUser;
}

export async function login(email,password) {
    // 1. check user exits
    const user =  await authRepository.checkUserExistByEmail(email);
    // 1.1 not exist
    if(!user) throw userNotExist;
    // 1.2 not verified
    if(user.isVerified === false) throw userNotVerified;
    // 2. compare password
    const match = await bcrypt.compare(password, user.password);
    if(!match) throw invalidPassword;
    // 3. generate access token
    const token = jwt.sign({id: user._id, email: user.email, name: user.name },
        process.env.JWT_SECRET,{expiresIn: toSeconds(1,'hours')});
    return token;
}

export async function sendOTP(email){
    // 1. Check user exist
    const user = await authRepository.checkUserExistByEmail(email);
    if(!user) throw userNotExist;
    if(user.isVerified) throw userAlreadyVerified;
    // 2. Generate and save the replacement OTP before sending it.
    const code = generateOTP();
    await otpRepository.replaceOTP({
        email: user.email,
        code,
        expiresAt: new Date(Date.now() + toMs(5, 'minutes'))
    });
    await sendEmail(email, 'New OTP', `<h1>Your New OTP is: ${code}</h1>`);
}
