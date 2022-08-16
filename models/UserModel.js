const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const Schema = mongoose.Schema;


const userSchema = new Schema({

    fullname: { type: String, required: true },
    email: { type: String, required: true, lowercase: true, unique: true },
    jobTitle: { type: String, default: null },
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
    cityState: { type: String, default: null },
    socialLinks: { type: [String] },
    roles: { type: [String], enum: ["user", "admin", "superAdmin"], default: "user"},
    profileId: { type: mongoose.Schema.Types.ObjectId, ref: "Profile" },

    profileImageCloudinaryPublicId: { type: String  },
    profileImage: { type: String },

    // post: { type: Array },
    
    followers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    following: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],


    books: [{ type: mongoose.Schema.Types.ObjectId, ref: "Book"}],

    recentlySearchedBook: [{ type: mongoose.Schema.Types.ObjectId, ref: "Book"}],
    recentlyPlayedPodcast: [{ type: mongoose.Schema.Types.ObjectId, ref: "Podcast"} ],
    
    booksRead: [{ type: mongoose.Schema.Types.ObjectId, ref: "Book"}],

    trending: [{ type: mongoose.Schema.Types.ObjectId, ref: "TrendingBook"}],

    library: [{ type: mongoose.Schema.Types.ObjectId, ref: "Book"}],

}, 

{ timestamps: true });


userSchema.set('toJSON', {
    // virtuals: true,
    transform: function(doc, ret, options){
        ret.id = ret._id;
        delete ret._id;
        delete ret.password;
        delete ret.__v;

        return ret;
    }
})


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