const mongoose = require('mongoose');

const PostModel = require('./../../models/postModel/PostModel');
const CommunityModel = require('./../../models/community/CommunityModel')
const { cloudinary } = require('./../../helpers/cloudinary')

exports.createNewPost = async (req, res, next) => {

    //VALIDATE USER INPUTS BEFORE PROCESSING
    //POST REQUEST
    //http://localhost:2000/api/posts/:communityId/create
    /**
    *       {
            "title": "Post One",
            "postImage": "post image",
            "communityId": "628f256391763d00e9be6c7a",
            "creatorId": "628695d03cf50a6e1a34e27b"
            }
     */
        const communityId = req.params.communityId;
        const currentUser = req.user.id;
    
    try {
        const findIfPostExist = await PostModel.findOne({ title: req.body.title });
        if(findIfPostExist) {
            return res.status(200).send({ message: "Post name already exist"});
        }

        // //Upload Image to cloudinary
        // let uploaderResponse = await cloudinary.uploader.destroy(profile.publicId);        
        // if(!uploaderResponse) {
        //     //Reject if unable to upload image
        //     return res.status(404).send({ message: "Unable to delete profile image please try again"});
        // }
        // //Upload Image to cloudinary
        // uploaderResponse = await cloudinary.uploader.upload(req.file.path);



        //Upload Image to cloudinary
        const uploaderResponse = await cloudinary.uploader.upload(req.file.path);

        if(!uploaderResponse) {
            //Reject if unable to upload image
            return res.status(404).send({ message: "Unable to upload image please try again"});
        }
                

        const createPost = new PostModel({
            ...req.body,
            communityId:communityId,
            createdBy: currentUser,
            postCloudinaryPublicId: uploaderResponse.public_id,
            postImage: uploaderResponse.secure_url,
        });  
        const createdPost = await createPost.save();

        const updatedCommunity = await CommunityModel.updateOne({_id: communityId}, {$push: { "posts": createdPost._id }})

        return res.status(200).send({ message: "Post created successfully"});
    } catch (error) {
        return res.status(500).send({ message: error.message });
    }
}


exports.listPosts = async (req, res, next) => {
    //GET REQUEST
    //http://localhost:2000/api/posts/lists

    try {
        const findIfPostExist = await PostModel.find({}).populate('likes').populate('comments.createdBy', '_id fullname')

        if(!findIfPostExist) {
            return res.status(200).send({ message: "No post found!" });
        }

        return res.status(200).send({ posts: findIfPostExist });

    } catch (error) {
        return res.status(500).send({ message: error.message });
    }
}


exports.searchPosts = async (req, res, next) => {
    const searchKeyword = req.body.searchKeyword;

    try {
 
        let page = (req.query.page) ? parseInt(req.query.page) : 1;
        let perPage = (req.query.perPage) ? parseInt(req.query.perPage) : 10;
        let skip = (page-1)*perPage;
 
    const searchForPost = await PostModel.find({
            $or: [
                { title: {  $regex: '.*' + searchKeyword + '.*',  $options: 'i'  } },
                // { hosts: { $regex: '.*' + searchKeyword + '.*',  $options: 'i' } },
                // { topic: { $regex: '.*' + searchKeyword + '.*',  $options: 'i' } },
            ],
            }
 
    ).skip(skip).limit(perPage);
    
      //.select('-trendingId -recentSearch -cloudinaryPublicId -createdAt -updatedAt -__v')
 
        if(!searchForPost) {
            return res.status(404).send({ message: "Post with the search phrase not found!"})
        }
 
        let total = searchForPost ? searchForPost.length : 0;
 
        let paginationData = { totalRecords:total, currentPage:page, perPage:perPage, totalPages:Math.ceil(total/perPage) }
        
        return res.status(200).send({ posts:searchForPost, paginationData});

    } catch (error) {
        return res.status(500).send({ message: error.message });
    }
}


exports.findPostById = async (req, res, next) => {
    //GET REQUEST
    //http://localhost:2000/api/posts/postId/get
    //http://localhost:2000/api/posts/628f6b11d6d4e657a47ffa8c/get
    const postId = req.params.postId;
    const communityId = req.params.communityId;
    try {
        if(!mongoose.Types.ObjectId.isValid(postId)) {
            return res.status(200).send({ message: "Invalid post parameter" });
        }
        
        const findIfPostExist = await PostModel.findById(postId);

        if(!findIfPostExist) {
            return res.status(200).send({ message: "No post found!" });
        }

        return res.status(200).send({ post: findIfPostExist });

    } catch (error) {
        return res.status(500).send({ message: error.message });
    }
}


exports.updatePostById = async (req, res, next) => {
    //PATCH REQUEST
    //http://localhost:2000/api/posts/postId/update
    //http://localhost:2000/api/posts/628f6b11d6d4e657a47ffa8c/update

    const postId = req.params.postId;

    try {
        if(!mongoose.Types.ObjectId.isValid(postId)) {
            return res.status(200).send({ message: "Invalid post parameter" });
        }

        //IF AN IMAGE IS PASSED ALONG WITH THE POST UPDATE
        if(req.file) {
            const post = await PostModel.findById(postId);

            //Upload Image to cloudinary
            let uploader = await cloudinary.uploader.destroy(post.postCloudinaryPublicId); 
    
            if(!uploader) {
                //Reject if unable to upload image
                return res.status(404).send({ message: "Unable to delete post image please try again"});
            }

            //SET THE POST IMAGE FIELD TO NULL IN THE DATABASE
            await PostModel.findByIdAndUpdate(postId, {$set: { postCloudinaryPublicId:null, postImage: null  } }, {new: true });
            
            //Upload new post Image to cloudinary
            const uploaderResponse = await cloudinary.uploader.upload(req.file.path);


            if(!uploaderResponse) {
                //Reject if unable to upload image
                return res.status(404).send({ message: "Unable to upload image please try again"});
            }

            //UPDATE OTHER FIELDS IN THE DATABASE
            const updatedPost = await PostModel.findByIdAndUpdate(postId, {$set: {...req.body,
                postCloudinaryPublicId: uploaderResponse.public_id,
                postImage: uploaderResponse.secure_url,

            } }, {new: true });

            return res.status(200).send({ message: "Post updated successfully "});
        }

        const updatedPost = await PostModel.findByIdAndUpdate(postId, {$set: req.body }, {new: true });

        if(!updatedPost) {
            return res.status(200).send({ message: "Unable to update post!" });
        }

        return res.status(200).send({ message: "Post updated successfully "});

    } catch (error) {
        return res.status(500).send({ message: error.message });
    }
}


exports.deletePostById = async (req, res, next) => {
    //DELETE REQUEST
    //http://localhost:2000/api/posts/postId/delete
    //http://localhost:2000/api/posts/628f6b11d6d4e657a47ffa8c/delete
    const postId = req.params.postId;
    try {
        if(!mongoose.Types.ObjectId.isValid(postId)) {
            return res.status(200).send({ message: "Invalid post parameter" });
        }
        const post = await PostModel.findById(postId);

        //Upload Image to cloudinary
        let uploaderResponse = await cloudinary.uploader.destroy(post.postCloudinaryPublicId); 

        if(!uploaderResponse) {
            //Reject if unable to upload image
            return res.status(404).send({ message: "Unable to delete profile image please try again"});
        }

        const deletedPost = await PostModel.findByIdAndDelete(postId);

        if(!deletedPost) {
            return res.status(200).send({ message: "Unable to delete post!" });
        }

        return res.status(200).send({ message: "Post deleted successfully "});

    } catch (error) {
        return res.status(500).send({ message: error.message });
    }
}
