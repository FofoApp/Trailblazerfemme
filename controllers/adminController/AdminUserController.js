
//const User = require('./../models/UserModel');
const UserModel = require('./../../models/UserModel');



///ADMIN DASHBOARD LAYOUT
exports.dashboardListUsers = async (req, res, next) => {
    //DASHBOARD USER
    //GET REQUEST
    //http://localhost:2000/api/auth/dashboard-list-users

    try {
        const adminArray = [];
        const paidArray = [];

        const users = await UserModel.find({}).select(`-password -__v -updatedAt -following -followers -recentlySearchedBook 
        -recentlyPlayedPodcast -booksRead -library -books -createdAt`).limit(5);
        
        users.map((user) => {
            if(user.roles[0] === 'admin') adminArray.push(user.roles[0]);

            if(user.isPaid) paidArray.push(user.isPaid);
        });

        const adminData = {
            userCounts: users.length,
            adminCounts: adminArray.length,
            paidUserCounts: paidArray.length,
            users: users
        }

        return res.status(200).send(adminData)
        
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