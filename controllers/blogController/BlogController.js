const fs = require('fs');
const mongoose = require('mongoose');

const BlogModel = require('./../../models/blogModel/BlogModel');
const BlogCommentModel = require('./../../models/blogModel/BlogCommentModel');
const BlogCategoryModel = require('./../../models/blogModel/BlogCategoryModel');
const BlogLikeModel = require('./../../models/blogModel/BlogLikeModel');
const ProfileModel = require('./../../models/ProfileImageModel');
const { cloudinary } = require('./../../helpers/cloudinary');

exports.getSpecificBlogAndItsComments = async (req, res, next) => {
    const testBlog = await BlogModel.aggregate([
        { $lookup: { from: "users", localField: 'createdBy', foreignField: "_id", as: "author" } },
        {$unwind: "$author" },
        { $lookup: { from: "blogcomments", localField: '_id', foreignField: "blogId", as: "comments" } },
        { $lookup: { from: "profiles", localField: 'comments.userWhoCommentId', foreignField: "userId", as: "profile" } },
        { $project: { 
            _id: 1, 
            title:1, 
            description:1, 
            blogImagePath:1, 
            profile:1,
             "author._id":1, 
             "author.fullname":1,
            "author.profileImage":1,
            "comments": 1,
            "comments": {
                "$map": {
                    "input": "$comments",
                    "as": "comment",
                    "in": {
                        "_id": "$$comment._id",
                        "comment": "$$comment.comment",
                        "createdDate": "$$comment.createdAt",
                        "userWhoCommentId": "$$comment._id",

                        "profileImage": "$$comment.userWhoComment.profileImage",
                        "fullname": "$$comment.userWhoComment.fullname",
                    }
                }
            }
    
        }  }
        ]);
}

exports.blog = async (req, res, next) => {
    //GET REQUEST
    //http://localhost:2000/api/blog
    // const userId = "628695d03cf50a6e1a34e27b";
    const userId = req.user.id;
    let {blogId} = req.params;
    //Hot
    //Recent
    //popular

    try {

        const categories = await BlogCategoryModel.find({}).select('-__v -createdAt -updatedAt');
    
        const blogs = await BlogModel.find()
                                        .select('createdAt title blogLikes description blogImagePath createdBy blogviews comments')
                        
                                        .populate({
                                            path: 'createdBy',
                                            model: 'User',
                                            select: 'fullname profileImage createdAt',
                                            // populate: {
                                            //     path: 'profileId',
                                            //     model: 'Profile',
                                            //     select: 'id userId profileImage'
                                            // }
                                        })
                                        .populate({
                                            path: 'comments.commentedBy',
                                            model: 'User',
                                            select: 'fullname profileImage createdAt',

                                            populate: {
                                                path: 'profileId',
                                                model: 'Profile',
                                                select: 'id userId profileImage'
                                            }
                                        }).sort({ createdAt: -1  })
                                    

       const newBlog =  await BlogModel.find({}).where('blogviews').size(1)

        // const popularBlog  = await BlogModel.aggregate([
        //     {$project: { count: { $cond: { if: { $isArray: "$blogviews" }, then: { $size: "$blogviews" }, else: "$$REMOVE"} }, 
        //     title: 1, image: 1,description: 1 }},
        //     // { $limit: 1 }
        // ]);

        //SHOW POPULAR BLOG POST IF VIEWS IS GREATER THAN 20
        const popularBlog = await BlogModel.find(
            {
            $expr: {
                $gt: [{ $size: { $ifNull: ["$blogviews", []] } }, 20]
            },
        },
        
        ).populate('blogCategory');
        return res.status(200).send({ categories:categories, recent: blogs, popular:popularBlog });

    } catch (error) {
        return res.status(500).send({ message: error.message })
    }
}


exports.createNewBlog = async (req, res, next) => {
    //POST REQUEST
    //http://localhost:2000/api/blog/create
    /**
     * {
        "title": "Blog Title With Blog Category And User",
        "short_description": "Blog short Description",
        "description": "Blog short Description",
        "blogCategory":"6286b37ac420a04878903e9a",
        "created_by": "628695d03cf50a6e1a34e27b"
        }
     */
    // NOTE::::: REMEMBER TO VALIDATE YOUR REQUEST INPUT(S) BEFORE SAVING TO DB
    const blogCreatedBy = req.user.id;
    try {
        let findBlogExist = await BlogModel.findOne({ title: req.body.title });
     

        if(findBlogExist) {
            return res.status(401).send({ message: `Blog name ${req.body.title } already exists` });
        }

        // //Upload Image to cloudinary
        const uploaderResponse = await cloudinary.uploader.upload(req.file.path);

        if(!uploaderResponse) {
            //Reject if unable to upload image
            return res.status(404).send({ message: "Unable to upload image please try again"});
        }

        let blogData = {
            ...req.body,
            createdBy:blogCreatedBy,            
            blogImageCloudinaryPublicId: uploaderResponse.public_id,
            blogImagePath: uploaderResponse.secure_url
        }

        // return res.send(blogData)

        let createNewBlog = new BlogModel(blogData);
        let savedNewBlog = await createNewBlog.save();
        if(!savedNewBlog) {
            return res.status(401).send({ message: "Unable to create new blog"});
        }

        let blogs = await BlogModel.find()
                                    .populate({           
                                        path: 'createdBy',
                                        select: 'fullname profileImage',
                                        model: 'User',
                                        // populate: {
                                        //     path: 'profileId',
                                        //     model: 'Profile',
                                        //     select: 'comment commentDate userId profileImage ',
                                        // },
                                        
                                    })

        return res.status(200).send({ message: "Blog Created Successfully", blogs });
    } catch (error) {
        return res.status(500).send({ message: error.message })
    }
}


exports.FetchBlogs = async (req, res, next) => {
    //GET REQUEST
    // NOTE::::: REMEMBER TO VALIDATE YOUR REQUEST INPUT(S) BEFORE SAVING TO DB
    // http://localhost:2000/api/blog/lists?category=one
    // http://localhost:2000/api/blog/lists?pages=1&perPage=2
    // http://localhost:2000/api/blog/lists?sortBy=title&sortOrder=asc
    // http://localhost:2000/api/blog/lists


    try {

        let query = [
			{ $lookup: { from: "users", localField: "createdBy", foreignField: "_id", as: "creator" }, },
            {
                $addFields: { "id" : "$_id",  },
            },
            {$unwind: '$creator'},

            { $lookup: { from: "blogcategories", localField: "blogCategory", foreignField: "_id", as: "category_details" }, },
            {
                $addFields: { "id" : "$_id", },
            },
			{$unwind: '$category_details'},
    ];

        if(req.query.keyword && req.query.keyword !==''){ 
			query.push({
			  $match: { 
			    $or :[
			      { title : { $regex: '.*' + req.query.keyword + '.*',  $options: 'i' }  },
			      { 'category_details.name' : {$regex: '.*' + req.query.keyword + '.*',  $options: 'i' }  }
			    ]
			  }
			});
		}

		if(req.query.category && req.query.category !== ''){		
			query.push({
			    $match: { 
			    	'category_details.slug':{$regex: '.*' + req.query.category + '.*',  $options: 'i' },
			    }	
			});
		}

        if(req.query.userId && req.query.userId !== ''){		
			query.push({ $match: { created_by: mongoose.Types.ObjectId(req.query.userId), } });
		}

        let total= await BlogModel.countDocuments(query);
		let page= (req.query.page) ? parseInt(req.query.page) : 1;
		let perPage = (req.query.perPage) ? parseInt(req.query.perPage) : 10;
		let skip = (page - 1) * perPage;

        query.push({ $skip:skip, });
		query.push({ $limit:perPage, });

        query.push(
	    	{ 
	    		$project : {
                "_id":0,
                "id":1,
    			"createdAt":1,
	    		"title": 1,
	    		"short_description":1,
	    		"description":1,
				"blogImagePath":1,
                "category_details.id":"$category_details._id",
                
	    		"category_details.name":1,
				"category_details.slug":1,
				"creator.id": "$creator._id",
	    		"creator.email":1,
	    		"creator.fullname":1,
	    		"creator.profileImage":1,
	    		"comments_count":{ $size: {"$ifNull": ["$blogComments",[] ] } },
	    		"likes_count":{ $size:{"$ifNull": ["$blogLikes", [] ] } }
	    		}
	    	}
	    );

        if(req.query.sortBy && req.query.sortOrder){
			var sort = {};
			sort[req.query.sortBy] = (req.query.sortOrder == 'asc' ) ? 1 : -1;
			query.push({ $sort: sort });
		} else {
			query.push({ $sort: {createdAt: -1 } });	
		}

        const findBlogExist = await BlogModel.aggregate(query);
        let paginationData = { totalRecords:total, currentPage:page, perPage:perPage, totalPages:Math.ceil(total/perPage) }

        return res.status(200).send({ blogs: findBlogExist, paginationData: paginationData  });
    } catch (error) {
        return res.status(500).send({ message: error.message })
    }
}


exports.FetchBlogById = async (req, res, next) => {
    //GET REQUEST
    // http://localhost:2000/api/blog/blogId/show
    // http://localhost:2000/api/blog/6286a710380730138c08e194/show

    // NOTE::::: REMEMBER TO VALIDATE YOUR REQUEST INPUT(S) BEFORE SAVING TO DB
    try {
        let {blogId} = req.params;
        let currentUser = req.user.id;

        if(!mongoose.Types.ObjectId.isValid(blogId)){
			return res.status(400).send({ message:'Invalid blog id', blogPost: [] });
		}
        let findBlogExist = await BlogModel.findById(blogId);

        if(!findBlogExist) {
            return res.status(401).send({ message: "Blog not found" });
        }

        if(!findBlogExist.blogviews.includes(currentUser)) {
            findBlogExist = await BlogModel.updateOne({ _id: findBlogExist.id}, {$addToSet: { "blogviews": currentUser }});
        }

        // let blogPost = await BlogModel.findById(blogId)
        //                             .populate('createdBy', 'fullname createdAt profileImage blogLikes blogviews')
        //                             .populate('blogCategory', 'name slug')
        //                             .populate('blogComments')


        let blogPost = await BlogModel.aggregate([
            { $match: { '_id': { '$eq': mongoose.Types.ObjectId(blogId) }  } },
            { $lookup: { from: "users", localField: 'createdBy', foreignField: "_id", as: "author" } },
            {$unwind: "$author" },
    
            { $lookup: { from: "blogcomments", 
                    let: { blogId: "$_id" },
                    pipeline: [ 
                    { 
                        $match: { $expr: {$eq: ["$$blogId", "$blogId"]  }  }  
                    }, 
                    {
                        $lookup: { from: "users", localField: 'userWhoComment', foreignField: "_id", as: "userWhoComment" } ,
    
                    },
                    { $unwind: "$userWhoComment"  }
                ],
                as: "comments",
                    
            } },
    
            { $project: { 
                id: "$_id",
                _id: 0,
                title:1, 
                description:1, 
                blogImagePath:1,
                createdAt:1,
                "author.id": "$author._id",
                 "author.fullname":1,
                "author.profileImage":1,
                // "comments": 1,
                "comments": {
                    "$map": {
                        "input": "$comments",
                        "as": "comment",
                        "in": {
                            "id": "$$comment._id",
                            "comment": "$$comment.comment",
                            "createdDate": "$$comment.createdAt",
                            "fullname": "$$comment.userWhoComment.fullname",
                            "commentUserImage": "$$comment.userWhoComment.profileImage",
                            "commentUserId": "$$comment.userWhoComment._id",
                        }
                    }
                }
    
            }  }
    
            ]);

        return res.status(200).send(blogPost);
    } catch (error) {
        return res.status(500).send({ message: error.message })
    }
}


exports.SearchBlogsByCategoryId = async (req, res, next) => {
    // NOTE::::: REMEMBER TO VALIDATE YOUR REQUEST INPUT(S) BEFORE SAVING TO DB
    // try {
        

    //     let query=[
	// 		{
	// 			$lookup: { from: "users", localField: "created_by", foreignField: "_id", as: "creator" }
	// 		},
    //     ];

    //     const findBlogExist = await BlogModel.find(query);

    //     return res.status(200).send({ message: "All Blogs", findBlogExist });
    // } catch (error) {
    //     return res.status(500).send({ message: error.message })
    // }
}




exports.updateBlogById = async (req, res, next) => {
    //PATH REQUEST
    // http://localhost:2000/api/blog/blogId/update
    // http://localhost:2000/api/blog/6286c236fbc9ab5d15903635/update
    /**
     * {
        "title": "Blog Title With Blog Category And User",
        "short_description": "Blog short Description",
        "description": "Blog short Description",
        "blogCategory":"6286b37ac420a04878903e9a",
        "image": "blog image path"
        }
     */
    // NOTE::::: REMEMBER TO VALIDATE YOUR REQUEST INPUT(S) BEFORE SAVING TO DB

    const { blogId } = req.params;

    try {

        if(!mongoose.Types.ObjectId.isValid(blogId)){
            return res.status(400).send({ message:'Invalid blog id' });
        }

        const findBlogExist = await BlogModel.findById(blogId);

        console.log(findBlogExist)
        if(!findBlogExist) {
            return res.status(404).send({ message: "Blog not found" });
        }

        let currentUser = req.user.id;

        if(findBlogExist.createdBy.toString() !== currentUser.toString()){
            return res.status(400).send({ message:'Access denied! You can only update your own post' });
        }

        //Upload Image to cloudinary
        //DELETE FILE FROM CLOUDINARY IF EXIST
        let updateData = { ...req.body };
     
        if(findBlogExist.blogImageCloudinaryPublicId && req.file?.fieldname && req.file?.fieldname === 'blogImage') {
            let uploaderResponse = await cloudinary.uploader.destroy(findBlogExist.blogImageCloudinaryPublicId); 
            
            if(!uploaderResponse) {
                //Reject if unable to upload image
                return res.status(400).send({ message: "Unable to delete profile image please try again"});
            }

            //Upload Image to cloudinary
            uploaderResponse = await cloudinary.uploader.upload(req.file.path);
            updateData['blogImageCloudinaryPublicId'] =  uploaderResponse.public_id;
            updateData['blogImagePath'] = uploaderResponse.secure_url;

            fs.unlinkSync(req?.file?.path);
        }

        await BlogModel.updateOne({_id: findBlogExist._id},{ $set: updateData });

         let query = [
            {
                $lookup: { from: "users", localField: "createdBy", foreignField: "_id", as: "creator" }
            },
            {$unwind: '$creator'},
            {
                $lookup: { from: "categories",  localField: "category", foreignField: "_id", as: "category_details" }
            },
            {$unwind: '$category_details'},
            {
                $match:{  '_id': mongoose.Types.ObjectId(findBlogExist.id) }
            },
            { 
                $project : {
                "_id":1,
                "createdAt":1,
                "title": 1,
                "short_description":1,
                "description":1,
                "image":1,
                "category_details.name":1,
                "category_details.slug":1,
                "category_details._id":1,
                "creator._id":1 ,
                "creator.email":1 ,
                "comments_count":{$size:{"$ifNull":["$blogComments",[]]}},
                "likes_count":{$size:{"$ifNull":["$blogLikes",[]]}}
                } 
            }
        ]

        const updatedBlog = await BlogModel.aggregate(query);

        return res.status(200).send({ message: "Blog updated successfully"});
    } catch (error) {
        return res.status(500).send({ error: error.message })
    }
}

exports.listBlogComment = async (req, res, next) => {
    const blogId = req.params.blogId;
    try {

        const findBlog = await BlogModel.findById(blogId);
        if(!findBlog) return res.status(404).send({ error: "Blog not found"});

        let query=[
            { $lookup: { from: "users", localField: "userWhoComment", foreignField: "_id", as: "userComment" } },
            {$unwind: '$userComment'},
            { $match: { 'blogId': mongoose.Types.ObjectId(blogId) } },
            { $sort: { createdAt:-1 } },
           { $project: { _id: 1, createdAt:1, comment:1, blogId:1, "userComment._id":1, "userComment.fullname":1, "userComment.createdAt":1  }  }
        ];

        /**
         * 
         * "_id": "62ecd9dbe704a403d542f197",
            "comment": "My second Awesome comment ",
            "blogId": "62e27d64ceefca38901a272e",
            "userWhoComment": "628696153cf50a6e1a34e2c5",
            "comments": [],
            "createdAt": "2022-08-05T08:50:35.516Z",
         */

        const comments  = await BlogCommentModel.aggregate(query);

        return res.status(200).send(comments);
        
    } catch (error) {
        return res.status(500).send({ error: error.message });
    }
}


exports.blogComment = async (req, res, next) => {
    let { comment } = req.body;
    const userWhoComment =  mongoose.Types.ObjectId(req.user.id);
    const blogId = req.params.blogId;
    try {
        let commentData = { comment, blogId, userWhoComment };

        let profile = await ProfileModel.findOne({ userId: req.user.id});
        

        // let  result = await BlogModel.findByIdAndUpdate(req.params.blogId, {$push: { comments: comment }}, {new: true})
        // .select('title description blogImagePath blogLikes blogviews comments')
        // .populate("createdBy", "fullname profileImage createdAt")
        // .populate("comments.commentedBy", "fullname commentDate profileImage")

        const newComment = new BlogCommentModel(commentData);
        const savedBlogComment = await newComment.save();

        await BlogModel.findByIdAndUpdate(blogId, { $push: {blogComments: savedBlogComment._id } } );


        return res.status(200).send(savedBlogComment);

        } catch (error) {
            // console.log(error)
            return res.status(500).send({ error: error.message });
        }
}

// exports.blogComment = async (req, res, next) => {
//     let {comment} = req.body;
//     const commentedBy =  mongoose.Types.ObjectId(req.user.id);
//     try {

  

//         let profile = await ProfileModel.findOne({ userId: req.user.id});

//         // comment = { comment: comment, commentedBy: mongoose.Types.ObjectId(req.user.id), userProfile: mongoose.Types.ObjectId(profile.id) }
        
//         comment = { comment: comment, commentedBy};

//         let  result = await BlogModel.findByIdAndUpdate(req.params.blogId, {$push: { comments: comment }}, {new: true})
//         .select('title description blogImagePath blogLikes blogviews comments')
//         .populate("createdBy", "fullname profileImage createdAt")
//         .populate("comments.commentedBy", "fullname commentDate profileImage")

//         return res.status(200).send(result);

//         } catch (error) {
//             // console.log(error)
//             return res.status(500).send({ error: error.message });
//         }
// }


exports.deleteBlogComment = (req, res, next) => {
    try {
        // {"commentId": "Updated" }
        let {comment} = req.body.commentId;
            BlogModel.findByIdAndUpdate(req.params.blogId, {$pull: { comments: { _id: {$eq: mongoose.Types.ObjectId(comment)} } }}, 
            {new: true})
            .populate("comments.commentedBy", "fullname")
            .populate("createdBy", "fullname")
            .exec((err, result) =>{
            if(err) {
                console.log(err)
                return res.status(400).json({ error: err });
            }
            return res.status(200).send(result);
        });


    } catch (error) {
        return res.status(500).send({ error: error.message });
    }
}

exports.deleteBlogById = async (req, res, next) => {

    //DELETE REQUEST
    // http://localhost:2000/api/blog/:blogCategoryId/delete
    // http://localhost:2000/api/blog/6286c236fbc9ab5d15903635/delete
    // NOTE::::: REMEMBER TO VALIDATE YOUR REQUEST INPUT(S) BEFORE SAVING TO DB

    let {blogId} = req.params;
    let currentUser = req.user.id;
    try {
        if(!mongoose.Types.ObjectId.isValid(blogId)){
            return res.status(400).send({ message:'Invalid blog id' });
        }

        const findBlogExist = await BlogModel.findById(blogId);

        if(!findBlogExist) {
            return res.status(400).send({ error: "Blog not found"});
        }

        let publicId  = findBlogExist.blogImageCloudinaryPublicId;

        let uploaderResponse = await cloudinary.uploader.destroy(publicId);

        if(!uploaderResponse) {
            return res.status(200).send({ message: "Unable to delete image, try again!"});
        }

        if(currentUser.toString() !== findBlogExist.createdBy.toString()) {
            return res.status(400).send({ error:'You can only delete blog created by you'});
        }

        await findBlogExist.remove();

        return res.status(400).send({ message:'Blog deleted successfully'});



    } catch (error) {
        return res.status(500).send({ error: error.message })
    }
}


exports.blogLikes = async (req, res, next) => {

    const { blogId } = req.params;
    let currentUser = req.user.id;

    try {
        let message = '';
        if(!mongoose.Types.ObjectId.isValid(blogId)){
            return res.status(400).send({ error:'Invalid blog id' });
        }

        let findBlogExist = await BlogModel.findById(blogId)

        if(!findBlogExist) {
            return res.status(400).send({ error: "Blog not found" });
        }

      
        if (findBlogExist.createdBy.toString() === currentUser.toString()) {
            message = "You can't like/unlike you own post";
            return res.status(200).send({message})
        }

        if(findBlogExist.blogLikes.includes(currentUser)) {

            findBlogExist.blogLikes.pull(currentUser)
            message = 'Disliked';

        } else {

            findBlogExist.blogLikes.push(currentUser)
            message = 'Liked';

        }

        findBlogExist.save();
        
        return res.status(200).send({message})
    } catch (error) {
        return res.status(200).send({ error: error.message })
    }
}
