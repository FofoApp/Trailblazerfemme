const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const Schema = mongoose.Schema;


const userSchema = new Schema({
    fullname: { type: String, required: true },
    email: { type: String, required: true, lowercase: true, unique: true },
    phonenumber: { type: String, required: true },
    field: { type: String, required: true },
    password: { type: String, required: true },
    about: { type: String, default: null },
    profileImageCloudinaryPublicId: { type: String, default: null },
    profileImage: { type: String, default: "/assets/profileImage/default.jpg" },
    location: { type: String, default: null },
    socialLinks: { type: [String] },
    isPaid: { type: Boolean, default: false },
    nextPaymentDate: { type: Date },
    roles: { type: [String], enum: ["user", "admin", "superAdmin"], default: "user"},

    books: { type: mongoose.Schema.Types.ObjectId, ref: "Book"},

    recentlySearchedBook: [{ type: mongoose.Schema.Types.ObjectId, ref: "Book"}],
    recentlyPlayedPodcast: [{ type: mongoose.Schema.Types.ObjectId, ref: "Podcast"} ],
    
    booksRead: [{ type: mongoose.Schema.Types.ObjectId, ref: "Book"}],

    followers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    following: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],

    trending: { type: mongoose.Schema.Types.ObjectId, ref: "TrendingBook"},

    library: [{ type: mongoose.Schema.Types.ObjectId, ref: "MyLibrary"}],

}, { timestamps: true });

userSchema.pre('save', async function(next) {

    try {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(this.password, salt);
        this.password = hashedPassword;
        next();
    
    } catch (error) {
        next(error);
    }

});

userSchema.methods.isValidPassword = async function(password){
    try {
        return await bcrypt.compare(password, this.password);
    } catch (error) {
        throw error;
    }
}


const User = mongoose.model('User', userSchema);

module.exports = User;