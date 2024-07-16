const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require('jsonwebtoken')
require('dotenv').config();

const handleLogin = async (req, res) => {
    const {user, password} = req.body
    if (!user || !password) return res.status(400).json({ 'message': 'Username and password are required.' });

    const foundUser = await User.findOne({ username: user }).exec();
    if (!foundUser) return res.sendStatus(401); //Unauthorized 
    // evaluate password 
    const match = await bcrypt.compare(password, foundUser.password);

    if (match) {
        // create JWTs
        const accessToken = jwt.sign(
            {
                "UserInfo": {
                    "username": foundUser.username,
                }
            },
            process.env.ACCESS_TOKEN_SECRET,
            { expiresIn: '45m' }
        );
        const refreshToken = jwt.sign(
            { "username": foundUser.username },
            process.env.REFRESH_TOKEN_SECRET,
            { expiresIn: '24h' }
        );
        // Saving refreshToken with current user
        foundUser.refreshToken = refreshToken;
        const result = await foundUser.save();
        const id = foundUser.id
        console.log(result);

        // Creates Secure Cookie with refresh token
        res.cookie('jwt', refreshToken, { httpOnly: true, secure: true, sameSite: 'None', maxAge: 24 * 60 * 60 * 1000 });

        // Send access token to user
        res.json({ accessToken, id });

    } else {
        res.sendStatus(401);
    }
}

module.exports = { handleLogin };