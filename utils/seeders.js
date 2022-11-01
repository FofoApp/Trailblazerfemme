require('./../initDB')();
const dotenv = require('dotenv').config();

const UserModel = require('./../models/UserModel');

const users = require('./../data/user')



const seedUsers = async () => {

    try {
        
        await UserModel.deleteMany();

        console.log("Users deleted successfully")

        await UserModel.insertMany(users.users);

        console.log("Users seeded successfully")

        process.exit();

    } catch (error) {

        console.log(error.message);
        process.exit();

    }
}


seedUsers();

