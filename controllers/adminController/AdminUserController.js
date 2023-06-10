const mongoose = require('mongoose');
const _ = require('lodash');
//const User = require('./../models/UserModel');
const UserModel = require('./../../models/UserModel');


exports.manuallyCreateAdmin = async (req, res, next) => {
    try {

        const user = await UserModel.create({
            fullname: "",
            email: "",
            phonenumber: "",
            field: "null",
            isMembershipActive: true,
            membershipName: "null",
            membershipId:"null",
            communityId: "null",
        
            // subscription_end_date: { type: Date,  },
            // subscription_start_date: { type: Date,   },
            // days_between_next_payment: { type: Number, }, 
        
            subscriptionId: "null",
            membershipType: 'Free',
            isActive: true,
            paid: true,
            amount: 0, 
            password: "password2023@3!",
            accountVerified: true,
        
            about: "Admin",
            cityState: "null",
            roles: 'admin',
            isAdmin: true,
        })
        return res.status(201).json({ status: 'success', message: 'Admin created successfully' })
    } catch (error) {
        return res.status(500).json({ error: error?.message })
    }
}


exports.manuallyUpgradeToAdmin = async (req, res, next) => {

    const { userId, email } = req.body;

    const adminUser = req.user;

    try {

        if(!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(404).json({ status: 'failed', message: `Invalid user id` })
        }

        if(!mongoose.Types.ObjectId.isValid(adminUser?.id)) {
            return res.status(404).json({ status: 'failed', message: `Invalid admin id` })
        }
  
        let user = await UserModel.findOne({ _id: userId, email });

        if(user?.id?.toString() === adminUser?.id ) {
            return res.status(404).json({ status: 'failed', message: `You can't upgrade yourself to admin` })
        }

        if(!user) {
            return res.status(404).json({ status: 'failed', message: `User with email: ${email} was not found` })
        }

        user.isAdmin = true;
        user.roles = [];
        user.roles.push('admin');

        const updatedAdmin = await user.save();

        if(!updatedAdmin) {
            return res.status(400).json({ status: 'failed', message: `Unable to update admin` });
        }

        return res.status(200).json({ status: 'success', message: `User ${email} is now an admin` });

    } catch (error) {
        return res.status(500).json({ status: 'failed', message: `Server error updating admin` });
    }
}


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
        .select(`-updatedAt -following -followers -recentlySearchedBook 
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
        const user = await UserModel.findOne({email}).select(`-updatedAt `);
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

        const users = await UserModel.find({}).select(`-updatedAt -following -followers -recentlySearchedBook 
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

    const userId = req?.body?.userId;

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
        return res.status(500).json({ error: error?.message })
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
