const mongoose = require('mongoose');
const _ = require('lodash');
//const User = require('./../models/UserModel');
const UserModel = require('./../../models/UserModel');



///ADMIN DASHBOARD LAYOUT
exports.dashboardListUsers = async (req, res, next) => {
    //DASHBOARD USER
    //GET REQUEST
    //http://localhost:2000/api/auth/dashboard-list-users
    //http://localhost:2000/api/auth/dashboard-list-users?page=1&size=4

    let { page, size } = req.query;

    if(!page) page = 1;
    if(!size) size = 10;

    page = parseInt(page);
    size = parseInt(size);

    const limit = size;
    const skip = (page - 1) * size;

    try {
        const adminArray = [];
        const paidArray = [];

        const users = await UserModel.find({})
        .select(`-password -__v -updatedAt -following -followers -recentlySearchedBook 
        -recentlyPlayedPodcast -booksRead -library -books -createdAt`)
        .limit(limit)
        .skip(skip);

       const userCounts = await UserModel.find({});
       
        
        userCounts.map((user) => {
            if(user.roles[0] === 'admin') adminArray.push(user.roles[0]);

            if(user.isPaid) paidArray.push(user.isPaid);
        });

        const adminData = {
            totalRecords: userCounts.length,
            adminCounts: adminArray.length,
            paidUserCounts: paidArray.length,
            page,
            size,
            users: users
        }

        return res.status(200).send(adminData)
        
    } catch (error) {
        return res.status(500).send({ message: error.message });
    }
}

exports.findUserByEmail = async (req, res, next) => {
    const email = req.body.email;

    try {
        const user = await UserModel.findOne({email}).select(`-password -__v -updatedAt `);
        if(!user) return res.status(404).send({error: "User not found"});

        return res.status(200).send(user);

    } catch (error) {
        return res.status(500).send({ message: error.message });
    }
}

exports.memberShip = async (req, res, next) => {

    //DASHBOARD MEMBERSHIP
    //GET REQUEST
    //http://localhost:2000/api/auth/dashboard-membership

    try {

        const goldPlan = [];
        const silverPlan = [];

        const users = await UserModel.find({}).select(`-password -__v -updatedAt -following -followers -recentlySearchedBook 
        -recentlyPlayedPodcast -booksRead -library `).limit(5);

        const membership2 = await UserModel.find({});

        membership2.map((member) => {

            if(member.membershipPlan === "goldPlan") {
                goldPlan.push(member.membershipPlan);
            }

            if(member.membershipPlan === "silverPlan") {
                silverPlan.push(member.membershipPlan);
            }

        });

        const adminData = {
            goldMemberCounts: goldPlan.length,
            silverMemberCount: silverPlan.length,
            totalMembershipCount: membership2.length,
            membershipRevenue: '',
            users
        }

        return res.status(200).send(adminData);

    } catch (error) {
        return res.status(500).send({ message: error.message });
    }
}

exports.blockUser = async (req, res, next) => {
    const userId = req.body.userId;

    try {
        if(!mongoose.Types.ObjectId(userId)){
            return res.status(400).json({ error: "Invalid user ID"})
        }
        const blockedUser = await UserModel.findByIdAndUpdate(userId, { $set: { blocked: true } }, { new: true});
        if(!blockedUser) {
            return res.status(400).json({ error: "Unable to block user"});
        }
        return res.status(200).json({ message: "User blocked successfully"});
    
    } catch (error) {
        return res.status(500).json({ error: error.message })
    }
}

exports.unblockUser = async (req, res, next) => {
    const userId = req.body.userId;

    try {
        if(!mongoose.Types.ObjectId(userId)){
            return res.status(400).json({ error: "Invalid user ID"})
        }
        const blockedUser = await UserModel.findByIdAndUpdate(userId, 
            { $set: { blocked: false } }, { new: true}).select("_id fullname email phonenumber createdAt ")
        if(!blockedUser) {
            return res.status(400).json({ error: "Unable to block user"});
        }
        return res.status(200).json({ message: "User unblocked successfully"});
    
    } catch (error) {
        return res.status(500).json({ error: error.message })
    }
}



exports.listblockedUsers = async (req, res, next) => {
    try {
        let { page, size } = req.query;

        if(!page) page = 1;
        if(!size) size = 10;
    
        page = parseInt(page);
        size = parseInt(size);
    
        const limit = size;
        const skip = (page - 1) * size;

        const blockedUsers = await UserModel.find({blocked: {$eq: true }} )
        .select("_id fullname email phonenumber createdAt ")
        .limit(limit)
        .skip(skip);

        if(!blockedUsers) {
            return res.status(400).json({ error: "No blocked user(s) found!"});
        }
        return res.status(200).json(blockedUsers);
    
    } catch (error) {
        return res.status(500).json({ error: error.message })
    }
}

exports.showblockedUser = async (req, res, next) => {
    const userId = req.body.userId;

    try {
        if(!mongoose.Types.ObjectId(userId)){
            return res.status(400).json({ error: "Invalid user ID"})
        }
        const foundBlockedUser = await UserModel.findOne({_id: userId, blocked: { $eq: true} }).select("_id fullname email phonenumber createdAt ");
        if(!foundBlockedUser) {
            return res.status(400).json({ error: "No blocked user found"});
        }
        return res.status(200).json(foundBlockedUser);
    
    } catch (error) {
        return res.status(500).json({ error: error.message })
    }
}

exports.findUser = async (req, res, next) => {
    const userId = req.body.userId;

    try {
        if(!mongoose.Types.ObjectId(userId)){
            return res.status(400).json({ error: "Invalid user ID"})
        }
        const findUser = await UserModel.findById(userId).select("_id fullname email phonenumber profileImage blocked roles createdAt ");
        if(!findUser) {
            return res.status(400).json({ error: "User not found"});
        }
        return res.status(200).json(findUser);
    
    } catch (error) {
        return res.status(500).json({ error: error.message })
    }
}

exports.allUsers = async (req, res, next) => {
    const userId = req.body.userId;
    let { page, size } = req.query;

    if(!page) page = 1;
    if(!size) size = 10;

    page = parseInt(page);
    size = parseInt(size);

    const limit = size;
    const skip = (page - 1) * size;

    try {


        if(!mongoose.Types.ObjectId(userId)){
            return res.status(400).json({ error: "Invalid user ID"})
        }
        const findUsers = await UserModel.find({})
        .select("_id fullname email phonenumber profileImage blocked roles createdAt")
        .limit(limit)
        .skip(skip);
        
        if(!findUsers) {
            return res.status(400).json({ error: "No user(s) found"});
        }
        return res.status(200).json(findUsers);
    
    } catch (error) {
        return res.status(500).json({ error: error.message })
    }
}
