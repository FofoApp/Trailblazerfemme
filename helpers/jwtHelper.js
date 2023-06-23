const jwt = require('jsonwebtoken');
const mongoose = require("mongoose");
const moment = require('moment')
const createError = require('http-errors');
const UserModel = require('./../models/UserModel');

const isValidObjectId  = mongoose.Types.ObjectId;


exports.isFirstDateBeforeSecondDate = (prevDate, todayDate = Date.now()) => {
    let firstDate = moment(prevDate);
    let secondDate = moment(todayDate);

    if(firstDate && secondDate) {
        return firstDate.isBefore();
    }

    return false;
}


exports.signInAccessToken = (userData) => {
    return new Promise((resolve, reject) => {
        const payload = {
            id: userData?.id?.toString(),
            username: userData?.fullname,
            email: userData?.email,
            roles: userData?.roles,
            profileImage: userData?.profileImage || null,
            roles: userData?.roles[0],
            // iss: "yourwebsitename.com"
        }

        const secret =  process.env.ACCESS_TOKEN_SECRET;
    
        const option = {
                        expiresIn: '1hr',
                        issuer: "yourwebsitename.com",
                        audience: userData?.id?.toString(),
                    };
    
        jwt.sign(payload, secret, option, (error, data) => {
            if(error) {
                reject({ error: "Token error"})
            }

            resolve(data)
        })
    })
}

exports.signInRefreshToken = (userData) => {

    return new Promise((resolve, reject) => {
        
        const payload = {
            id: userData.id.toString(),
            username: userData.fullname,
            email: userData.email,
            roles: userData.roles,
            profileImage: userData.profileImage || null,
            roles: userData.roles[0],
            // iss: "yourwebsitename.com"
        }
        const secret =  process.env.REFRESH_TOKEN_SECRET;

        const option = {
            expiresIn: '1yr',
            issuer: "yourwebsitename.com",
            audience: userData?.id?.toString(),
    };

    jwt.sign(payload, secret, option, (error, data) => {
        if(error) {
            reject({ error: "Token error"})
        }

        resolve(data)
    });

    });

        // jwt.sign(payload, secret, option, (err, token) => {
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

exports.resetPasswordToken = (user) => {
    return new Promise((resolve, reject) => {
        const payload = {
            id: user.id,
            email: user.email,
            // iss: "yourwebsitename.com"
        }
        const secret =  process.env.RESET_PASSWORD_SECRET_KEY + user?.password;

        const option = {
            expiresIn: '15m',
            issuer: "yourwebsitename.com",
            audience: user?.id
    };

        jwt.sign(payload, secret, option, (err, token) => {
            if(err){
                return reject(createError.InternalServerError());
            }
            resolve(token);
        });
    })
}


exports.verifyRefreshToken = async (req, res, next) =>  {

    let user;

    try {
        
    if(!req.headers['authorization']) {
        return res.status(401).json({ status: "failed", error: "Invalid token", message: "Invalid token" });
    }

    const authHeader = req.headers['authorization'];
    
    const bearerToken = authHeader.split(' ');
    
    const token = bearerToken[1];

    if (!token.trim()) {
        return res.status(401).json({ status: "failed", error: "Invalid request", message: "Invalid request" });
    }
    
    const payload  = jwt.verify(token, process.env.REFRESH_TOKEN_SECRET);

    if (!isValidObjectId(payload?.id)) {

        return res.status(401).json({ status: "failed", error: "Invalid request", message: "Invalid request" });
   
    }

    if(payload) {

        user = await UserModel.findById(payload?.id);

    }

    if(!user) {

        return res.status(401).json({ status: "failed", error: "Bad request, user not found", message: "Bad request, user not found" });
        
    }
    
    const user_data = {
        id: user?.id,
        email: user?.email,
        fullname: user?.fullname,
        role: user?.roles[0],
        iat: payload?.iat,
        exp: payload?.exp,
        aud: payload?.aud,
        iss: payload?.iss
    }

    req.user = user_data;
    
    next();

    } catch (error) {

        if(error instanceof jwt.TokenExpiredError) {
            
            return res.status(401).json({ status: "failed", error: "Expired session", message: "Expired session" });
        
        } else if(error instanceof jwt.JsonWebTokenError) {
            console.log("Heere")
            return res.status(401).json({ status: "failed", error: "Invalid token", message: "Invalid token" });

        } else {
           
            return res.status(401).json({ status: "failed", error: "Unauthorized", message: "Unauthorized" });
        
        }
    }}

exports.verifyAccessToken =  async (req, res, next) => {

    let user;

    try {
        
    if(!req.headers['authorization']) {
        return next(createError.Unauthorized());
    }

    const authHeader = req.headers['authorization'];
    
    const bearerToken = authHeader.split(' ');
    
    const token = bearerToken[1];

    if (!token.trim()) {
        return res.status(401).json({ status: "failed", error: "Invalid token", message: "Invalid token" })
    }
    
    const payload  = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);



    if (!isValidObjectId(payload.id)) {
        return res.status(401).json({ status: "failed", error: "Invalid token", message: "Invalid token" })

    }

    if(payload) {
        user = await UserModel.findById(payload?.id);
    }

    if(!user) {
        return res.status(401).json({ status: "failed", error: "Invalid token", message: "Invalid token" })

    }


    const user_data = {
        id: user?.id,
        email: user?.email,
        fullname: user?.fullname,
        role: user?.roles[0],
        iat: payload?.iat,
        exp: payload?.exp,
        aud: payload?.aud,
        iss: payload?.iss
    }

    req.user = user_data;
    
    next();

    } catch (error) {

        if(error instanceof jwt.TokenExpiredError) {
            
            return res.status(401).json({ status: "failed", error: "Session expired", message: "Session expired" });
        
        } else if(error instanceof jwt.JsonWebTokenError) {
            
            return res.status(401).json({ status: "failed", error: "Invalid token", message: "Invalid token" })

        } else {
           
            return res.status(401).json({ status: "failed", error: "Unauthorized", message: "Unauthorized" })
        
        }

    }

}