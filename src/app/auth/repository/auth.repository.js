import {User} from '../../user/model/user.model.js';

export async function checkUserExistByEmail(email){
    return User.findOne({email, isDeleted: false});
}

export async function getUserForLogin(email) {
    return User.findOne({email, isDeleted: false}).select('+password +authVersion');
}

export async function getActiveVerifiedUserById(id) {
    return User.findOne({_id: id, isDeleted: false, isVerified: true});
}

export async function updatePassword(id, password) {
    return User.findOneAndUpdate(
        {_id: id, isDeleted: false},
        {$set: {password}, $inc: {authVersion: 1}},
        {returnDocument: 'after', runValidators: true}
    );
}

export async function invalidateTokens(id) {
    return User.findOneAndUpdate(
        {_id: id, isDeleted: false},
        {$inc: {authVersion: 1}},
        {returnDocument: 'after'}
    );
}

export async function createUser(userData){
    return await User.create(userData);
}

export async function deleteUserById(id){
    return await User.deleteOne({_id: id});
}
