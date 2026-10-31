# API contracts

Base URL: `http://localhost:3000`. Protected routes accept either an
`Authorization: Bearer <token>` header or the HTTP-only `access_token` cookie.
Responses use `{ "success": true, "data": ... }`; errors use
`{ "success": false, "message": "..." }`.

## Setup

Set these environment variables before starting the server:

- `MONGODB_URL` — MongoDB connection string.
- `JWT_SECRET` — secret used to sign access tokens.
- `MAIL_USER` and `MAIL_PASS` — Gmail account and app password for OTP emails.
- `PORT` — optional; defaults to `3000`.
- `NODE_ENV=production` enables the secure cookie flag.

Run `npm run dev`. Register two verified accounts to exercise the identity
request and conversation flow. OTP codes are valid for five minutes and are
deleted after successful verification or password reset.

## Authentication

| Method | Path | Auth | Purpose |
|---|---|---|---|
| POST | `/auth/register` | No | Create account and send verification OTP |
| POST | `/auth/send-otp` | No | Resend account verification OTP |
| PATCH | `/auth/verify-account` | No | Verify using `{ "email", "code" }` |
| POST | `/auth/login` | No | Login; response contains `data.token` and sets an HTTP-only cookie |
| POST | `/auth/logout` | Yes | Invalidate all current access tokens for this account |
| POST | `/auth/password-reset/send-otp` | No | Send a password-reset OTP |
| POST | `/auth/password-reset` | No | Reset using `{ "email", "code", "password" }` |

## Profiles

| Method | Path | Auth | Purpose |
|---|---|---|---|
| GET | `/user/me` | Yes | Get the authenticated user's profile |
| PATCH | `/user/me` | Yes | Update `name`, `dob`, and/or `gender` |
| DELETE | `/user/me` | Yes | Soft-delete the authenticated user's account |
| GET | `/user/:userId` | No | Get a public profile and its public messages |

## Messages and identity requests

| Method | Path | Auth | Purpose |
|---|---|---|---|
| POST | `/message/to/:receiverId` | Yes | Send `{ "content", "visibility" }`; visibility is `anonymous` (default) or `public` |
| GET | `/message/inbox` | Yes | List messages received by the authenticated user |
| GET | `/message/:messageId` | Yes | View a message received by the authenticated user |
| DELETE | `/message/:messageId` | Yes | Soft-delete a received message |
| POST | `/message/:messageId/identity-requests` | Yes | Ask the sender of an anonymous message to reveal their identity |
| GET | `/message/identity-requests` | Yes | List requests received by the authenticated sender |
| PATCH | `/message/identity-requests/:requestId` | Yes | Respond with `{ "status": "accepted" }` or `{ "status": "rejected" }` |

Only the intended recipient can view/manage a received message or request its
sender's identity. Anonymous senders remain hidden unless they accept. Accepting
a request reveals the sender to the recipient and creates a conversation linked
to the original message. Rejecting does not reveal the sender.

## Conversations

| Method | Path | Auth | Purpose |
|---|---|---|---|
| GET | `/message/conversations` | Yes | List conversations for the authenticated participant |
| POST | `/message/conversations/:conversationId/messages` | Yes | Send `{ "content" }` in a conversation |
| GET | `/message/conversations/:conversationId/messages?limit=100` | Yes | Retrieve up to 100 conversation messages |

Conversation and message access is restricted to the two conversation
participants. Conversation message content is limited to 2,000 characters.

## Postman

Import `ngl-app.postman_collection.json`. Set `baseUrl`, then register and verify
two accounts. Run the Login request once for each account, setting `loginRole`
to `sender` or `receiver` before each login; the collection saves the
corresponding token. Set `senderId` and `receiverId` from `/user/me` responses,
then run the message → identity request → accept → conversation requests in
order. The collection automatically saves `messageId`, `requestId`, and
`conversationId` from successful responses.

Google OAuth, Redis caching, rate limiting, and load-balancer configuration from
the broader requirements list are not part of this core API implementation.