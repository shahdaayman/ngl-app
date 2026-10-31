import * as userRepository from '../repository/user.repository.js';
import * as messageRepository from '../../message/repository/message.repository.js';

function badRequest(message) {
    return Object.assign(new Error(message), {status: 400});
}

function notFound(message) {
    return Object.assign(new Error(message), {status: 404});
}

function safeUser(user) {
    const result = user.toObject();
    delete result.password;
    return result;
}

export async function getMyProfile(userId) {
    const user = await userRepository.getUserById(userId);
    if (!user) throw notFound('User not found.');
    return safeUser(user);
}

export async function getProfile(userId) {
    const user = await userRepository.getPublicProfile(userId);
    if (!user) throw notFound('Profile not found.');
    const messages = await messageRepository.getPublicMessages(userId);
    return {user, messages};
}

export async function updateMyProfile(userId, updates) {
    const allowedFields = ['name', 'dob', 'gender'];
    const keys = Object.keys(updates || {});
    if (!keys.length || keys.some((key) => !allowedFields.includes(key))) {
        throw badRequest('Only name, dob, and gender can be updated.');
    }
    if (updates.name !== undefined
        && (typeof updates.name !== 'string' || updates.name.trim().length < 3 || updates.name.trim().length > 20)) {
        throw badRequest('Name must be between 3 and 20 characters.');
    }
    if (updates.gender !== undefined && !['male', 'female'].includes(updates.gender)) {
        throw badRequest('Gender must be male or female.');
    }
    if (updates.dob !== undefined && updates.dob !== null
        && (typeof updates.dob !== 'string' || Number.isNaN(Date.parse(updates.dob)))) {
        throw badRequest('Date of birth must be a valid date.');
    }
    const data = {...updates};
    if (typeof data.name === 'string') data.name = data.name.trim();
    const user = await userRepository.updateUserById(userId, data);
    if (!user) throw notFound('User not found.');
    return safeUser(user);
}

export async function deleteMyProfile(userId) {
    const user = await userRepository.softDeleteUser(userId);
    if (!user) throw notFound('User not found.');
    return {deleted: true};
}