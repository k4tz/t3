import jwt from "jsonwebtoken";
import { promisify } from "node:util";

const jwtSignAsync = promisify(jwt.sign);
const jwtVerifyAsync = promisify(jwt.verify);

const generateAuthTokens = async (id, username) => {

    const [accessToken, refreshToken] = await Promise.all([
        jwtSignAsync({ id: id, username: username}, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "1h"}),
        jwtSignAsync({ id: id, username: username}, process.env.REFRESH_TOKEN_SECRET, { expiresIn: "1d"})
    ]);
    
    return [accessToken, refreshToken];
}

const verifyTokenAsync = async (token, secret) => {
    const verified = await jwtVerifyAsync(token, secret);
    return verified;
}

export { generateAuthTokens, verifyTokenAsync };