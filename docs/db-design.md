# DB DESIGN

* User
- name -> [String - required - minlength: 3 - maxlength: 20 - trim: true]
- email -> [String - required - unique: true - trim: true - lowercase: true] 
- password -> [String - in-case provider = local >>required]
- provider -> [google - facebook - "local"] 
- isDeleted -> [boolean] - [default: false]
- isVerified -> [boolean] - [default: false]
- dob [Date]
- gender [Gender] - [Male - Female]
- createdAt [Date]
- updatedAt [Date]

-------------------------------------------------------------
* Message
- content -> [String - required - trim: true - minlength: 1 - maxlength: 200] 
- receiver -> [ObjectID - required - ref: 'User']
- sender -> [ObjectID - ref: 'User']
- isDeleted [boolean] - [default: false]
- createdAt [Date]
- updatedAt [Date]

-------------------------------------------------------------
* OTP [one-time password]
  - code -> [String - required - length]
  - email -> [String - required - trim: true - lowercase: true]
  - expiresAt -> [Date]
  - createdAt -> [Date]
