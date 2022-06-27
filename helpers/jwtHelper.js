const JWT = require('jsonwebtoken');
const createError = require('http-errors');
const client = require('./../helpers/initRedis');
module.exports = {

    signInAccessToken: (userData) => {
        return new Promise((resolve, reject) => {
            const payload = {
                id: userData._id,
                username: userData.fullname,
                email: userData.email,
                roles: userData.roles,
                profileImagePath: userData.profileImagePath,
                roles: userData.roles[0],
                // iss: "yourwebsitename.com"
            }
            const secret =  process.env.ACCESS_TOKEN_SECRET;

            const option = {
                expiresIn: '30m',
                issuer: "yourwebsitename.com",
                audience: userData.id
        };

            JWT.sign(payload, secret, option, (err, token) => {
                if(err){
                    console.log(err)
                    // return reject(createError.InternalServerError());
                }
                resolve(token);
            });
        })
    },

    signInRefreshToken: (userData) => {
        return new Promise((resolve, reject) => {
            const payload = {
                id: userData._id,
                username: userData.fullname,
                email: userData.email,
                roles: userData.roles,
                profileImagePath: userData.profileImagePath,
                roles: userData.roles[0],
                // iss: "yourwebsitename.com"
            }
            const secret =  process.env.REFRESH_TOKEN_SECRET;

            const option = {
                expiresIn: '1yr',
                issuer: "yourwebsitename.com",
                audience: userData.id
        };

        JWT.sign(payload, secret, option, (err, token) => {
            if(err){
                return reject(createError.InternalServerError());
            }
            if(err) {
                //SAVETOKEN IN DATABASE
                reject(createError.InternalServerError());
                return 
            }
            resolve(token);

        });

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
        });

    },


    verifyAccessToken: (req, res, next) => {

        if(!req.headers['authorization']) {
            return next(createError.Unauthorized());
        }

        const authHeader = req.headers['authorization'];
        
        const bearerToken = authHeader.split(' ');
        
        const token = bearerToken[1];
        
        JWT.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, payload) => {
            if(err) {
                if(err.name === 'JsonWebTokenError') {
                    return next(createError.Unauthorized());
                }else if(err.message === "jwt expired"){
                    return next(createError.Unauthorized("Access Timeout!"));
                }else {
                    return next(createError.Unauthorized(err.message));
                }
            }
            req.user = payload;
            next();
        });

    },

    verifyRefreshToken:  (refreshToken) => {
        return new Promise((resolve, reject) => {

            JWT.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, payload) => {
                if(err) {
                    console.log(err)
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
    },

    resetPasswordToken: (user) => {
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
    },







}