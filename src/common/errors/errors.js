//User Errors:
export const userNotExist = Object.assign(new Error("User Doesn't Exist!"), {status: 404});
export const userAlreadyVerified = Object.assign(new Error("User Already Verified!"), {status: 409});
export const userAlreadyExist = Object.assign(new Error('User Already Exist.'), {status: 409});
export const userNotVerified= Object.assign(new Error("User Not Verified!"), {status: 403});

//Authentication Errors:
export const otpExpired = Object.assign(new Error("OTP expired. please resend OTP"), {status: 400});
export const invalidCode = Object.assign(new Error('Invalid Code!'), {status: 400});
export const invalidPassword= Object.assign(new Error("Invalid Password!"), {status: 401});
