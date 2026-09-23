import assert from 'node:assert/strict';
import {after, before, beforeEach, mock, test} from 'node:test';
import {once} from 'node:events';
import bcrypt from 'bcrypt';
import nodemailer from 'nodemailer';
import {User} from '../src/app/user/model/user.model.js';
import {OTP} from '../src/app/auth/model/otp.model.js';

const users = new Map();
const otps = new Map();
let deliveryError;
let storageError;
let sentMail;
let server;
let baseUrl;

mock.method(nodemailer, 'createTransport', () => ({
    async sendMail(message) {
        if (deliveryError) throw deliveryError;
        sentMail = message;
    }
}));
mock.method(User, 'findOne', async ({email}) => users.get(email));
mock.method(User, 'create', async (data) => {
    const user = new User(data);
    await user.validate();
    if (users.has(data.email)) throw Object.assign(new Error('Duplicate email'), {code: 11000});
    users.set(data.email, user);
    return user;
});
mock.method(User, 'deleteOne', async ({_id}) => {
    for (const [email, user] of users) {
        if (String(user._id) === String(_id)) users.delete(email);
    }
});
mock.method(OTP, 'findOneAndUpdate', async ({email}, {$set}) => {
    if (storageError) throw storageError;
    const otp = new OTP($set);
    await otp.validate();
    otps.set(email, otp);
    return otp;
});
mock.method(OTP, 'deleteMany', async ({email}) => otps.delete(email));

before(async () => {
    const {default: app} = await import('../src/app.js');
    server = app.listen(0, '127.0.0.1');
    await once(server, 'listening');
    baseUrl = `http://127.0.0.1:${server.address().port}`;
});
beforeEach(() => {
    users.clear();
    otps.clear();
    deliveryError = undefined;
    storageError = undefined;
    sentMail = undefined;
});
after(async () => {
    await new Promise((resolve, reject) => server.close(error => error ? reject(error) : resolve()));
    mock.restoreAll();
});

const validInput = {name: 'Test User', email: 'test@example.com', password: '123456'};
async function register(body) {
    const response = await fetch(`${baseUrl}/auth/register`, {
        method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(body)
    });
    return {status: response.status, body: await response.json()};
}

test('registration hashes the password, saves the emailed OTP, and returns safe user data', async () => {
    const result = await register({...validInput, email: ' TEST@EXAMPLE.COM ', isVerified: true, provider: 'google'});
    assert.equal(result.status, 201);
    assert.equal(result.body.data.email, validInput.email);
    assert.equal(result.body.data.isVerified, false);
    assert.equal(result.body.data.provider, 'local');
    assert.equal('password' in result.body.data, false);
    assert.ok(await bcrypt.compare(validInput.password, users.get(validInput.email).password));
    const otp = otps.get(validInput.email);
    assert.match(otp.code, /^\d{6}$/);
    assert.ok(sentMail.html.includes(otp.code));
    assert.equal(sentMail.to, validInput.email);
    assert.ok(otp.expiresAt > new Date());
});

test('duplicate registration returns 409 and preserves the original account and OTP', async () => {
    assert.equal((await register(validInput)).status, 201);
    const originalUser = users.get(validInput.email);
    const originalOtp = otps.get(validInput.email);
    assert.equal((await register({...validInput, email: 'TEST@EXAMPLE.COM'})).status, 409);
    assert.equal(users.get(validInput.email), originalUser);
    assert.equal(otps.get(validInput.email), originalOtp);
});

test('invalid registration input returns 400 without creating an account', async () => {
    for (const body of [
        {}, {...validInput, password: undefined}, {...validInput, password: 123456},
        {...validInput, email: 'bad-email'}, {...validInput, name: 'ab'},
        {...validInput, gender: 'invalid'}, {...validInput, dob: 'invalid'},
        {...validInput, password: 'a'.repeat(73)}
    ]) {
        assert.equal((await register(body)).status, 400);
        assert.equal(users.size, 0);
        assert.equal(otps.size, 0);
    }
});

test('email failure returns 503 and allows a clean registration retry', async () => {
    deliveryError = Object.assign(new Error('SMTP authentication failed'), {code: 'EAUTH'});
    const failed = await register(validInput);
    assert.equal(failed.status, 503);
    assert.match(failed.body.message, /Unable to send verification email/);
    assert.equal(users.size, 0);
    assert.equal(otps.size, 0);
    deliveryError = undefined;
    assert.equal((await register(validInput)).status, 201);
});

test('OTP storage failure removes the newly created account and sends no email', async () => {
    storageError = new Error('OTP storage failed');
    assert.equal((await register(validInput)).status, 500);
    assert.equal(users.size, 0);
    assert.equal(otps.size, 0);
    assert.equal(sentMail, undefined);
    storageError = undefined;
    assert.equal((await register(validInput)).status, 201);
});
