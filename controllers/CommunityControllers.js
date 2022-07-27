
const mongoose = require('mongoose');

const CommunityModel = require('../models/community/CommunityModel');
const PostModel = require('./../models/postModel/PostModel');


exports.joinCommunity = async (req, res, next) => {
    //PATCH REQUEST
    //http://localhost:2000/api/community/communityId/join
    //http://localhost:2000/api/community/628f256391763d00e9be6c7a/join

    const userId =  req.user.id;
    // const userId =  "628695d03cf50a6e1a34e27b"; //628695d03cf50a6e1a34e27b
    const communityId = req.params.communityId; //628f256391763d00e9be6c7a

    try {

        if(!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(404).send({ message: "You must be logged in to join" })
        }

        if(!mongoose.Types.ObjectId.isValid(communityId)) {
            return res.status(404).send({ message: "Invalid community parameter" })
        }

        if(!communityId) {
            return res.status(404).send({ message: "Community not found!"});
        }

        const findCommunity = await CommunityModel.findById(communityId);

        if(findCommunity.members.includes(userId)) {
            return res.status(401).send({ message: "You are already a member" });
        }

        const joined = await CommunityModel.updateOne({_id: communityId}, {$push: {"members": userId } });
        
        if(joined) {
            return res.status(200).send({message: "You are now a member of the community"});
        }

    } catch (error) {
        return res.status(500).send({ message: error.message }); 
    }
}

exports.createNewCommunity = async (req, res, next) => {
    //http://localhost:2000/api/community/create
    /**
     *  {
            "title": "Community one",
            "short_description": "About Community One",
            "description": "About Community One",
            "communityMembershipPlan": "paid",
            "category": "Book",
            "createdBy": "628695d03cf50a6e1a34e27b",
            "image": "image path"
        }
     */
    try {

        // if(!mongoose.Types.ObjectId.isValid(req.body.userId)) {
        //     return res.status(404).send({ message: `UserId not found`});
        // }

        const findCommunity = await CommunityModel.findOne({title: req.body.title })
        

        if(findCommunity) return res.status(401).send({ message: `Community with ${findCommunity.title} already exist.`});

        const newCommunity = new CommunityModel({
            title: req.body.title,
            short_description: req.body.short_description,
            description: req.body.description,
            communityMembershipPlan: req.body.communityMembershipPlan,
            category: req.body.category,
            createdBy: req.body.createdBy,
            communityComments: req.body.communityCommenterId &&  [ {communityCommenterId: req.body.communityCommenterId, comment: req.body.comment}],
            communityLikes: req.body.communityCommentLikerId &&  [ {communityCommentLikerId: req.body.communityCommentLikerId }],
            image: req.body.image
           });

         const communities = await newCommunity.save();
         return res.status(200).send({ communities: communities });

           
        // let query = [
		// 	{
		// 		$lookup:
		// 		{
		// 		 from: "users",
		// 		 localField: "createdBy",
		// 		 foreignField: "_id",
		// 		 as: "creator"
		// 		}
		// 	},
        //     {$unwind: '$creator'},
		// 	{
		// 		$lookup:
		// 		{
		// 		 from: "communitylikes",
		// 		 localField: "category",
		// 		 foreignField: "_id",
		// 		 as: "category_details"
		// 		}
		// 	},

        // ];

        // let community = await CommunityModel.aggregate(query);
        // return res.status(201).send({ message: "New Community Created", community});

    } catch (error) {
        console.log(error)
        return res.status(500).send({ message: error.message });
    }
}


exports.listAllCommunities = async (req, res, next) => {

    //GET REQUEST
    //http://localhost:2000/api/community/lists


    //const communities = await CommunityModel.find();
 
    // const community = await CommunityModel.aggregate([
    //     {
    //         $lookup: { from: "users", localField: "createdBy", foreignField: "_id", as: "communityLikes"}
            
    //         //$lookup: { from: "users", localField: "createdBy", foreignField: "_id", as: "communityCreator"}
    //     }
    // ]);


    try {
        // const communities = await CommunityModel.aggregate([
        //     { $match: {title: "Community Title Two" } },
        //     // { $group: { _id: { comments: "$communityComments.comment" }, totalCOmment: { $size: ""}  }  }
        //     {$project: { _id: 1, title: 1, communityComments: 1,  totalComments: { $size: "$communityComments.comment" }, totalLikes: { $size: "$communityLikes" } } }
        // ]);
    
        // return res.status(200).send({ communities: communities });

        const community = await CommunityModel.find({}).select('-__v -createdAt -updatedAt');
        if(!community) return res.status(400).send({ message: `No community found`});
        return res.status(201).send(community);

    } catch (error) {
        return res.status(500).send({ message: error.message });
    }

}


exports.getCommunityById = async (req, res, next) => {
    //GET REQUEST
    //http://localhost:2000/api/community/communityId/get
    //http://localhost:2000/api/community/628f256391763d00e9be6c7a/get
    //FETCH COMMUNITY POSTS AND COMMENTS
    const communityId = req.params.communityId;
    try {
        if(!mongoose.Types.ObjectId.isValid(communityId)) {
            return res.status(404).send({ message: "Community not found"});
        }
        const community = await CommunityModel.findOne({_id: communityId}).populate('posts').select('-__v -createdAt -updatedAt')
        if(!community) {
            return res.status(404).send({ message: `No community found`});
        }
        return res.status(200).send(community);

    } catch (error) {
        return res.status(500).send({ message: error.message });
    }
}

exports.updateCommunityById = async (req, res, next) => {
    //PATCH REQUEST
    //http://localhost:2000/api/community/:communityId/update
    //http://localhost:2000/api/community/628f256391763d00e9be6c7a/update
    try {
        const community = await CommunityModel.findById(req.params.communityId);
        if(!community) return res.status(400).send({ message: `No community found`});
        // let updatesd = req.body;
        let updateCommunity = {...community._doc, ...req.body }      

        const updated  = await CommunityModel.findByIdAndUpdate(req.params.communityId, {$set: { ...req.body } }, {new: true } );

        return res.status(201).send({ message: "Community updated"});

    } catch (error) {
        return res.status(500).send({ message: error.message });
    }
}

exports.deleteCommunityById = async (req, res, next) => {
    //DELETE REQUEST
    //http://localhost:2000/api/community/:communityId/delete
    //http://localhost:2000/api/community/628f256391763d00e9be6c7a/delete
    try {
        const community = await CommunityModel.findById(req.params.communityId);
        if(!community) return res.status(400).send({ message: `No community found`});

        community.delete();
        return res.status(201).send({ message: "Community updated"});

    } catch (error) {
        return res.status(500).send({ message: error.message });
    }
}


exports.searchCommunityByParams = async (req, res, next) => {
    //GET REQUEST
    //http://localhost:2000/api/community/search

    try {
        const community = await CommunityModel.find({title: { $regex: '.*' + req.body.title + '.*', $options: 'i' }}).select('-__v -createdAt -updatedAt');
        
        if(!community) return res.status(400).send({ message: `No community found`});

        let result = { communities: community, totalCount: community.length };

        return res.status(201).send(result);

    } catch (error) {
        return res.status(500).send({ message: error.message });
    }
}



