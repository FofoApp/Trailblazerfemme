
const followersAndFollowingSchema = require('../models/FollowersAndFollowingModel');
const User = require('../models/UserModel');


const follow = async (req, res, next) => {
    //Note user both follower and followee should be logged in to perform action
    try {
        //Find follower by id from the request parameter
        const follower = await User.findById(req.params.userId).select('_id'); 
        
        if(!follower) return res.status(404).send({ message: "User not found"});

        //Check if the logged in user is the one trying to follow himself
        if(follower.id === req.body.userId) return res.status(404).send({ message: "You can not follow yourself"});

        //Find followee by id from the request body
        const followee = await User.findById(req.body.userId).select('_id');
        if(!followee) return res.status(404).send({ message: "User not found"});
        
        const followersOfFollowerAndFollowing = await followersAndFollowingSchema.findOne({userId: follower.id});
      
        const followersOfFolloweeAndFollowing = await followersAndFollowingSchema.findOne({userId: followee.id});
        
        //Check if followee is already a follower 
        if(!followersOfFollowerAndFollowing.followers.includes(followee._id)) {

            await followersOfFollowerAndFollowing.updateOne({ $push: { followers: followee._id } } );
            await followersOfFolloweeAndFollowing.updateOne({ $push: { followings: follower._id } } );

            return res.status(201).send({ message: "Followed"});

        }   else {
            
            await followersOfFollowerAndFollowing.updateOne({ $pull: { followers: followee._id } } );
            await followersOfFolloweeAndFollowing.updateOne({ $pull: { followings: follower._id } } );

            return res.status(200).send({ message: "Unfollowed"});
        }
        

    } catch (error) {
        console.log(error);
        return res.status(500).send(error);
    }
    


}

module.exports  = {
    follow
}
