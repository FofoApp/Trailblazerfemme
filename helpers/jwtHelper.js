const JWT = require('jsonwebtoken');
const mongoose = require("mongoose");
const createError = require('http-errors');
// const client = require('./../helpers/initRedis');
const UserModel = require('./../models/UserModel');

const isValidObjectId  = mongoose.Types.ObjectId;

exports.signInAccessToken = (userData) => {

    try {
        const payload = {
            id: userData.id.toString(),
            username: userData.fullname,
            email: userData.email,
            roles: userData.roles,
            profileImagePath: userData.profileImagePath || null,
            roles: userData.roles[0],
            // iss: "yourwebsitename.com"
        }
        const secret =  process.env.ACCESS_TOKEN_SECRET;
    
       
    
        const option = {
                        expiresIn: '30m',
                        issuer: "yourwebsitename.com",
                        audience: userData.id.toString(),
                    };
    
        return JWT.sign(payload, secret, option)

    } catch (error) {
        return res.status(500).json({ error: "Token error"})
    }
 
}

exports.signInRefreshToken = (userData) => {

    try {
        const payload = {
            id: userData.id.toString(),
            username: userData.fullname,
            email: userData.email,
            roles: userData.roles,
            profileImagePath: userData.profileImagePath || null,
            roles: userData.roles[0],
            // iss: "yourwebsitename.com"
        }
        const secret =  process.env.REFRESH_TOKEN_SECRET;

        const option = {
            expiresIn: '1yr',
            issuer: "yourwebsitename.com",
            audience: userData.id.toString(),
    };

    return JWT.sign(payload, secret, option)

} catch (error) {

    return res.status(500).json({ error: "Token error"})

}

        // JWT.sign(payload, secret, option, (err, token) => {
        //     if(err){
        //         return reject(createError.InternalServerError());
        //     }
        //     client.SET(userId, token, 'EX', 365 * 24 * 60 * 60, (err, reply) => {
        //         if(err) {
        //             reject(createError.InternalServerError());
        //             return 
        //         }
        //         resolve(token);

        //     });

        // });

}

exports.verifyRefreshToken = (refreshToken) => {
    return new Promise((resolve, reject) => {

        JWT.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, payload) => {
            if(err) {
                // console.log(err)
                return reject(createError.Unauthorized());
            }

            const userId = payload.aud;

            resolve(userId);

            // client.GET(userId, (err, result) => {
            //     if(err) {
            //         reject(createError.InternalServerError());
            //         return;
            //     }
            //     if(refreshToken === result) {
            //         return resolve(userId);
            //     } else {
            //         reject(createError.Unauthorized());
            //     }
            // });

        })
    })
}

exports.resetPasswordToken = (user) => {
    return new Promise((resolve, reject) => {
        const payload = {
            id: user.id,
            email: user.email,
            // iss: "yourwebsitename.com"
        }
        const secret =  process.env.RESET_PASSWORD_SECRET_KEY + user.password;

        const option = {
            expiresIn: '15m',
            issuer: "yourwebsitename.com",
            audience: user.id
    };

        JWT.sign(payload, secret, option, (err, token) => {
            if(err){
                return reject(createError.InternalServerError());
            }
            resolve(token);
        });
    })
}


exports.verifyAccessToken =  async (req, res, next) => {

    let user;

    try {
        
    if(!req.headers['authorization']) return next(createError.Unauthorized());

    const authHeader = req.headers['authorization'];
    
    const bearerToken = authHeader.split(' ');
    
    const token = bearerToken[1];

    if (!token.trim()) return next(createError.BadRequest("Invalid request"));
    
    const payload  = JWT.verify(token, process.env.ACCESS_TOKEN_SECRET);

    // console.log(payload)

    if (!isValidObjectId(payload.id)) return next(createError.BadRequest("Invalid request"));

    if(payload) {
        user = await UserModel.findById(payload?.id);
    }

    if(!user) return next(createError.BadRequest("Bad request, user not found"));

    const user_data = {
        id: user.id,
        fullname: user.fullname,
        role: user.roles[0],
        iat: payload.iat,
        exp: payload.exp,
        aud: payload.aud,
        iss: payload.iss
    }

    req.user = user_data;
    
    next();

    } catch (error) {

        if(error?.name === 'JsonWebTokenError') {

            return next(createError.Unauthorized());

        } else if(error?.message === "jwt expired") {

            return next(createError.Unauthorized("Access Timeout!"));

        } else {
            console.log(error)
            return next(createError.Unauthorized());

        }

      
        // return next(createError.Unauthorized());
    }

}