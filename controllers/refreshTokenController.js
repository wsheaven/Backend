const User = require('../models/User');
const jwt = require('jsonwebtoken');

const handleRefreshToken = async (req, res) => {
    const cookies = req.cookies;
    if (!cookies?.jwt) return res.sendStatus(401);
    const refreshToken = cookies.jwt;

    const foundUser = await User.findOne({ refreshToken }).exec();
    if (!foundUser) return res.sendStatus(403); //Forbidden 
    // evaluate jwt 
    jwt.verify(
        refreshToken,
        process.env.REFRESH_TOKEN_SECRET,
        (err, decoded) => {
            if (err || foundUser.username !== decoded.username) return res.sendStatus(403);
            const accessToken = jwt.sign(
                {
                    "UserInfo": {
                        "username": decoded.username,
                    }
                },
                process.env.ACCESS_TOKEN_SECRET,
                { expiresIn: '30s' }
            );
            res.json({ accessToken })
        }
    );
}

module.exports = { handleRefreshToken }

// const User = require('../models/User');
// const jwt = require('jsonwebtoken');

// const handleRefreshToken = async (req, res) => {
//     const cookies = req.cookies;
//     if (!cookies?.jwt) {
//         return res.status(401).json({ message: 'No token provided' });
//     }
//     const refreshToken = cookies.jwt;

//     try {
//         const foundUser = await User.findOne({ refreshToken }).exec();
//         if (!foundUser) {
//             return res.status(403).json({ message: 'No user found with this token' });
//         }

//         jwt.verify(
//             refreshToken,
//             process.env.REFRESH_TOKEN_SECRET,
//             (err, decoded) => {
//                 if (err) {
//                     return res.status(403).json({ message: 'Token verification failed', error: err });
//                 }
//                 if (foundUser.username !== decoded.username) {
//                     return res.status(403).json({ message: 'Token username mismatch' });
//                 }

//                 const accessToken = jwt.sign(
//                     { "UserInfo": { "username": decoded.username } },
//                     process.env.ACCESS_TOKEN_SECRET,
//                     { expiresIn: '30s' }
//                 );

//                 res.json({ accessToken });
//             }
//         );
//     } catch (error) {
//         console.error(error);
//         res.status(500).json({ message: 'Internal server error', error });
//     }
// };

// module.exports = { handleRefreshToken };
