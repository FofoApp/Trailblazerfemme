const mongoose = require('mongoose');

const BlogCommentModel = require('./../../models/blogModel/BlogCommentModel');
const BlogModel = require('./../../models/blogModel/BlogModel');

const createNewBlogComment = async (req, res, next) => {
    //NOTE::: REMEMBER TO VALIDATE FOR USER INPUT BEFORE FURTHER PROCESSING
    
    try {
        let blogId = req.params.blogId;
        if(!mongoose.Types.ObjectId.isValid(blogId)) {
            return res.status(400).send({ message: "Invalid blogId"})
        }
        const findBlogCommentExists  = await BlogCommentModel.findOne({ blogId: blogId });

        if(!findBlogCommentExists){
            return res.status(400).send({ message: "Comment not found"})
        }

        let newBlogComment = new BlogCommentModel({...req.body, blogId: blogId, userId: req.user.id });
        const savedBlogComment = await newBlogComment.save();
        await BlogModel.updateOne({ _id: blogId }, { $push: { blogComment: savedBlogComment._id } });

        let query = [
			{
				$lookup: { from: "users", localField: "userId", foreignField: "_id", as: "user" },
                
			},
            {$unwind: '$user'},
            {
                $match: { '_id': mongoose.Types.ObjectId(savedBlogComment._id) }
            },
            {
                $sort: { createdAt: -1 }
            }
        ];

        const comments = await BlogCommentModel.aggregate(query);


    
        return res.status(201).send({ message: "Blog Comment created ", blogComments: comments[0] });

        
    } catch (error) {
        return res.status(500).send({ message: err.message })
    }
}

const FetchBlogComments = async (req, res, next) => {
    //http://localhost:2000/api/blog/6286c236fbc9ab5d15903635/comments
    //http://localhost:2000/api/blog/6286c236fbc9ab5d15903635/comments?perPage=2
    try {

        let blogId = req.params.blogId;

        console.log(blogId)

        if(!mongoose.Types.ObjectId.isValid(blogId)) {
            return res.status(400).send({ message: "Invalid blogId"})
        }
        // const findBlogCommentExists  = await BlogCommentModel.findOne({ _id: blogId });
        const findBlogExists  = await BlogModel.findOne({ _id: blogId });

        if(!findBlogExists){
            return res.status(400).send({ message: "Blog not found"})
        }

        let query = [
			{
				$lookup: { from: "users", localField: "userId", foreignField: "_id", as: "user" },
                
			},
            {$unwind: '$user'},
            {
                $match: { 'blogId': mongoose.Types.ObjectId(blogId) }
            },
            {
                $sort: { createdAt: -1 }
            }

            // { $lookup: { from: "blogcategories", localField: "blogCategory", foreignField: "_id", as: "category_details" },
			// },

			// {$unwind: '$category_details'},
        ];

        let total= await BlogCommentModel.countDocuments(query);
		let page = (req.query.page) ? parseInt(req.query.page) : 1;
		let perPage = (req.query.perPage)? parseInt(req.query.perPage) : 10;
		let skip = (page-1)*perPage;

        let paginationData = { totalRecords:total, currentPage:page, perPage:perPage, totalPages:Math.ceil(total/perPage) }
        query.push({ $skip:skip, });
		query.push({ $limit:perPage, });

        let comments = await BlogCommentModel.aggregate(query);
        return res.status(200).send({ message: "Blog Comments", comments: comments, paginationData: paginationData });


    } catch (error) {
        
    }
}

const FetchBlogCommentById = async (req, res, next) => {
    try {
        
    } catch (error) {
        
    }
}


const SearchBlogCommmentByCommentId = async (req, res, next) => {
    try {
        
    } catch (error) {
        
    }
}

const updateBlogCommentById = async (req, res, next) => {
    //NOTE::: REMEMBER TO VALIDATE FOR USER INPUT BEFORE FURTHER PROCESSING
    try {
        let commentId = req.params.commentId;
        if(!mongoose.Types.ObjectId.isValid(blogId)) {
            return res.status(400).send({ message: "Invalid Comment Id"})
        }
        const findBlogCommentExists  = await BlogCommentModel.findOne({ _id: commentId });

        if(!findBlogCommentExists){
            return res.status(400).send({ message: "Comment not found"})
        }

        let currentUser = req.user;
        if(findBlogCommentExists._id !== currentUser.id) {
            return res.status(400).send({ message: "Access Denied"})
        }

        await BlogCommentModel.updateOne({ _id: commentId }, {$set: { comment: req.body.comment }});

        let query = [
			{
				$lookup: { from: "users", localField: "userId", foreignField: "_id", as: "user" },
                
			},
            {$unwind: '$user'},
            {
                $match: { '_id': mongoose.Types.ObjectId(commentId) }
            },
            {
                $sort: { createdAt: -1 }
            }
        ];

        const comments = await BlogCommentModel.aggregate(query);
        return res.status(200).send({ message: "Blog Comments updated successfully"});

    } catch (error) {
        return res.status(400).send({ message: error.message});
    }   
}


const deleteBlogCommentById = async (req, res, next) => {
    try {
        let commentId = req.params.commentId;
        if(!mongoose.Types.ObjectId.isValid(blogId)) {
            return res.status(400).send({ message: "Invalid Comment Id"})
        }
        const findBlogCommentExists  = await BlogCommentModel.findOne({ _id: commentId });

        if(!findBlogCommentExists){
            return res.status(400).send({ message: "Comment not found"})
        }

        let currentUser = req.user;
        if(findBlogCommentExists._id !== currentUser.id) {
            return res.status(400).send({ message: "Access Denied"})
        }

        await BlogCommentModel.deleteOne({ _id: commentId });
        await BlogModel.updateOne({_id: findBlogCommentExists.blogId }, { $pull: { blogComment: commentId }});

        let query = [
			{
				$lookup: { from: "users", localField: "userId", foreignField: "_id", as: "user" },
                
			},
            {$unwind: '$user'},
            {
                $match: { '_id': mongoose.Types.ObjectId(commentId) }
            },
            {
                $sort: { createdAt: -1 }
            }
        ];

        const comments = await BlogCommentModel.aggregate(query);
        return res.status(200).send({ message: "Blog Comments updated successfully"});

    } catch (error) {
        return res.status(400).send({ message: error.message});
    }   
}


module.exports = {
    createNewBlogComment,
    FetchBlogComments,
    FetchBlogCommentById,
    SearchBlogCommmentByCommentId,
    updateBlogCommentById,
    deleteBlogCommentById
}