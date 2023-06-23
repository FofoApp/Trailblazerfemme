const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const Schema = mongoose.Schema;


const userSchema = new Schema({

    fullname: { type: String, trim: true, required: true },
    email: { type: String, trim: true, required: true, lowercase: true, unique: true },
    location: { type: String, trim: true, default: "unknown" },
    jobTitle: { type: String, trim: true, default: "" },
    phonenumber: { type: String, trim: true, required: true },
    field: { type: String, trim: true, default: "" },
    city: { type: String, trim: true, default: ""   },
    state: { type: String, trim: true, default: ""  },
    blocked: { type: Boolean, default: false },
    // block / unblock users

    chargeId: { type: String, trim: true, default: ""  },

    membershipSubscriberId: [{ type: mongoose.Schema.Types.ObjectId, ref: "MembershipSubscriber" }],
    isMembershipActive: { type: Boolean, default: false },

    membershipName: { type: String, default: "Free" },
    membershipId: { type: mongoose.Schema.Types.ObjectId, ref: "Membership"},
    communityId: { type: mongoose.Schema.Types.ObjectId, ref: "Membership"},

    subscription_end_date: { type: Date, default: Date.now() },
    subscription_start_date: { type: Date, default: Date.now() },
    days_between_next_payment: { type: String, trim: true, default: "0" },

    stripeCustomerId:  { type: String, trim: true },

    // paymentId: [{ type: mongoose.Schema.Types.ObjectId, ref: "Payment" }],
    // paymentDate: { type: Date },
    // nextPaymentDueDate: { type: Date },
    // paymentType1: { type: Number },                      //1 month or 2month or 3month ...
    // paymentType2: { type: String },                      //monthly | yearly
    // amount: { type: Number },                           //$25

    subscriptionId: {type: mongoose.Schema.Types.ObjectId, ref: "MembershipSubscriber", },
    membershipType: { type: String, default: "" },
    sub_duration: { type: String, trim: true, },
    isActive: { type: Boolean, default: false  },
    paid: { type: Boolean, default: false },
    amount: { type: Number,  default: 0 }, 
    password: { type: String, trim: true, required: true },
    accountVerified: { type: Boolean, default: false },

    about: { type: String, trim: true, default: ""  },
    cityState: { type: String, trim: true, default: ""  },

    socialLinks: { type: [String], default: [] },
    roles: { type: [String], enum: ["user", "admin", "superAdmin"], default: "user"},
    isAdmin: { type: Boolean, default: false },

    profileId: { type: mongoose.Schema.Types.ObjectId, ref: "Profile" },
    profileImageCloudinaryPublicId: { type: String, default: ""  },
    profileImage: { type: String, trim: true, default: ""  },
    
    followers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    following: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],


    books: [{ type: mongoose.Schema.Types.ObjectId, ref: "Book"}],

    recentlySearchedBook: [{ type: mongoose.Schema.Types.ObjectId, ref: "Book"}],
    recentlyPlayedPodcast: [{ type: mongoose.Schema.Types.ObjectId, ref: "Podcast"} ],
    
    booksRead: [{ type: mongoose.Schema.Types.ObjectId, ref: "Book"}],

    trending: [{ type: mongoose.Schema.Types.ObjectId, ref: "TrendingBook"}],

    library: [{ type: mongoose.Schema.Types.ObjectId, ref: "Book"}],

},  { timestamps: true });


userSchema.options.toJSON = {
    transform: function(doc, ret, options) {
        ret.id = ret?._id;
        delete ret?._id;
        delete ret?.__v;
        delete ret?.password;
        return ret;
     }
};


userSchema.pre('save', async function(next) {

    let user = this;

    try {

        if(this.isModified('password')) {
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(user?.password, salt);
            user.password = hashedPassword;
        }

        next();
    
    } catch (error) {
        next(error);
    }

});

userSchema.methods.isValidPassword = async function(password){
    let user = this;
    try {
        return await bcrypt.compare(password, user?.password);
    } catch (error) {
        throw error;
    }
}


const User = mongoose.model('User', userSchema);

module.exports = User;