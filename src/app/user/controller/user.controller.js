import * as userService from '../service/user.service.js';

export async function getMyProfile(req, res, next) {
    try {
        const data = await userService.getMyProfile(req.user._id);
        res.json({success: true, data});
    } catch (error) {
        next(error);
    }
}

export async function getProfile(req, res, next) {
    try {
        const data = await userService.getProfile(req.params.userId);
        res.json({success: true, data});
    } catch (error) {
        next(error);
    }
}

export async function updateMyProfile(req, res, next) {
    try {
        const data = await userService.updateMyProfile(req.user._id, req.body || {});
        res.json({success: true, data});
    } catch (error) {
        next(error);
    }
}

export async function deleteMyProfile(req, res, next) {
    try {
        const data = await userService.deleteMyProfile(req.user._id);
        res.json({success: true, data});
    } catch (error) {
        next(error);
    }
}