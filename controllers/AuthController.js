const fs = require('fs');
require('dotenv').config();
var request = require('request');
const createError = require('http-errors');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const JWT = require('jsonwebtoken');
const { cloudinary } = require('./../helpers/cloudinary');
const sdk = require('api')('@sendchamp/v1.0#1v843jkyvjm1me');
const { sendMail } =  require('./../helpers/sendMail')

const { 
    registerValidation,
    loginValidation,
    resetPasswordSchema,
    passwordOnlySchema,
    otpValidation
} = require('../validations/userValidationSchema');
const User = require('./../models/UserModel');
const Otpmodel = require('../models/OtpModel');
const RefreshAccessToken = require('./../models/RefreshAccessTokenModel');
const { signInAccessToken, signInRefreshToken, verifyRefreshToken, resetPasswordToken } = require('./../helpers/jwtHelper');
const { generateFourDigitsOTP } = require('./../helpers/otpGenerator');


const { sendGridMail } = require('./../helpers/sendGridMessaging');
const { sendSMS } = require('./../helpers/twilioSMS');
const FollowersAndFollowingModel = require('./../models/FollowersAndFollowingModel');
const Membership = require('../models/adminModel/AdminMembershipModel');
const MembershipSubscriber = require('../models/membershipModel/MembershipSubscribersModel');


const { calculateNextPayment }  = require('./../helpers/billing');
const { getFirstName } = require('../helpers/splitName');

// const runCron = require('../runCron')
const moment = require('moment');

// runCron();


exports.createDefaultAdmin = async (req, res, next) => {

    // try {

    //     const users = await User.insertMany(
    //         [
    //             {
    //               _id:  new mongoose.Types.ObjectId('639f550ae29410c2630e5707'),
    //               fullname: "Billy Doe",
    //               email: "billydoe@gmail.com",
    //               phonenumber: "+2347065066382",
    //               field: "Freemium",
    //               blocked: false,
    //               isMembershipActive: false,
    //               membershipType: "Free",
    //               isActive: false,
    //               paid: false,
    //               amount: 0,
    //               password: "$2b$10$gJzQi9OCMBJjzO.9JsCSxuIbj1k7bmtxlHW/McU1iFQr8vmZH65mW",
    //               accountVerified: false,
    //               roles: [
    //                 "admin"
    //               ],
    //               createdAt: "2022-12-18T17:59:38.172Z",
    //               updatedAt: "2023-06-16T20:20:03.490Z",
    //               isAdmin: false,
    //               location: "Location",
    //               days_between_next_payment: "0",
    //               subscription_end_date: "2023-06-14T21:55:33.290Z",
    //               subscription_start_date: "2023-06-14T21:55:33.290Z",
    //               about: "",
    //               books: [],
    //               booksRead: [],
    //               chargeId: "",
    //               city: "",
    //               cityState: "",
    //               followers: [],
    //               following: [],
    //               jobTitle: "",
    //               library: [],
    //               membershipName: "Free",
    //               membershipSubscriberId: [],
    //               profileImage: "",
    //               profileImageCloudinaryPublicId: "",
    //               recentlyPlayedPodcast: [],
    //               recentlySearchedBook: [],
    //               socialLinks: [],
    //               state: "",
    //               trending: []
    //             },
    //             {
    //               _id: new mongoose.Types.ObjectId('63e76625c2ccc8256aa9dc13'),
    //               fullname: "Fofo2",
    //               email: "fofo@mofoluwaso.com",
    //               phonenumber: "61 435 255 233",
    //               field: "Business (Management and administration)",
    //               blocked: false,
    //               isMembershipActive: false,
    //               membershipType: "Free",
    //               isActive: false,
    //               paid: false,
    //               amount: 0,
    //               password: "$2b$10$BdEmbDvDaHcjkD5WRIirfOo9Zkf5DZ1oXTWosisOJq0YTyuHVuDVa",
    //               accountVerified: false,
    //               roles: [
    //                 "user"
    //               ],
    //               createdAt: "2023-02-11T09:55:49.931Z",
    //               updatedAt: "2023-06-16T20:20:03.641Z",
    //               isAdmin: false,
    //               location: "Location",
    //               days_between_next_payment: "0",
    //               subscription_end_date: "2023-06-14T21:55:33.290Z",
    //               subscription_start_date: "2023-06-14T21:55:33.290Z",
    //               about: "",
    //               books: [],
    //               booksRead: [],
    //               chargeId: "",
    //               city: "",
    //               cityState: "",
    //               followers: [],
    //               following: [],
    //               jobTitle: "",
    //               library: [],
    //               membershipName: "Free",
    //               membershipSubscriberId: [],
    //               profileImage: "",
    //               profileImageCloudinaryPublicId: "",
    //               recentlyPlayedPodcast: [],
    //               recentlySearchedBook: [],
    //               socialLinks: [],
    //               state: "",
    //               trending: []
    //             },
    //             {
    //               _id: new mongoose.Types.ObjectId('644c0d17cbc00696bbfc3d49'),
    //               fullname: "Adekunle akin",
    //               email: "ilelaboyealekan+11@gmail.com",
    //               phonenumber: "2348102721332",
    //               field: "",
    //               blocked: false,
    //               isMembershipActive: false,
    //               membershipType: "Free",
    //               isActive: false,
    //               paid: false,
    //               amount: 0,
    //               password: "$2b$10$fqrKTkKR/ECtFxN7EVGN6.IPfCASOspXWXTTuLJWW/0HWzbB2JFkS",
    //               accountVerified: true,
    //               roles: [
    //                 "user"
    //               ],
    //               createdAt: "2023-04-28T18:14:47.164Z",
    //               updatedAt: "2023-06-16T20:20:03.820Z",
    //               isAdmin: false,
    //               location: "Location",
    //               city: "Ikeja",
    //               profileImage: "https://res.cloudinary.com/trailblazerfemme-app/image/upload/v1682705714/dhnm2yg0zch0qbdugz3o.jpg",
    //               profileImageCloudinaryPublicId: "dhnm2yg0zch0qbdugz3o",
    //               state: "Lagos",
    //               days_between_next_payment: "0",
    //               subscription_end_date: "2023-06-14T21:55:33.290Z",
    //               subscription_start_date: "2023-06-14T21:55:33.290Z",
    //               recentlySearchedBook: [
    //                 "63a0ebfd63e579c533160dd5"
    //               ],
    //               about: "",
    //               books: [],
    //               booksRead: [],
    //               chargeId: "",
    //               cityState: "",
    //               followers: [],
    //               following: [],
    //               jobTitle: "",
    //               library: [],
    //               membershipName: "Free",
    //               membershipSubscriberId: [],
    //               recentlyPlayedPodcast: [],
    //               socialLinks: [],
    //               trending: []
    //             },
    //             {
    //               _id: new mongoose.Types.ObjectId('644c3af7f2197e1b5fbfa4e6'),
    //               fullname: "Adekunle lekan",
    //               email: "ilelaboyealekan+12@gmail.com",
    //               phonenumber: "2348102721327",
    //               field: "Law and Public policy",
    //               blocked: false,
    //               isMembershipActive: false,
    //               membershipType: "Free",
    //               isActive: false,
    //               paid: false,
    //               amount: 0,
    //               password: "$2b$10$FG7YP5GqX1jHvdkJ9dRTlOxa6pHY7L8HLYEqlnArtzu4izJpZmC4a",
    //               accountVerified: true,
    //               roles: [
    //                 "user"
    //               ],
    //               createdAt: "2023-04-28T21:30:31.454Z",
    //               updatedAt: "2023-06-16T20:20:03.972Z",
    //               isAdmin: false,
    //               location: "Location",
    //               profileImage: "https://res.cloudinary.com/trailblazerfemme-app/image/upload/v1682717673/kvyyxfwejdjl3btwgj78.jpg",
    //               profileImageCloudinaryPublicId: "kvyyxfwejdjl3btwgj78",
    //               days_between_next_payment: "0",
    //               subscription_end_date: "2023-06-14T21:55:33.290Z",
    //               subscription_start_date: "2023-06-14T21:55:33.290Z",
    //               about: "",
    //               books: [],
    //               booksRead: [],
    //               chargeId: "",
    //               city: "",
    //               cityState: "",
    //               followers: [],
    //               following: [],
    //               jobTitle: "",
    //               library: [],
    //               membershipName: "Free",
    //               membershipSubscriberId: [],
    //               recentlyPlayedPodcast: [],
    //               recentlySearchedBook: [],
    //               socialLinks: [],
    //               state: "",
    //               trending: []
    //             },
    //             {
    //               _id: new mongoose.Types.ObjectId('6471eac2794d5483a7f8fce5'),
    //               fullname: "Dunsin Fatuase",
    //               email: "dunsinfatuase@gmail.com",
    //               phonenumber: "447561861091",
    //               field: "Education",
    //               blocked: false,
    //               isMembershipActive: false,
    //               membershipType: "Free",
    //               isActive: false,
    //               paid: false,
    //               amount: 0,
    //               password: "$2b$10$RNrUCQpOpbkBr3zes2EJ0e1wjM74dAezyUiGEg6R9ZmEw2qGmPJpe",
    //               accountVerified: false,
    //               roles: [
    //                 "user"
    //               ],
    //               createdAt: "2023-05-27T11:34:26.034Z",
    //               updatedAt: "2023-06-16T20:20:04.124Z",
    //               isAdmin: false,
    //               location: "Location",
    //               profileImage: "https://res.cloudinary.com/trailblazerfemme-app/image/upload/v1685187424/f0gg2gwooojxbeujscao.jpg",
    //               profileImageCloudinaryPublicId: "f0gg2gwooojxbeujscao",
    //               days_between_next_payment: "0",
    //               subscription_end_date: "2023-06-14T21:55:33.290Z",
    //               subscription_start_date: "2023-06-14T21:55:33.290Z",
    //               about: "",
    //               books: [],
    //               booksRead: [],
    //               chargeId: "",
    //               city: "",
    //               cityState: "",
    //               followers: [],
    //               following: [],
    //               jobTitle: "",
    //               library: [],
    //               membershipName: "Free",
    //               membershipSubscriberId: [],
    //               recentlyPlayedPodcast: [],
    //               recentlySearchedBook: [],
    //               socialLinks: [],
    //               state: "",
    //               trending: []
    //             },
    //             {
    //               _id: new mongoose.Types.ObjectId('648219296811ccc487f204bb'),
    //               fullname: "Ajani Elizabeth",
    //               email: "ilelaboyealekan+20@gmail.com",
    //               phonenumber: "2348100222333",
    //               field: "Arts (Culture and entertainment)",
    //               blocked: false,
    //               isMembershipActive: false,
    //               membershipType: "Free",
    //               isActive: false,
    //               paid: false,
    //               amount: 0,
    //               password: "$2b$10$NOoXcYfyQLLo77cdMgKG4eH0M1L4F14H2XaqI1ts0FLfRBOYmvXqS",
    //               accountVerified: true,
    //               roles: [
    //                 "user"
    //               ],
    //               createdAt: "2023-06-08T18:08:41.086Z",
    //               updatedAt: "2023-06-16T20:20:03.279Z",
    //               isAdmin: false,
    //               location: "Location",
    //               profileImage: "https://res.cloudinary.com/trailblazerfemme-app/image/upload/v1686247913/u7et1z48l7rb9nguzpw7.jpg",
    //               profileImageCloudinaryPublicId: "u7et1z48l7rb9nguzpw7",
    //               days_between_next_payment: "0",
    //               subscription_end_date: "2023-06-14T21:55:33.290Z",
    //               subscription_start_date: "2023-06-14T21:55:33.290Z",
    //               about: "",
    //               books: [],
    //               booksRead: [],
    //               chargeId: "",
    //               city: "",
    //               cityState: "",
    //               followers: [],
    //               following: [],
    //               jobTitle: "",
    //               library: [],
    //               membershipName: "Free",
    //               membershipSubscriberId: [],
    //               recentlyPlayedPodcast: [],
    //               recentlySearchedBook: [],
    //               socialLinks: [],
    //               state: "",
    //               trending: []
    //             },
    //             {
    //               _id: new mongoose.Types.ObjectId('639f4e3a105fb65f4fce6f0a'),
    //               fullname: "Ilelaboye lekan",
    //               email: "ilelaboyealekan@gmail.com",
    //               jobTitle: "developer",
    //               phonenumber: "2348102721331",
    //               blocked: false,
    //               isMembershipActive: true,
    //               membershipName: "Free",
    //               membershipType: "Free",
    //               isActive: true,
    //               paid: true,
    //               amount: 0,
    //               password: "$2b$10$y967vPhwdpiCK/cwIrnVWefSmJ71LIg3qWB/lJfITiggDOKyDPdDS",
    //               accountVerified: true,
    //               roles: [
    //                 "admin"
    //               ],
    //               createdAt: "2022-12-18T17:30:34.988Z",
    //               updatedAt: "2023-06-16T20:20:03.446Z",
    //               isAdmin: true,
    //               location: "Location",
    //               city: "ikeja",
    //               profileImage: "https://res.cloudinary.com/trailblazerfemme-app/image/upload/v1671384692/hywclrz0xd0u2ryfawsk.jpg",
    //               profileImageCloudinaryPublicId: "hywclrz0xd0u2ryfawsk",
    //               state: "Lagos",
    //               days_between_next_payment: "0",
    //               subscription_end_date: "2023-06-14T21:55:33.290Z",
    //               subscription_start_date: "2023-06-14T21:55:33.290Z",
    //               field: "",
    //               about: "",
    //               books: [],
    //               booksRead: [],
    //               chargeId: "",
    //               cityState: "",
    //               followers: [],
    //               following: [],
    //               library: [],
    //               membershipSubscriberId: [],
    //               recentlyPlayedPodcast: [],
    //               recentlySearchedBook: [],
    //               socialLinks: [],
    //               trending: []
    //             },
    //             {
    //               _id:  new mongoose.Types.ObjectId('639f54bf6dd34b5b3da86dfe'),
    //               fullname: "Adewale Ayomiposi",
    //               email: "aphilemon.aa@gmail.com",
    //               phonenumber: "08115861198",
    //               field: "Freemium",
    //               blocked: false,
    //               isMembershipActive: false,
    //               membershipType: "Free",
    //               isActive: false,
    //               paid: false,
    //               amount: 0,
    //               password: "$2b$10$c7NAZ957rKFTdyY6A3DY0.86WfMBLa69LRSYxbvxeOARsdyhV9.Rm",
    //               accountVerified: true,
    //               roles: [
    //                 "admin"
    //               ],
    //               createdAt: "2022-12-18T17:58:23.642Z",
    //               updatedAt: "2023-06-16T20:20:03.608Z",
    //               isAdmin: true,
    //               location: "Location",
    //               days_between_next_payment: "0",
    //               subscription_end_date: "2023-06-14T21:55:33.290Z",
    //               subscription_start_date: "2023-06-14T21:55:33.290Z",
    //               about: "",
    //               books: [],
    //               booksRead: [],
    //               chargeId: "",
    //               city: "",
    //               cityState: "",
    //               followers: [],
    //               following: [],
    //               jobTitle: "",
    //               library: [],
    //               membershipName: "Free",
    //               membershipSubscriberId: [],
    //               profileImage: "",
    //               profileImageCloudinaryPublicId: "",
    //               recentlyPlayedPodcast: [],
    //               recentlySearchedBook: [],
    //               socialLinks: [],
    //               state: "",
    //               trending: []
    //             },
    //             {
    //               _id: new mongoose.Types.ObjectId('643597ee8dae8ef97c87706d'),
    //               fullname: "jide adeyem",
    //               email: "ola@gmail.com",
    //               phonenumber: "2348102721332",
    //               field: "Freemium",
    //               blocked: false,
    //               isMembershipActive: false,
    //               membershipType: "Free",
    //               isActive: false,
    //               paid: false,
    //               amount: 0,
    //               password: "$2b$10$PtwHUrw37/NT6HRNp8du1up1/JSQ8Wnb0aPFEiCsAzk5Y/ehpc6Ye",
    //               accountVerified: false,
    //               roles: [
    //                 "user"
    //               ],
    //               createdAt: "2023-04-11T17:25:03.135Z",
    //               updatedAt: "2023-06-16T20:20:03.762Z",
    //               isAdmin: false,
    //               location: "Location",
    //               days_between_next_payment: "0",
    //               subscription_end_date: "2023-06-14T21:55:33.290Z",
    //               subscription_start_date: "2023-06-14T21:55:33.290Z",
    //               about: "",
    //               books: [],
    //               booksRead: [],
    //               chargeId: "",
    //               city: "",
    //               cityState: "",
    //               followers: [],
    //               following: [],
    //               jobTitle: "",
    //               library: [],
    //               membershipName: "Free",
    //               membershipSubscriberId: [],
    //               profileImage: "",
    //               profileImageCloudinaryPublicId: "",
    //               recentlyPlayedPodcast: [],
    //               recentlySearchedBook: [],
    //               socialLinks: [],
    //               state: "",
    //               trending: []
    //             },
    //             {
    //               _id: new mongoose.Types.ObjectId('64380daadb267a1af7fe3cc1'),
    //               fullname: "emmai",
    //               email: "emma@gmail.com",
    //               phonenumber: "2233344412",
    //               field: "Law and Public policy",
    //               blocked: false,
    //               isMembershipActive: false,
    //               membershipType: "Free",
    //               isActive: false,
    //               paid: false,
    //               amount: 0,
    //               password: "$2b$10$7AeVKABpF1NigGUWVIeHzeeUaUP8hAJwoJ5nnmBaqr0GkKuRaa0t6",
    //               accountVerified: false,
    //               roles: [
    //                 "user"
    //               ],
    //               createdAt: "2023-04-13T14:11:54.646Z",
    //               updatedAt: "2023-06-16T20:20:03.916Z",
    //               isAdmin: false,
    //               location: "Location",
    //               days_between_next_payment: "0",
    //               subscription_end_date: "2023-06-14T21:55:33.290Z",
    //               subscription_start_date: "2023-06-14T21:55:33.290Z",
    //               about: "",
    //               books: [],
    //               booksRead: [],
    //               chargeId: "",
    //               city: "",
    //               cityState: "",
    //               followers: [],
    //               following: [],
    //               jobTitle: "",
    //               library: [],
    //               membershipName: "Free",
    //               membershipSubscriberId: [],
    //               profileImage: "",
    //               profileImageCloudinaryPublicId: "",
    //               recentlyPlayedPodcast: [],
    //               recentlySearchedBook: [],
    //               socialLinks: [],
    //               state: "",
    //               trending: []
    //             },
    //             {
    //               _id: new mongoose.Types.ObjectId('643814e7737b72782015cd61'),
    //               fullname: "Ilelaboye olalekan",
    //               email: "ilelaboyealekan+1@gmail.com",
    //               jobTitle: "developer",
    //               phonenumber: "2348102721331",
    //               field: "Human Resources",
    //               blocked: false,
    //               isMembershipActive: false,
    //               membershipType: "Free",
    //               isActive: false,
    //               paid: false,
    //               amount: 0,
    //               password: "$2b$10$SByg9VJCuu6XhgFT7LtEKO8CjEux5rm25OC4vDuEZb/25pUYT8T26",
    //               accountVerified: true,
    //               roles: [
    //                 "user"
    //               ],
    //               createdAt: "2023-04-13T14:42:47.374Z",
    //               updatedAt: "2023-06-16T20:20:04.071Z",
    //               isAdmin: false,
    //               location: "Location",
    //               city: "ikeja",
    //               state: "Lagos",
    //               days_between_next_payment: "0",
    //               subscription_end_date: "2023-06-14T21:55:33.290Z",
    //               subscription_start_date: "2023-06-14T21:55:33.290Z",
    //               socialLinks: [
    //                 "adweffe"
    //               ],
    //               about: "",
    //               books: [],
    //               booksRead: [],
    //               chargeId: "",
    //               cityState: "",
    //               followers: [],
    //               following: [],
    //               library: [],
    //               membershipName: "Free",
    //               membershipSubscriberId: [],
    //               profileImage: "",
    //               profileImageCloudinaryPublicId: "",
    //               recentlyPlayedPodcast: [],
    //               recentlySearchedBook: [],
    //               trending: []
    //             },
    //             {
    //               _id: new mongoose.Types.ObjectId('64399a91a8a0380feb7341f4'),
    //               fullname: "Dunsin",
    //               email: "dman.fot@gmail.com",
    //               phonenumber: "1LackNothing*",
    //               field: "Freemium",
    //               blocked: false,
    //               isMembershipActive: false,
    //               membershipType: "Free",
    //               isActive: false,
    //               paid: true,
    //               amount: 0,
    //               password: "$2b$10$TN8kaH1fchd6/oWgo1TzZuCOAvRUjnclGPUTgdWco.UaJmAJ7IN5m",
    //               accountVerified: true,
    //               roles: [
    //                 "admin"
    //               ],
    //               createdAt: "2023-04-14T18:25:21.254Z",
    //               updatedAt: "2023-06-16T20:20:04.243Z",
    //               isAdmin: false,
    //               location: "Location",
    //               days_between_next_payment: "0",
    //               subscription_end_date: "2023-06-14T21:55:33.290Z",
    //               subscription_start_date: "2023-06-14T21:55:33.290Z",
    //               about: "",
    //               books: [],
    //               booksRead: [],
    //               chargeId: "",
    //               city: "",
    //               cityState: "",
    //               followers: [],
    //               following: [],
    //               jobTitle: "",
    //               library: [],
    //               membershipName: "Free",
    //               membershipSubscriberId: [],
    //               profileImage: "",
    //               profileImageCloudinaryPublicId: "",
    //               recentlyPlayedPodcast: [],
    //               recentlySearchedBook: [],
    //               socialLinks: [],
    //               state: "",
    //               trending: []
    //             },
    //             {
    //               _id: new mongoose.Types.ObjectId('63a0d3afa28365f0e719b0e4'),
    //               fullname: "TBF Admin",
    //               email: "trailblazer.fem@gmail.com",
    //               phonenumber: "+447561861091",
    //               field: "Freemium",
    //               blocked: false,
    //               isMembershipActive: false,
    //               membershipType: "Free",
    //               isActive: false,
    //               paid: false,
    //               amount: 0,
    //               password: "$2b$10$d5I5QDxKGyxO.thE10Qn/uVmhontGy1JnqW1PRP5YzxxNjWamSnNe",
    //               accountVerified: false,
    //               roles: [
    //                 "admin"
    //               ],
    //               createdAt: "2022-12-19T21:12:15.386Z",
    //               updatedAt: "2023-06-16T20:20:03.353Z",
    //               isAdmin: true,
    //               location: "Location",
    //               days_between_next_payment: "0",
    //               subscription_end_date: "2023-06-14T21:55:33.290Z",
    //               subscription_start_date: "2023-06-14T21:55:33.290Z",
    //               about: "",
    //               books: [],
    //               booksRead: [],
    //               chargeId: "",
    //               city: "",
    //               cityState: "",
    //               followers: [],
    //               following: [],
    //               jobTitle: "",
    //               library: [],
    //               membershipName: "Free",
    //               membershipSubscriberId: [],
    //               profileImage: "",
    //               profileImageCloudinaryPublicId: "",
    //               recentlyPlayedPodcast: [],
    //               recentlySearchedBook: [],
    //               socialLinks: [],
    //               state: "",
    //               trending: []
    //             },
    //             {
    //               _id: new mongoose.Types.ObjectId('63a40794768844c0eeb34d1f'),
    //               fullname: "Fofo1",
    //               email: "fofoilev@gmail.com",
    //               phonenumber: "61 435 255 233",
    //               field: "Technology",
    //               blocked: false,
    //               isMembershipActive: false,
    //               membershipType: "Free",
    //               isActive: false,
    //               paid: false,
    //               amount: 0,
    //               password: "$2b$10$vd4Capt4eUuOD/mOwotQIO.sdPkmS8zmT0UAfWQVPBww3pC8FQYIe",
    //               accountVerified: false,
    //               roles: [
    //                 "user"
    //               ],
    //               createdAt: "2022-12-22T07:30:28.907Z",
    //               updatedAt: "2023-06-16T20:20:03.507Z",
    //               isAdmin: false,
    //               location: "Location",
    //               days_between_next_payment: "0",
    //               subscription_end_date: "2023-06-14T21:55:33.290Z",
    //               subscription_start_date: "2023-06-14T21:55:33.290Z",
    //               about: "",
    //               books: [],
    //               booksRead: [],
    //               chargeId: "",
    //               city: "",
    //               cityState: "",
    //               followers: [],
    //               following: [],
    //               jobTitle: "",
    //               library: [],
    //               membershipName: "Free",
    //               membershipSubscriberId: [],
    //               profileImage: "",
    //               profileImageCloudinaryPublicId: "",
    //               recentlyPlayedPodcast: [],
    //               recentlySearchedBook: [],
    //               socialLinks: [],
    //               state: "",
    //               trending: []
    //             },
    //             {
    //               _id: new mongoose.Types.ObjectId('643803b0cc67c6fff9172ed6'),
    //               fullname: "ojo",
    //               email: "jss@gmail.com",
    //               phonenumber: "222331123",
    //               field: "Health and Medicine",
    //               blocked: false,
    //               isMembershipActive: false,
    //               membershipType: "Free",
    //               isActive: false,
    //               paid: false,
    //               amount: 0,
    //               password: "$2b$10$zeHGdZTudV/LI.DyCeGE7eUfnixwI7Td7hiWqCAdzgINiJt2Zdd62",
    //               accountVerified: false,
    //               roles: [
    //                 "user"
    //               ],
    //               createdAt: "2023-04-13T13:29:20.680Z",
    //               updatedAt: "2023-06-16T20:20:03.667Z",
    //               isAdmin: false,
    //               location: "Location",
    //               days_between_next_payment: "0",
    //               subscription_end_date: "2023-06-14T21:55:33.290Z",
    //               subscription_start_date: "2023-06-14T21:55:33.290Z",
    //               about: "",
    //               books: [],
    //               booksRead: [],
    //               chargeId: "",
    //               city: "",
    //               cityState: "",
    //               followers: [],
    //               following: [],
    //               jobTitle: "",
    //               library: [],
    //               membershipName: "Free",
    //               membershipSubscriberId: [],
    //               profileImage: "",
    //               profileImageCloudinaryPublicId: "",
    //               recentlyPlayedPodcast: [],
    //               recentlySearchedBook: [],
    //               socialLinks: [],
    //               state: "",
    //               trending: []
    //             },
    //             {
    //               _id:  new mongoose.Types.ObjectId('64382cad7b6ab00b6eee9191'),
    //               fullname: "Ilelaboye adigun",
    //               email: "ilelaboyealekan+2@gmail.com",
    //               phonenumber: "2348102721331",
    //               field: "Law and Public policy",
    //               blocked: false,
    //               isMembershipActive: false,
    //               membershipType: "Free",
    //               isActive: true,
    //               paid: false,
    //               amount: 0,
    //               password: "$2b$10$xHkWltyZkwNRyESV33Z.Kej7ZqFM3e1k6b1gBtWcj81CaRV8/KFK.",
    //               accountVerified: true,
    //               roles: [
    //                 "user"
    //               ],
    //               createdAt: "2023-04-13T16:24:13.658Z",
    //               updatedAt: "2023-06-16T20:20:03.835Z",
    //               isAdmin: false,
    //               location: "Location",
    //               days_between_next_payment: "0",
    //               subscription_end_date: "2023-06-14T21:55:33.290Z",
    //               subscription_start_date: "2023-06-14T21:55:33.290Z",
    //               about: "",
    //               books: [],
    //               booksRead: [],
    //               chargeId: "",
    //               city: "",
    //               cityState: "",
    //               followers: [],
    //               following: [],
    //               jobTitle: "",
    //               library: [],
    //               membershipName: "Free",
    //               membershipSubscriberId: [],
    //               profileImage: "",
    //               profileImageCloudinaryPublicId: "",
    //               recentlyPlayedPodcast: [],
    //               recentlySearchedBook: [],
    //               socialLinks: [],
    //               state: "",
    //               trending: []
    //             },
    //             {
    //               _id: new mongoose.Types.ObjectId('644568e7210241a0a01b7dec'),
    //               fullname: "OKEKE",
    //               email: "okeke2@gmail.com",
    //               phonenumber: "2347065066382",
    //               field: "Freemium",
    //               blocked: false,
    //               isMembershipActive: false,
    //               membershipType: "Free",
    //               isActive: false,
    //               paid: false,
    //               amount: 0,
    //               password: "$2b$10$JVQBmnAqLJisy1EJMzfMw.IxnsDSJ7q1MBNHhLuiKOWHnRkRBkYDC",
    //               accountVerified: true,
    //               roles: [
    //                 "admin"
    //               ],
    //               createdAt: "2023-04-23T17:20:39.460Z",
    //               updatedAt: "2023-06-16T20:20:03.998Z",
    //               isAdmin: false,
    //               location: "Location",
    //               days_between_next_payment: "0",
    //               subscription_end_date: "2023-06-14T21:55:33.290Z",
    //               subscription_start_date: "2023-06-14T21:55:33.290Z",
    //               about: "",
    //               books: [],
    //               booksRead: [],
    //               chargeId: "",
    //               city: "",
    //               cityState: "",
    //               followers: [],
    //               following: [],
    //               jobTitle: "",
    //               library: [],
    //               membershipName: "Free",
    //               membershipSubscriberId: [],
    //               profileImage: "",
    //               profileImageCloudinaryPublicId: "",
    //               recentlyPlayedPodcast: [],
    //               recentlySearchedBook: [],
    //               socialLinks: [],
    //               state: "",
    //               trending: []
    //             },
    //             {
    //               _id: new mongoose.Types.ObjectId('644679cc261a1f0ca5f7f987'),
    //               fullname: "Adekunle ojo",
    //               email: "ilelaboyealekan+10@gmail.com",
    //               phonenumber: "2348102721335",
    //               field: "null",
    //               blocked: false,
    //               isMembershipActive: false,
    //               membershipType: "Free",
    //               isActive: false,
    //               paid: false,
    //               amount: 0,
    //               password: "$2b$10$p4AdzdOJuZqzrbqHyKwBbe8X89ZmcWkT6XsIhgamSWX4fzY6eDu92",
    //               accountVerified: true,
    //               roles: [
    //                 "user"
    //               ],
    //               createdAt: "2023-04-24T12:45:00.839Z",
    //               updatedAt: "2023-06-16T20:20:04.152Z",
    //               isAdmin: false,
    //               location: "Location",
    //               profileImage: "https://res.cloudinary.com/trailblazerfemme-app/image/upload/v1682340702/zbx4o6fyock6qxmchgre.jpg",
    //               profileImageCloudinaryPublicId: "zbx4o6fyock6qxmchgre",
    //               days_between_next_payment: "0",
    //               subscription_end_date: "2023-06-14T21:55:33.290Z",
    //               subscription_start_date: "2023-06-14T21:55:33.290Z",
    //               about: "",
    //               books: [],
    //               booksRead: [],
    //               chargeId: "",
    //               city: "",
    //               cityState: "",
    //               followers: [],
    //               following: [],
    //               jobTitle: "",
    //               library: [],
    //               membershipName: "Free",
    //               membershipSubscriberId: [],
    //               recentlyPlayedPodcast: [],
    //               recentlySearchedBook: [],
    //               socialLinks: [],
    //               state: "",
    //               trending: []
    //             },
    //             {
    //               _id: new mongoose.Types.ObjectId('645dd5b7a234119d7c9e26fb'),
    //               fullname: "Olawumi Oluseegun",
    //               email: "olawumi.olusegunn@gmail.com",
    //               phonenumber: "+7065066382",
    //               field: "Freemium",
    //               blocked: false,
    //               isMembershipActive: false,
    //               membershipType: "Free",
    //               isActive: true,
    //               paid: false,
    //               amount: 0,
    //               password: "$2b$10$Aa/swm3sZCMg.8yvf.ozWen4bg6QPAyt3JMUYtJaaqUynauTwLpam",
    //               accountVerified: true,
    //               roles: [
    //                 "admin"
    //               ],
    //               createdAt: "2023-05-12T05:59:19.373Z",
    //               updatedAt: "2023-06-16T20:20:03.945Z",
    //               isAdmin: true,
    //               location: "Location",
    //               days_between_next_payment: "1715493904402",
    //               subscription_end_date: "2024-05-12T06:05:04.402Z",
    //               subscription_start_date: "2024-05-12T06:05:04.402Z",
    //               about: "",
    //               books: [],
    //               booksRead: [],
    //               chargeId: "",
    //               city: "",
    //               cityState: "",
    //               followers: [],
    //               following: [],
    //               jobTitle: "",
    //               library: [],
    //               membershipName: "Free",
    //               membershipSubscriberId: [],
    //               profileImage: "",
    //               profileImageCloudinaryPublicId: "",
    //               recentlyPlayedPodcast: [],
    //               recentlySearchedBook: [],
    //               socialLinks: [],
    //               state: "",
    //               trending: []
    //             },
    //             {
    //               _id: new mongoose.Types.ObjectId('6481a9e7d432065af004ecf9'),
    //               fullname: "Olawumi Olusegun",
    //               email: "olawumi.olusegun@gmail.com",
    //               phonenumber: "23465066382",
    //               field: "Technology",
    //               blocked: false,
    //               isMembershipActive: true,
    //               membershipName: "Diamond",
    //               membershipType: "Diamond",
    //               isActive: true,
    //               paid: true,
    //               amount: 4500,
    //               password: "$2b$10$tUIPGRbOhitOAGzRehUGRuIrqZ0dh.kG1EOi1tSGkNJECEdsK96Iy",
    //               accountVerified: true,
    //               roles: [
    //                 "admin"
    //               ],
    //               createdAt: "2023-06-08T10:13:59.542Z",
    //               updatedAt: "2023-06-16T20:20:04.098Z",
    //               isAdmin: true,
    //               location: "Location",
    //               city: "Ikeja",
    //               profileImage: "https://res.cloudinary.com/trailblazerfemme-app/image/upload/v1686219325/f5dzsrsn3f3qkzaeomlh.jpg",
    //               profileImageCloudinaryPublicId: "f5dzsrsn3f3qkzaeomlh",
    //               state: "Lagos",
    //               days_between_next_payment: "30",
    //               subscription_end_date: "2023-06-16T14:53:44.100Z",
    //               subscription_start_date: "2023-06-16T14:53:44.100Z",
    //               membershipSubscriberId: [],
    //               subscriptionId: "64847d6927e77dbcdff213b6",
    //               sub_duration: "monthly",
    //               about: "",
    //               books: [],
    //               booksRead: [],
    //               chargeId: "",
    //               cityState: "",
    //               followers: [],
    //               following: [],
    //               jobTitle: "",
    //               library: [],
    //               recentlyPlayedPodcast: [],
    //               recentlySearchedBook: [],
    //               socialLinks: [],
    //               trending: []
    //             }
    //           ]
    //     )
    
    //     return res.status(201).json({ message: "Users uploaded"});
        
    // } catch (error) {
    //     return res.status(201).json({ error: error?.message, message: error?.message });
    // }


    // const adminData = {
    //     fullname: "Olawumi Olusegun",
    //     email: "olawumi.olusegun@gmail.com",
    //     location: "U.S.A",
    //     phonenumber: "+7065066382",
    //     field: "Freemium",
    //     roles: "admin",
    //     password: "password123",
    //     isActive: true,
    //     paid: true,
    //     amount: 0, 
    //     accountVerified: true,
    //     about: "Admin",
    //     isAdmin: true,
    // }
    
    // try {

    //     const adminExist = await User.findOne({ email });

    //     if(adminExist) {
    //         return res.status(404).json({ status: 'failed', error: "This Admin already exist", message: "Admin already exist"})
    //     }

    //     // New User
    //     const admin = new User(adminData);
        
    //     const savedAdmin = await admin.save();
        
    //     if(!savedAdmin) {
    //         return res.status(404).json({ status: 'failed', error: "Unable to register user as admin", message: "Unable to register user as admin"})
    //     }

    //     return res.status(201).json({ status: "success", message: "Admin Created successfully" })
    
    // } catch (error) {
    //     return res.status(500).json({ status: 'failed', error: error?.message, message: error?.message })
    // }
}


exports.register = async (req, res, next) => {

    //POST REQUEST
    //http://localhost:2000/api/auth/register
    /**
     * {   "fullname": "Olawumi Olusegun",
            "email": "ade@gmail.com",
            "phonenumber": "+2347065066382",
            "field": "Freemium",
            "roles": "admin",
            "password": "password123"
        }
     */

    const annually = 'years';
    const monthly = 'months';
    const days = 'days';
   
    
    try {

        const result = await registerValidation(req.body);

        const userExist = await User.findOne({ email: result?.email });



        const nextPaymentDate = calculateNextPayment(annually, moment().format());

        // Register new account if user email does not exist
        if(!userExist) {

        const user = new User({ ...result });

        const savedUser = await user.save();

        const otpCode = generateFourDigitsOTP();

        const otpExist = await Otpmodel.findById(savedUser?.id);

        if(otpExist) {
            await Otpmodel.deleteMany({  userId: savedUser?.id });
        }

        const saveOTP = await Otpmodel.create({ otp: otpCode, userId: savedUser?.id, phonenumber: savedUser?.phonenumber});

        if(!saveOTP) {
            return res.status(400).json({ message: "Unable to send otp code"})
        }

        const { id, email, roles, username, field, profileImagePath } = savedUser;

        const userObject = {  id, email, roles, username, field, profileImagePath };

        const accessToken = await signInAccessToken(userObject);

        const refreshToken = await signInRefreshToken(userObject);

        let refreshAccessToken = await RefreshAccessToken.findOne({ userId: savedUser?.id });
        
        if(refreshAccessToken) {
            await refreshAccessToken.remove();
        }

        refreshAccessToken = new RefreshAccessToken({ userId: savedUser?.id,  accessToken, refreshToken });
        
        const firstname = getFirstName(savedUser?.fullname)

        const sentMail  = await sendMail(email, saveOTP?.otp, firstname);


        if(!sentMail) {
            return res.status(400).json({ status: "failed", message: "Unable to send mail"})
        }

        await refreshAccessToken.save();

        return res.status(200).json({ accessToken, refreshToken, userId: savedUser?.id, stage: 1, otp: saveOTP?.otp,  message: "Otp has been sent to your email"});


        }


        // If user already exists but user account is not yet verified
        if(userExist && userExist?.email === result?.email && !userExist?.accountVerified) {

            const otpCode = generateFourDigitsOTP();

            const otpExist = await Otpmodel.deleteMany({ userId: userExist?.id });
    
            const newOtp = await Otpmodel.create({ userId: userExist?.id, phonenumber: userExist?.phonenumber, otp: otpCode });

            const { _id: id, email, roles, fullname: username, field } = userExist;

            const userObject = {  id, email, roles, username, field };

            if(userExist?.profileImage) {
                userObject.profileImage = userExist?.profileImage
            }
              
            const accessToken = await signInAccessToken(userObject);

            const refreshToken = await signInRefreshToken(userObject);
    
            let refreshAccessToken = await RefreshAccessToken.findOne({ userId: userExist?.id });
            
            if(refreshAccessToken) {
                await RefreshAccessToken.deleteMany({ userId: userExist?.id });
            }
            
            const newRefreshToken = new RefreshAccessToken({ userId: userExist?.id,  accessToken, refreshToken });
            
            const firstname = getFirstName(userExist?.fullname)
            const sentMail  = await sendMail(email, newOtp?.otp, firstname);

            if(!sentMail) {
                return res.status(400).json({ status: "failed", message: "Unable to send mail"})
            }
                 
            await newRefreshToken.save();
    
             res.status(200).json({ accessToken, refreshToken, userId: userExist?.id, stage: 1, otp: otpCode,  message: "Otp has been sent to your email"});
             return
        }

        // If account exist, user is verified by has not yet subscribed to a membership plan yet

        if(userExist && userExist?.email === result?.email && userExist?.accountVerified && !userExist?.isMembershipActive) {

        const { _id: id, email, roles, fullname: username, field } = userExist;

        const userObject = {  id, email, roles, username, field };

        const accessToken = await signInAccessToken(userObject);

        const refreshToken = await signInRefreshToken(userObject);

        let refreshAccessToken = await RefreshAccessToken.findOne({ userId: userExist?.id });
        
        if(refreshAccessToken) await refreshAccessToken.remove();

        refreshAccessToken = new RefreshAccessToken({ userId: userExist?.id,  accessToken, refreshToken});
        
        await refreshAccessToken.save();

            const userdata = {
            success: true,
            message: `${result?.email} is a verified user, proceed to membership`,
            stage: 2,
            accessToken,
            refreshToken,
            userId: userExist?.id
        }

            return res.status(200).json(userdata);
        }
       

        return res.status(400).json({ status: "failed", message: "User already exist"});

       
    } catch (error) {
       
        if(error.isJoi === true) {
            //unprocessible entry errors: server can't understand or process the entries
            return res.status(422).json({ status: "failed",  error: "validation error"})
        }
        // NODEMAILER ERROR MESSAGE
        if(error?.code === "EAUTH") {
            return res.status(500).json({ status: "failed",  error: "Unable to send email"})
        }
        return res.status(500).json({ status: "failed",  error: error?.message })
    }
    
}


exports.login = async (req, res, next) => {
    // taskScheduler.start()

    //POST REQUEST
    //http://localhost:2000/api/auth/login
    /**
     * {
            "email": "ade@gmail.com",
            "password": "password123"
        }
     */
    
    try {       

        const result = await loginValidation(req.body);
        
        const user = await User.findOne({ email: result?.email }).populate({
            path: "membershipSubscriberId",
            model: "MembershipSubscriber",
            select: "isActive membershipId amount membershipType createdAt"
        });
        
        if(!user) {
            return res.status(404).json({ status: "failed", message: "Invalid login credentials" });
        }

        if(!user?.accountVerified) {
            const msg = "Your account is not yet verified";
             res.status(400).json({ status: "failed", error: msg, message: msg })
             return
        }

        // Check if password is correct
        const isMatch = await user.isValidPassword(result?.password);

        if(!isMatch) {
            // throw createError.Unauthorized('Username/password not valid');
            return res.status(403).json({ status: "failed", message: "Invalid login credentials" });
        }

        // if(user?.isMembershipActive < Date.now()) {
        //     user.isMembershipActive = false;
        //     await user.save();
        // }

        /**
         * 
         * COME BACK HERE TO COMPLETE THIS PART
         * IF !user?.membershipType: THAT MEANS THE USER IS YET TO ANY SUBSCRIBE TO MEMEBRSHIP (EVENT FREE)
         */


        // IF user?.membershipType: MEANS MEMBERSHIP IS ACTIVE, UPDATE NUMBER OF DAYS FOR NEXT ACTIVATION OR RETURN TO FREE MEMBERSHIP
        // 


        let membership_details = {
            // subscriptionId: user?.subscriptionId,
             paid: user?.paid,
             membershipType: user?.membershipType, 
             isActive: user?.isActive, 
        //  amount: user?.amount,
        }
    

        const accessToken =  await signInAccessToken(user);
        const refreshToken = await signInRefreshToken(user);

        //if Refresh tokenn is set
        const isRefreshTokenSet = await RefreshAccessToken.findOne({userId: user?.id});
       
        if(isRefreshTokenSet) {
            await RefreshAccessToken.deleteMany({ userId: user?.id });
        }
        
        const refreshAccessToken = new RefreshAccessToken(
            {
            userId: user?.id,
            accessToken:accessToken,
            refreshToken:refreshToken
            });

        const savedRefreshAccessToken = await refreshAccessToken.save();
        
        return res.status(200).json({
            userId: user?.id,
            accessToken, 
            refreshToken, 
            membership_details,

            fullname: user?.fullname,
            profileImage: user?.profileImage,
            location: user?.location,
            jobTitle: user?.jobTitle,
            city: user?.city,
            socialLinks: user?.socialLinks,
            phonenumber: user?.phonenumber,
            role: user?.roles[0],

            email: user.email,

            // field: user.field,
            // city:  user.cityState
        });

    } catch (error) {
        console.log(error)
        if(error.isJoi === true) {      
            const msg = "Invalid parameters"     
            return res.status(422).send({ status:"failed", error: msg, message: msg})
        }

        return res.status(500).send({ status:"failed", error: error?.message, message: error?.message,})
    }
}


exports.refreshToken = async (req, res, next) => {
    
    try {
        const { refreshToken } = req.body;

        if(!refreshToken) {
            return res.status(400).send({ status:"failed", message: 'Invalid token'})
        }

        const userId = await verifyRefreshToken(refreshToken);
        const accessToken = await signInAccessToken(userId);
        const refToken = await signInRefreshToken(userId);

        return res.status(200).json({ status:"success", accessToken: accessToken, refreshToken: refToken });

    } catch (error) {
        return res.status(500).send({ status:"failed", error: error?.message, message: error?.message,})
    }
}

exports.logout = async (req, res, next) => {
    //DELETE REQUEST
    //http://localhost:2000/api/auth/delete-user/userId
    //http://localhost:2000/api/auth/delete-user/627fbadbc81d6b5315941f67

    try {
        const  refreshToken = req.headers.authorization.split(" ")[1];
      
        if(!refreshToken) {
            return res.status(400).send({ status:"failed", message: "Invalid token"})
        }

        const userId = await verifyRefreshToken(refreshToken);
               
        //if Refresh tokenn is set
        const isRefreshTokenSet = await RefreshAccessToken.findOne({ userId: userId });
       
        if(!isRefreshTokenSet) {
            return res.status(404).send({ status:"failed", message: "Unable to logout user"})
        }

        await RefreshAccessToken.findByIdAndDelete({userId: userId});

        return res.status(404).send({ status:"failed", message: "You are now logged out"})


    } catch (error) {
        next(error);
    }
}


// ///ADMIN DASHBOARD LAYOUT
// exports.dashboardListUsers = async (req, res, next) => {
//     //DASHBOARD USER
//     //GET REQUEST
//     //http://localhost:2000/api/auth/dashboard-list-users
//     try {
//         const adminArray = [];
//         const paidArray = [];

//         const users = await User.find({}).select(`-password -__v -updatedAt -following -followers -recentlySearchedBook 
//         -recentlyPlayedPodcast -booksRead -library `).limit(5);
        
//         users.map((user) => {
//             if(user.roles[0] === 'admin') adminArray.push(user.roles[0]);

//             if(user.isPaid) paidArray.push(user.isPaid);
//         });

//         const adminData = {
//             userCounts: users.length,
//             adminCounts: adminArray.length,
//             paidUserCounts: paidArray.length,
//             userLists: users
//         }

//         return res.status(200).send(adminData)
        
//     } catch (error) {
//         return res.status(500).send({ message: error.message });
//     }
// }

// exports.memberShip = async (req, res, next) => {
//     //DASHBOARD MEMBERSHIP
//     //GET REQUEST
//     //http://localhost:2000/api/auth/dashboard-membership

//     try {

//         const goldPlan = [];
//         const silverPlan = [];

//         const users = await User.find({}).select(`-password -__v -updatedAt -following -followers -recentlySearchedBook 
//         -recentlyPlayedPodcast -booksRead -library `).limit(5);

//         const membership2 = await User.find({});

//         membership2.map((member) => {

//             if(member.membershipPlan === "goldPlan") {
//                 goldPlan.push(member.membershipPlan);
//             }

//             if(member.membershipPlan === "silverPlan") {
//                 silverPlan.push(member.membershipPlan);
//             }

//         });

//         const adminData = {
//             goldMemberCounts: goldPlan.length,
//             silverMemberCount: silverPlan.length,
//             totalMembershipCount: membership2.length,
//             membershipRevenue: '',
//             users
//         }

//         return res.status(200).send(adminData);

//     } catch (error) {
//         return res.status(500).send({ message: error.message });
//     }
// }

exports.updateUser = async (req, res, next) => {
    //PATCH REQUEST
    //http://localhost:2000/api/auth/user/:userId/update
    //http://localhost:2000/api/auth/user/62902e117ecadf9305054e1a/update

    const userId = req.user.id;

    try {

        let user  = await User.findById(req?.user?.aud).select('-socialLinks -isPaid');
    
        if(!user) {
            return res.status(400).json({status: "failed", message:`User with ${user?.email} does not exist`});
        }

        let userData = { ...req.body };
        
        const result = await registerValidation(userData, true);

        if(!result) {
            return res.status(200).send({status: "failed", message: 'Unable to update user'});
        }

        if(req?.file) {
 
        // Check if user already has a profile image
        if(user?.profileImageCloudinaryPublicId && user?.profileImage) {
            // Delete user profile image from cloudinary
            let deleteResponse = await cloudinary.uploader.destroy(user?.profileImageCloudinaryPublicId);        
        
            if(!deleteResponse) {
                //Reject if unable to upload image
                return res.status(400).json({ message: "Unable to delete profile image please try again"});
            }

        }

        // //Upload Image to cloudinary
        const { public_id, secure_url } = await cloudinary.uploader.upload(req?.file?.path);

        if(!secure_url && !public_id) {
            //Reject if unable to upload image
            return res.status(404).json({status: "failed", message: "Unable to upload image please try again"});
        }

        result["profileImageCloudinaryPublicId"] = public_id;
        result["profileImage"] = secure_url;

        fs.unlinkSync(req?.file?.path);

        }

        // Delete password from object so that password field does not update
        delete result?.password;

        //update user details
        const updatedUser = await User.findByIdAndUpdate(userId, { $set: result }, { new: true });

        if(!updatedUser) {
            return res.status(400).json({status: "failed", message: 'Unable to update user info'});
        }

        return res.status(200).json({status: "success", message: 'Updated successfully'});

    } catch (error) {
        next(error);
    }
       
}

exports.uploadProfilePicture = async (req, res, next) => {
    //PATCH REQUEST
    //http://localhost:2000/api/auth/upload-profile-picture/:userId/upload
    //http://localhost:2000/api/auth/upload-profile-picture/62902e117ecadf9305054e1a/upload


    let currentUser = req?.user?.id;

    try {
        
        let user  = await User.findById(currentUser).select('-socialLinks -isPaid -password');
   
        if(!user) {
            throw createError.Conflict(`User with ${user?.email} does not exist`);
        }
        
        // //Upload Image to cloudinary
        const { public_id, secure_url} = await cloudinary.uploader.upload(req?.file?.path);

        fs.unlinkSync(req?.file?.path);

        if(!secure_url && !public_id) {
            //Reject if unable to upload image
            return res.status(404).json({status: "failed", message: "Unable to upload image please try again"});
        }

        const updatedProfileImage = await User.updateOne({_id: currentUser}, 
            { $set: 
            {
                profileImageCloudinaryPublicId: public_id,  
                profileImage: secure_url
            }
        
        }, { new: true });

        if(!updatedProfileImage) {
            return res.status(400).json({status: "failed", message: 'Unable to update profile image', stage: 3 });
        }

        return res.status(200).json({status: "success", message: 'Profile Image Uploaded successfully', stage: 3 });

    } catch (error) {
        // return res.status(401).json(error)
        next(error);
    }
       
}

exports.deleteUser = async (req, res, next) => {
    //DELETE REQUEST
    //http://localhost:2000/api/auth/user/:userId/delete
    //http://localhost:2000/api/auth/user/62902e117ecadf9305054e1a/delete

    try {
        const userExist = await User.findOne({ _id: req.params.userId });

        if(!userExist) return res.status(404).json({status: "failed", message: `User does not exist`});
      
        let uploaderResponse = await cloudinary.uploader.destroy(userExist?.profileImageCloudinaryPublicId);

        if(!uploaderResponse) {
            return res.status(400).json({status: "failed", message: "Unable to delete user profile image, please try again"});
        }
    
        const deletedUser = await User.findByIdAndDelete(userExist?.id);
      
        if(!deletedUser) {
            return res.status(401).json({status: "failed", message: 'Unable to delete user'});
        }

        return res.status(200).json({status: "success", message: 'User deleted successfully'});

    } catch (error) {
        next(error)
    }
}

exports.resetPassword = async (req, res, next) => {

    const { email } = req.body;

    try {

        const result = await resetPasswordSchema.validateAsync({email});

        const userExist = await User.findOne({ email: result?.email });

        if(!userExist) throw createError.Conflict(`${result?.email} does not exist`);

        const resetToken = await resetPasswordToken(userExist);
        
        const sendPage = `https://fofoapp.herokuapp.com/api/auth/reset-password/${userExist?._id}/${resetToken}`;
        
        // SEND sendPage to email address
        //
        return res.status(200).json({status: "success", sendPage, resetToken });

    } catch (error) {
        return res.status(500).json({status: "failed", error: error?.message, message: error?.message })
    }
}

exports.getResetPasswordToken = async (req, res, next) => {

    const { id, token } = req.params;
    
    try {
        if(!id && !token) {
            return res.status(401).send({status: "failed", message: "User not verified"})
        }
        const doesExist = await User.findOne({ _id: id }).select('password -_id').lean();
       
        if(!doesExist) return res.status(404).json({status: "failed", message: "User does not exist"});

        const secret =  process.env.RESET_PASSWORD_SECRET_KEY + doesExist?.password;

        const payload  = JWT.verify(token, secret);
        
        if(!payload) {
            return res.status(401).send({status: "failed", message: 'Unable to verify user'});
        }
        //SEND OTP TO USER PHONE
        // Object.assign(doesExist, req.body);
        // doesExist.save();
      
        // const updatedUser =    await User.findByIdAndUpdate(id, dataToUpdate, { new: true });

        return res.status(200).send({status: "success", message: 'User verified'})

    } catch (error) {
        return res.status(500).json({status: "failed", error: error?.message, message: error?.message })
    }
}

exports.postResetPasswordToken = async (req, res, next) => {

    const { id, token } = req.params;
    const { password, confirmPassword } = req.body;

    if(password !== confirmPassword) {
        return res.status(401).json({status: "failed", error: 'Password mis-match'});
    }

    try {
        let doesExist = await User.findOne({ _id: id }).select('password -_id');

        if(!doesExist) return res.status(404).json({status: "failed", message: "User does not exist"});
        
        const { value: result } = await passwordOnlySchema({ password, confirmPassword });

        const secret =  process.env.RESET_PASSWORD_SECRET_KEY + doesExist.password;

        const payload  = JWT.verify(token, secret);
        
        if(!payload) {
            return res.status(401).json({status: "failed", message: 'Unable to verify user'});
        }
        const salt = await bcrypt.genSalt(10);

        const hashedPassword = await bcrypt.hash(password, salt);

        doesExist.password = hashedPassword;

        const passwordReset = await User.findByIdAndUpdate(id, { $set: doesExist }, { new: true });

        if(!passwordReset) {
            return res.status(400).json({ status: "failed", message: 'Unable to reset password' })
        }
        
        return res.status(200).send({ status: "success", message: 'User Password successfully updated'})

    } catch (error) {

        if(error?.details) {
            return res.status(401).send({error: error?.details[0]?.message});
        }

        return res.status(500).json({status: "failed", error: error?.message, message: error?.message })
    }
}

exports.updatePassword = async (req, res, next) => {

    const userId = req?.params?.userId;

    const { password, confirmPassword } = req.body;
    
    try {

        if(password !== confirmPassword) {
            return res.status(401).json({status: "failed", error: 'Password mis-match'});
        }

        if(!mongoose.Types.ObjectId.isValid(userId)) return res.status(401).json({status: "failed", error: 'Invalid user id'});

        const user = await User.findOne({_id: userId});
        
        if(!user) return res.status(404).json({status: "failed", error: "User not found"});

        const salt = await bcrypt.genSalt(10);

        const hashedPassword = await bcrypt.hash(password, salt);

        const updatedPassword = await User.findByIdAndUpdate(user.id, {$set: { password: hashedPassword }});
        
        // const accessToken = await signInAccessToken(user);
        // const refreshToken = await signInRefreshToken(user);

        // //if Refresh tokenn is set
        // const isRefreshTokenSet = await RefreshAccessToken.findOne({userId: user.id});
       
        // if(isRefreshTokenSet) isRefreshTokenSet.remove();

        // const refreshAccessToken = new RefreshAccessToken({
        //     userId: user.id,
        //     accessToken:accessToken,
        //     refreshToken:refreshToken
        // });

        // const savedRefreshAccessToken = await refreshAccessToken.save();

        if(!updatedPassword) {
            return res.status(400).json({status: "failed", error: "Unable to update password"});
        }

        return res.status(200).json({ status: "failed", message: "Password updated successfully"});

    } catch (error) {
        return res.status(500).json({status: "failed", error: error?.message, message: error?.message  });
    }
}

exports.otpPage = async (req, res, next) => {

    const { email } = req.body;

    try {

        const user = await User.findOne({ email: email });

        if(!user) return res.status(404).send({ status: "failed", error: "User not found" });
        
        const otpCode = generateFourDigitsOTP();

        // const otp = sendSMS(otpCode);
        // const sentSms  = sendGridMail(user.email, otpCode);

        // sdk['https://api.sendchamp.com/api/v1']({
        //     to: ['+2347065066382'],
        //     message: `Your otp code is ${otp}`,
        //     sender_name: `${savedUser.name}`,
        //     route: 'international'
        //   }, {Authorization: 'Bearer null'})
        //     .then(res => console.log(res))
        //     .catch(err => console.error(err));

        // if(!sentSms) {
        //     if(!otp) res.status(500).send({message: "Unable to send otp code via mail"});
        // }

        // if(!otp) res.status(500).send({message: "Unable to send otp"});


        const { id, phonenumber } = user;

        const otpExist = await Otpmodel.deleteOne({ userId: id });

        const newOtp = await Otpmodel.create({ userId: id, phonenumber, otp: otpCode });

        const userData = { userId: newOtp.userId, otp: newOtp.otp,  };

        return res.status(200).send(userData);

    } catch (error) {
        return res.status(401).json({ status: "failed", error: error?.message, message: error?.message });
    }
    
}


exports.verifyOtp = async (req, res, next) => {
    
    try {

        const { otp } = req.body;

        if(otp.length < 4 || otp.length > 4 ) {
            return res.status(200).json({ status: "failed", error: 'Input valid 4 digit otp code'})
        }
        
        const isOtpFound = await Otpmodel.findOne({ otp: otp })

        if(!isOtpFound) {
            return res.status(404).json({ status: "failed", error: 'OTP not found'})
        }

        const user = await User.findOne({_id: isOtpFound.userId})

        if(!user) return res.status(400).json({ status: "failed", error: "Unprocessible OTP ", stage: 1 });
        
        
        const verified = await User.findByIdAndUpdate(isOtpFound.userId, { $set: { accountVerified: true }}, { new: true});
       
        if(verified) {
            await Otpmodel.findByIdAndDelete(isOtpFound.id);
        }

        const { _id: id, email, roles, fullname: username, field } = verified;

        const userObject = {  id, email, roles, username, field };

        if(verified?.profileImagePath) {
            userObject.profileImagePath = verified?.profileImagePath
        }
          
        const accessToken = await signInAccessToken(userObject);

        const refreshToken = await signInRefreshToken(userObject);

        let refreshAccessToken = await RefreshAccessToken.findOne({ userId: verified.id });
        
        if(refreshAccessToken) {
            await refreshAccessToken.remove();
        }

        refreshAccessToken = new RefreshAccessToken({ userId: verified?.id,  accessToken, refreshToken });
        
        await refreshAccessToken.save();

        const userdata = {
            success: true,
            message: "Otp verified",
            stage: 2,
            accessToken,
            refreshToken,
            userId: verified?.id
        }

        return res.status(200).send(userdata);

    } catch (error) {
        
        next(error)
    }
    
}

exports.followAndUnfollow = async (req, res, next) => {
    
    const userId = req.user?.id;

    const { followId } = req.params;
    
    try {

        const userExist = await User.findById(userId)
        const followExist = await User.findById(followId)

        if(!userExist) {
            return res.status(404).json({ status: 'failed', message: `Follow ID: ${userId} does not exist` })
        }

        if(!followExist) {
            return res.status(404).json({ status: 'failed', message: `Follower ID: ${followId} does not exist`})
        }

        if(followExist?.id === userId) {
            return res.status(400).json({ status: 'failed', message: `You can't follow yourself`})
        }

        if(followExist?.followers?.includes(userId)) {
            followExist.followers.pull(userId)
            userExist.following.pull(followId)
            await userExist.save();
            await followExist.save();
            return res.status(200).json({ status: "success", message: "Unfollowed"})

        } else {
            userExist.following.addToSet(userId)
            followExist.followers.addToSet(userId)
            await userExist.save();
            await followExist.save();
            return res.status(200).json({ status: "success", message: "Followed"})

        }

    } catch (error) {
        return res.status(500).json({ status: 'failed', message: "Server error following and unfollowing a user"})
    }
}


