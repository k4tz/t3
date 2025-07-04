import {sign, verify} from "jsonwebtoken";
import authConfig from "../../config/auth";

function jwtSignAsync(payload: string | Buffer | object, secret: string, options: object): Promise<string> {
    return new Promise((resolve, reject) => {
        sign(payload, secret, options, (err, token) => {
        if (err || !token) return reject(err);
            resolve(token);
        });
    });
}
function jwtVerifyAsync<T>(token: string, secret: string, options?: object): Promise<T> {
    return new Promise((resolve, reject) => {
        verify(token, secret, options, (err, decoded) => {
        if (err || !decoded) return reject(err);
            resolve(decoded as T);
        });
    });
}


interface VerifiedUser {
    id: string,
    username: string
}

export type AuthTokens = [accessToken: string, refreshToken: string];

/**
 * @description generates access and refresh tokens
 */
const generateAuthTokens = async (id: string, username: string): Promise<AuthTokens> => {

    const user = { id, username };

    const [accessToken, refreshToken] = await Promise.all([
        jwtSignAsync(user, authConfig.access_token_secret, { expiresIn: "1h"}),
        jwtSignAsync(user, authConfig.refresh_token_secret, { expiresIn: "1d"})
    ]);
    
    return [accessToken, refreshToken];
}

const verifyTokenAsync = async (token: string, secret: string): Promise<VerifiedUser> => {
    const verified = await jwtVerifyAsync<VerifiedUser>(token, secret);
    return verified;
}

export { generateAuthTokens, verifyTokenAsync };