import User from "../../db/models/User.ts";
import bcrypt from "bcryptjs";
import { AuthTokens } from "../utils/auth.ts";

const register = async ({username, password}) => {
    
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
        username: username,
        password: hashedPassword
    });

    return user;
}

const login = async ({username, password}): Promise<AuthTokens> => {
    //find user
    const user = await User.where("username", username).findOne();
    
    if(!user){
        utils.errors.throwErrWithStatusCode("User not found", 404);
    }

    //check password
    const passwordIsCorrect = await bcrypt.compare(password, user.password);
    if(!passwordIsCorrect){
        utils.errors.throwErrWithStatusCode("Invalid password", 400);
    }

    try{
        return await utils.auth.generateAuthTokens(user._id, user.username);

        // return [accessToken, refreshToken];
    }catch(err){
        console.log(err);
        utils.errors.throwErrWithStatusCode("Something went wrong", 500);
    }
}

const refreshToken = async (refreshToken) => {
    
    try {
        const verified = await utils.auth.verifyTokenAsync(refreshToken, process.env.REFRESH_TOKEN_SECRET);
        const [accessToken, refToken] = await utils.auth.generateAuthTokens(verified.id, verified.username);

        return [accessToken, refToken];
    }catch(err){
        console.log(err);
        utils.errors.throwErrWithStatusCode("Invalid refresh token", 403);
    }
}

export default { register, login, refreshToken }