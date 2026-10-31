import {User} from "../model/user.model.js"

export async function getUserById(id) {
   return User.findOne({_id: id, isDeleted: false});
}

export async function updateUserById(id, updatedData){
   return User.findOneAndUpdate(
        {_id: id, isDeleted: false},
        updatedData,
        {returnDocument: "after", runValidators: true}
    );
}

export async function softDeleteUser(id) {
   return User.findOneAndUpdate(
        {_id: id, isDeleted: false},
        {isDeleted: true},
        {returnDocument: "after"}
    );
}

export async function getPublicProfile(id) {
   return User.findOne({_id: id, isDeleted: false, isVerified: true})
       .select('name createdAt');
}


