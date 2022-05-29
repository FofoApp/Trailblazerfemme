
const mongoose = require('mongoose');

const PostModel = require('../../models/postModel/PostModel');
const CommunityModel = require('../../models/community/CommunityModel')
const { cloudinary } = require('../../helpers/cloudinary')


exports.comment = async (req, res, next) => {
    //GET REQUEST
    //http://localhost:2000/api/posts/postId/comment
    const postId = req.params.postId;    
    const currentUser = req.user.id;
    const comment = req.body.comment;

    const updateComment = { createdBy: currentUser, comment  };

    try {
        const findIfPostExistAndUpdate = await PostModel.findByIdAndUpdate(postId, { $push: { comments: updateComment } }, { new: true });

        if(!findIfPostExistAndUpdate) {
            return res.status(200).send({ message: "No post found!" });
        }

        return res.status(200).send({ posts: findIfPostExistAndUpdate });

    } catch (error) {
        return res.status(500).send({ message: error.message });
    }
}
