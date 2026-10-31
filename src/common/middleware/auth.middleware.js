import jwt from 'jsonwebtoken';
import {User} from '../../app/user/model/user.model.js';

export async function authenticate(req, res, next) {
    try {
        const authorization = req.headers.authorization;
        const bearerToken = authorization?.startsWith('Bearer ')
            ? authorization.slice(7)
            : null;
        const cookieToken = req.headers.cookie
            ?.split(';')
            .map((cookie) => cookie.trim())
            .find((cookie) => cookie.startsWith('access_token='))
            ?.slice('access_token='.length);
        const token = bearerToken || cookieToken;

        if (!token) throw Object.assign(new Error('Authentication required.'), {status: 401});

        const payload = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findOne({_id: payload.id, isDeleted: false}).select('+authVersion');
        if (!user) throw Object.assign(new Error('Account not found.'), {status: 401});
        if ((payload.version ?? 0) !== user.authVersion) {
            throw Object.assign(new Error('Invalid or expired authentication token.'), {status: 401});
        }

        req.user = user;
        next();
    } catch (error) {
        if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
            return next(Object.assign(new Error('Invalid or expired authentication token.'), {status: 401}));
        }
        next(error);
    }
}
