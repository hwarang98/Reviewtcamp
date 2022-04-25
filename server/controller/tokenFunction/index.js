require('dotenv').config();
const { sign, verify } = require('jsonwebtoken');
const secret = process.env.ACCESS_SECRET;

module.exports = {
    generateAccessToken: (data) => {
        return sign(data, secret, { expiresIn: '1d' });
    },
    sendAccessToken: (res, accessToken) => {
        res.cookie("jwt", accessToken, {
            httpOnly: true,
            sameSite: "none",
            secure: true,
        });
    },
    
    isAuthorized: (req) => {
        // JWT 토큰 정보를 받아서 검증
        const cookie = req.headers["cookie"];
        const authorization = req.headers.authorization;
        // console.log(cookie)
        if (!cookie) {
        return null;
        }
        try {
            return verify(authorization, secret);
        } catch (err) {
            return null;
            }
        },
    };
