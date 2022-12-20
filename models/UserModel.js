const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const Schema = mongoose.Schema;


const userSchema = new Schema({

    fullname: { type: String, trim: true, required: true, unique: true },
    email: { type: String, trim: true, required: true, lowercase: true, unique: true },
    jobTitle: { type: String, trim: true, default: null },
    phonenumber: { type: String, trim: true, required: true },
    field: { type: String,  },
    blocked: { type: Boolean, default: false }, // block / unblock users

    chargeId: { type: String },

    membershipSubscriberId: [{ type: mongoose.Schema.Types.ObjectId, ref: "MembershipSubscriber" }],
    isMembershipActive: { type: Boolean, default: false },

    membershipName: { type: String, default: null },
    membershipId: { type: mongoose.Schema.Types.ObjectId, ref: "Membership"},
    communityId: { type: mongoose.Schema.Types.ObjectId, ref: "Membership"},

    subscription_end_date: { type: Date,  },
    subscription_start_date: { type: Date,   },
    days_between_next_payment: { type: Number, },

    // paymentId: [{ type: mongoose.Schema.Types.ObjectId, ref: "Payment" }],
    // paymentDate: { type: Date },
    // nextPaymentDueDate: { type: Date },
    // paymentType1: { type: Number },                      //1 month or 2month or 3month ...
    // paymentType2: { type: String },                      //monthly | yearly
    // amount: { type: Number },                           //$25

    subscriptionId: {type: mongoose.Schema.Types.ObjectId, ref: "MembershipSubscriber", default: null},
    membershipType: { type: String, default: "Free" },
    isActive: { type: Boolean, default: false  },
    paid: { type: Boolean, default: false },
    amount: { type: Number,  default: 0 }, 
    password: { type: String, trim: true, required: true },
    accountVerified: { type: Boolean, default: false },

    about: { type: String, default: null },
    cityState: { type: String, default: null },

    socialLinks: { type: [String] },
    roles: { type: [String], enum: ["user", "admin", "superAdmin"], default: "user"},
    isAdmin: { type: Boolean, default: false },

    profileId: { type: mongoose.Schema.Types.ObjectId, ref: "Profile" },
    profileImageCloudinaryPublicId: { type: String  },
    profileImage: { type: String },
    
    followers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    following: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],


    books: [{ type: mongoose.Schema.Types.ObjectId, ref: "Book"}],

    recentlySearchedBook: [{ type: mongoose.Schema.Types.ObjectId, ref: "Book"}],
    recentlyPlayedPodcast: [{ type: mongoose.Schema.Types.ObjectId, ref: "Podcast"} ],
    
    booksRead: [{ type: mongoose.Schema.Types.ObjectId, ref: "Book"}],

    trending: [{ type: mongoose.Schema.Types.ObjectId, ref: "TrendingBook"}],

    library: [{ type: mongoose.Schema.Types.ObjectId, ref: "Book"}],

},  { timestamps: true });


// schema.method("toJSON", function() {
//     const { __v, _id, ...ret } = this.toObject();
//     ret.id = _id;
//     return ret;
//   });


userSchema.options.toJSON = {
    transform: function(doc, ret, options) {
        ret.id = ret._id
        delete ret._id
        delete ret.__v
        delete ret.password;
        return ret;
     }
};

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