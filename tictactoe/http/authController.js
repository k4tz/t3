import User from "../../db/models/User.ts";
import asyncHandler from "express-async-handler";

const register = asyncHandler(async (req, res) => {
    console.log(req.body);
    res.status(404);
    const username = req.body?.username;
    const pass = req.body?.password;

    if(!username || !pass) {
        res.status(400).json({
            message: "Username and password are required."
        });
    }
    const user = await User.create({ username, password });
    res.status(201).json(user);
});

export default { register }