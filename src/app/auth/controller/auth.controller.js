import * as authService from '../service/auth.service.js';
import {toMs} from '../../../common/utils/time.js';

export async function register(req, res, next) {
    try {
        const data = await authService.register(req.body);
        res.status(201).json({message: 'User Created Successfully!', success: true, data});
    } catch (error) {
        next(error);
    }
}

export async function verifyAccount(req, res, next) {
    try {
        const data = await authService.verifyEmail(req.body?.email, req.body?.code);
        res.json({message: 'Account verified successfully.', success: true, data});
    } catch (error) {
        next(error);
    }
}

export async function login(req, res, next) {
    try {
        const token = await authService.login(req.body?.email, req.body?.password);
        res.cookie('access_token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: toMs(1, 'hours')
        });
        res.json({message: 'User Login Successfully!', success: true, data: {token}});
    } catch (error) {
        next(error);
    }
}

export async function logout(req, res, next) {
    try {
        await authService.logout(req.user._id);
        res.clearCookie('access_token', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax'
        });
        res.json({success: true, message: 'Logged out successfully.'});
    } catch (error) {
        next(error);
    }
}

export async function sendOTP(req, res, next) {
    try {
        await authService.sendOTP(req.body?.email);
        res.json({message: 'New OTP Sent, Please Check Your Email!', success: true});
    } catch (error) {
        next(error);
    }
}

export async function sendPasswordResetOTP(req, res, next) {
    try {
        await authService.sendPasswordResetOTP(req.body?.email);
        res.json({success: true, message: 'Password reset code sent.'});
    } catch (error) {
        next(error);
    }
}

export async function resetPassword(req, res, next) {
    try {
        await authService.resetPassword(req.body?.email, req.body?.code, req.body?.password);
        res.json({success: true, message: 'Password reset successfully.'});
    } catch (error) {
        next(error);
    }
}
