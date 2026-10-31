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
- sender -> [ObjectID - required - ref: 'User'] (kept private for anonymous messages)
- visibility -> [anonymous - public; default anonymous]
- isDeleted [boolean] - [default: false]
- createdAt [Date]
- updatedAt [Date]

-------------------------------------------------------------
* IdentityRequest
- message -> [ObjectID - required - ref: 'Message']
- requester -> [ObjectID - required - ref: 'User'] (message recipient)
- sender -> [ObjectID - required - ref: 'User'] (original message sender)
- status -> [pending - accepted - rejected; default pending]
- unique [message, requester]
- createdAt [Date]
- updatedAt [Date]

-------------------------------------------------------------
* Conversation
- originalMessage -> [ObjectID - required, unique - ref: 'Message']
- participants -> [two User ObjectIDs]
- createdAt [Date]
- updatedAt [Date]

-------------------------------------------------------------
* ConversationMessage
- conversation -> [ObjectID - required - ref: 'Conversation']
- sender -> [ObjectID - required - ref: 'User']
- content -> [String - required - trim: true - minlength: 1 - maxlength: 2000]
- createdAt [Date]

-------------------------------------------------------------
* OTP [one-time password]
  - code -> [String - required - length]
  - email -> [String - required - trim: true - lowercase: true]
  - purpose -> [verification - password-reset]
  - expiresAt -> [Date]
  - createdAt -> [Date]
