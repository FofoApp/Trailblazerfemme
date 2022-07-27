const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const Schema = mongoose.Schema;


const userSchema = new Schema({

    fullname: { type: String, required: true },
    email: { type: String, required: true, lowercase: true, unique: true },
    phonenumber: { type: String, required: true },
    field: { type: String, required: true },
    blocked: { type: Boolean, default: false }, // block / unblock users

    chargeId: { type: String },
    membershipName: { type: String, default: null },
    membershipId: { type: mongoose.Schema.Types.ObjectId, ref: "Membership" },
    paymentId: { type: mongoose.Schema.Types.ObjectId, ref: "Payment" },
    paymentDate: { type: Date },
    nextPaymentDueDate: { type: Date },
    paymentType1: { type: Number },                      //1 month or 2month or 3month ...
    paymentType2: { type: String },                      //monthly | yearly
    amount: { type: String },                           //$25
    isPaid: { type: Boolean, default: false },


    password: { type: String, required: true },
    accountVerified: { type: Boolean, default: false },
    about: { type: String, default: null },
    location: { type: String, default: null },
    socialLinks: { type: [String] },
    roles: { type: [String], enum: ["user", "admin", "superAdmin"], default: "user"},

    books: { type: mongoose.Schema.Types.ObjectId, ref: "Book"},

    recentlySearchedBook: [{ type: mongoose.Schema.Types.ObjectId, ref: "Book"}],
    recentlyPlayedPodcast: [{ type: mongoose.Schema.Types.ObjectId, ref: "Podcast"} ],
    
    booksRead: [{ type: mongoose.Schema.Types.ObjectId, ref: "Book"}],

    profileId: { type: mongoose.Schema.Types.ObjectId, ref: "Profile" },

    // profileImageCloudinaryPublicId: { type: String, default: null },
    // profileImage: { type: String, default: null },
    // followers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    // following: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],

    trending: [{ type: mongoose.Schema.Types.ObjectId, ref: "TrendingBook"}],

    library: [{ type: mongoose.Schema.Types.ObjectId, ref: "MyLibrary"}],

}, 

{
    toJSON: {
        transform: (document, returnedObject, options) => {
                    returnedObject.id = returnedObject._id
                    delete returnedObject._id
                    delete returnedObject.password;
                    delete returnedObject.__v
        }
    }
},

{ timestamps: true });


// userSchema.methods.toJSON = function() {
//     let user = this;
//     let userObject = user.toObject();
//     delete userObject.password;
//     delete userObject.__v;
//     return userObject;
// }

userSchema.pre('save', async function(next) {
    let user = this;

    try {
        if(!user.isModified('password')) return next();

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(user.password, salt);
        user.password = hashedPassword;
        next();
    
    } catch (error) {
        next(error);
    }

});

userSchema.methods.isValidPassword = async function(password){
    let user = this;
    try {
        return await bcrypt.compare(password, user.password);
    } catch (error) {
        throw error;
    }
}


const User = mongoose.model('User', userSchema);

module.exports = User;