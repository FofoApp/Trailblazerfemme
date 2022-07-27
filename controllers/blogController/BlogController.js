const mongoose = require('mongoose');

const BlogModel = require('./../../models/blogModel/BlogModel');
const BlogCategoryModel = require('./../../models/blogModel/BlogCategoryModel');
const BlogLikeModel = require('./../../models/blogModel/BlogLikeModel');

exports.blog = async (req, res, next) => {
    //GET REQUEST
    //http://localhost:2000/api/blog

    try {

        const categories = await BlogCategoryModel.find({}).select('-__v -createdAt -updatedAt');
        const blogs = await BlogModel.find({}).select('-__v -createdAt -updatedAt');

       const newBlog =  await BlogModel.find({}).where('blogviews').size(1)

        // const popularBlog  = await BlogModel.aggregate([
        //     {$project: { count: { $cond: { if: { $isArray: "$blogviews" }, then: { $size: "$blogviews" }, else: "$$REMOVE"} }, 
        //     title: 1, image: 1,description: 1 }},
        //     // { $limit: 1 }
        // ]);

        //SHOW POPULAR BLOG POST IF VIEWS IS GREATER THAN 20
        const popularBlog = await BlogModel.find({
            $expr: {
                $gt: [{ $size: { $ifNull: ["$blogviews", []] } }, 20]
            }
        }).populate('blogCategory')
        return res.status(200).send({ categories, blogs, popularBlog });

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
    try {
        let findBlogExist = await BlogModel.findOne({ title: req.body.title });

        if(findBlogExist) {
            return res.status(401).send({ message: `Blog name ${req.body.title } already exists` });
        }

        let createNewBlog = new BlogModel(req.body);
        let savedNewBlog = await createNewBlog.save();
        // const populatedData = await BlogModel.findById(savedNewBlog._id).populate('created_by').populate('blogCategory')
        let query=[
			{
				$lookup: { from: "users", localField: "created_by", foreignField: "_id", as: "creator" }
			},
			{$unwind: '$creator'},
			{
				$lookup: { from: "blogcategories", localField: "blogCategory", foreignField: "_id", as: "category_details" }
			},
			{$unwind: '$category_details'},
			{
				$match:{
					'_id':mongoose.Types.ObjectId(savedNewBlog._id)
				}
			},
			{ 
	    		$project : {
    			"_id": 1,
    			"createdAt": 1,
	    		"title": 1,
	    		"short_description": 1,
	    		"description": 1,
				"image": 1,
	    		"category_details.name": 1,
				"category_details.slug": 1,
				"category_details._id": 1,
				"creator._id": 1 ,
	    		"creator.email": 1 ,
	    		"creator.first_name": 1,
	    		"creator.last_name": 1,
	    		"comments_count":{$size:{"$ifNull":["$blog_comments",[]]}},
	    		"likes_count":{$size:{"$ifNull":["$blog_likes",[]]}}
	    		} 
	    	}
		];

		let blogs = await BlogModel.aggregate(query);

        return res.status(200).send({ message: "Blog Created Successfully", populatedData });
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
			{
				$lookup: { from: "users", localField: "created_by", foreignField: "_id", as: "creator" },
                
			},
            {$unwind: '$creator'},

            { $lookup: { from: "blogcategories", localField: "blogCategory", foreignField: "_id", as: "category_details" },
			},

			{$unwind: '$category_details'},
    ];

        if(req.query.keyword && req.query.keyword !=''){ 
			query.push({
			  $match: { 
			    $or :[
			      { title : { $regex: '.*' + req.query.keyword + '.*',  $options: 'i' }  },
			      { 'category_details.name' : {$regex: '.*' + req.query.keyword + '.*',  $options: 'i' }  }
			    ]
			  }
			});
		}

		if(req.query.category){		
			query.push({
			    $match: { 
			    	'category_details.slug':{$regex: '.*' + req.query.category + '.*',  $options: 'i' },
			    }	
			});
		}

        if(req.query.userId){		
			query.push({
			    $match: { 
			    	created_by: mongoose.Types.ObjectId(req.query.userId),
			    }	
			});
		}

        let total= await BlogModel.countDocuments(query);
		let page= (req.query.page) ? parseInt(req.query.page) : 1;
		let perPage = (req.query.perPage) ? parseInt(req.query.perPage) : 10;
		let skip = (page-1)*perPage;

        query.push({ $skip:skip, });
		query.push({ $limit:perPage, });

        query.push(
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
	    		"creator.fullname":1 ,
	    		"comments_count":{$size:{"$ifNull":["$blog_comments",[]]}},
	    		"likes_count":{$size:{"$ifNull":["$blog_likes",[]]}}
	    		} 
	    	}
	    );

        if(req.query.sortBy && req.query.sortOrder){
			var sort = {};
			sort[req.query.sortBy] = (req.query.sortOrder=='asc') ? 1 : -1;
			query.push({ $sort: sort });
		}else{
			query.push({ $sort: {createdAt:-1} });	
		}

        const findBlogExist = await BlogModel.aggregate(query);
        let paginationData = { totalRecords:total, currentPage:page, perPage:perPage, totalPages:Math.ceil(total/perPage) }

        return res.status(200).send({ message: "All Blogs", blogs: findBlogExist, paginationData: paginationData  });
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
        let blogId = req.params.blogId;
        const currentUser = req.user.id;

        if(!mongoose.Types.ObjectId.isValid(blogId)){
			return res.status(400).send({ message:'Invalid blog id', blogPost: [] });
		}
        const findBlogExist = await BlogModel.findById(blogId);
        console.log(findBlogExist.id)

        if(!findBlogExist.blogviews.includes(currentUser)) {
            findBlogExist = await BlogModel.updateOne({ _id: findBlogExist.id}, {$push: { "blogviews": currentUser }});
        }

        if(!findBlogExist) {
            return res.status(401).send({ message: "Blog not found" });
        }

		
		let query = [
			{
				$lookup: { from: "users", localField: "created_by", foreignField: "_id", as: "creator" }
			},
			{$unwind: '$creator'},
			{
				$lookup: { from: "blogcategories", localField: "blogCategory", foreignField: "_id", as: "category_details" }
			},
			{$unwind: '$category_details'},
			{
				$match:{ '_id': mongoose.Types.ObjectId(blogId) }
			},
			{ 
	    		$project : {
    			"_id": 1,
    			"createdAt": 1,
	    		"title": 1,
	    		"short_description": 1,
	    		"description":1,
				"image": 1,
	    		"category_details.name": 1,
				"category_details.slug": 1,
				"category_details._id": 1,
				"creator._id": 1,
	    		"creator.email": 1,
	    		"creator.profileImagePath": 1,
	    		"comments_count":{$size:{"$ifNull":["$blog_comments",[]]}},
	    		// "likes_count":{$size:{"$ifNull":["$blog_likes",[]]}}
	    		} 
	    	}
		];

		let blogPost = await BlogModel.aggregate(query);

        //  let blogPost = await BlogModel.findOne({_id:blogId}).populate('blogCategory').populate('created_by');

        return res.status(200).send({ blogPost: blogPost });
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
    try {
        let blogId = req.params.blogId;
        if(!mongoose.Types.ObjectId.isValid(blogId)){
            return res.status(400).send({ message:'Invalid blog id', blogPost: {} });
        }

        const findBlogExist = await BlogModel.findOne({_id: req.params.blogId });

        if(!findBlogExist) {
            return res.status(404).send({ message: "Blog not found", blogPost: {}  });
        }

        let current_user = req.user;

        if(findBlogExist.created_by != current_user._id){
            return res.status(400).send({ message:'Access denied', blogPost: {} });
        }

        await BlogModel.updateOne({_id: findBlogExist._id},{
            title:req.body.title,
            short_description:req.body.short_description,
            description:req.body.description,
            category:req.body.category,
            image:image_file_name
         });

         let query=[
            {
                $lookup: { from: "users", localField: "created_by", foreignField: "_id", as: "creator" }
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
                "comments_count":{$size:{"$ifNull":["$blog_comments",[]]}},
                "likes_count":{$size:{"$ifNull":["$blog_likes",[]]}}
                } 
            }
        ]

        const updatedBlog = await BlogModel.aggregate(query);

        return res.status(200).send({ message: "Blog updated successfully", updatedBlog: updatedBlog });
    } catch (error) {
        return res.status(500).send({ message: error.message })
    }
}



exports.deleteBlogById = async (req, res, next) => {
    //DELETE REQUEST
    // http://localhost:2000/api/blog/:blogCategoryId/delete
    // http://localhost:2000/api/blog/6286c236fbc9ab5d15903635/delete
    // NOTE::::: REMEMBER TO VALIDATE YOUR REQUEST INPUT(S) BEFORE SAVING TO DB
    try {
        let blogId = req.params.blogId;
        if(!mongoose.Types.ObjectId.isValid(blogId)){
            return res.status(400).send({ message:'Invalid blog id', blogPost: {} });
        }

        const findBlogExist = await BlogModel.findById(blogId);

        if(!findBlogExist) {
            return res.status(400).send({ message: "Blog not found", blogPost: {}  });
        }

        const blogPost = await BlogModel.findOne({ _id: findBlogExist._id });

        if(!blogPost){
            return res.status(400).send({ message:'No blog found', blogPost:{} });
        } else {
            let current_user = req.user;

			if(blogPost.created_by != current_user._id){
				return res.status(400).send({ message:'Access denied', blogPost:{} });
            }else {
                // let old_path=publicPath+'/uploads/blog_images/'+blog.image;
				// if(fs.existsSync(old_path)){
				// 	fs.unlinkSync(old_path);
				// }

				await BlogModel.deleteOne({_id: blogPost._id });
				return res.status(200).send({ message:'Blog successfully deleted', blogPost:{} 	});
            }

        }

    } catch (error) {
        return res.status(500).send({ message: error.message })
    }
}


exports.blogLikes = async (req, res, next) => {
    try {
        const blogId = req.params.blogId;

        if(!mongoose.Types.ObjectId.isValid(blogId)){
            return res.status(400).send({ message:'Invalid blog id', blogPost: {} });
        }

        const findBlogExist = await BlogModel.findById(blogId);

        if(!findBlogExist) {
            return res.status(400).send({ message: "Blog not found", blogPost: {}  });
        }

        // const blogPost = await BlogModel.findOne({ _id: findBlogExist._id });
        let current_user = req.user;

        const blogLike = await BlogLikeModel.findOne({ blogId, userId: current_user.id });
        if(!blogLike) {
            const blogLikeDoc = new BlogLikeModel({ userId: current_user.id, blogId });
            const likeData = await blogLikeDoc.save();
            const likeDate = await BlogModel.updateOne({ _id: blogId}, {$push: {blogLikes: likeData._id }});

        }else {
            deletedLike = await BlogLikeModel.deleteOne({ _id: blogLike._id });

            await BlogModel.updateOne({ _id: blogLike.blogId}, {$pull: {blogLikes: likeData._id }});
        }
        
        
        return res.status(200).send({ message: "Success"})
    } catch (error) {
        return res.status(200).send({ message: error.message })
    }
}
