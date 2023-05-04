const fs = require('fs');
const mongoose = require('mongoose');

const BlogModel = require('./../../models/blogModel/BlogModel');
const BlogCommentModel = require('./../../models/blogModel/BlogCommentModel');
const BlogCategoryModel = require('./../../models/blogModel/BlogCategoryModel');
const BlogLikeModel = require('./../../models/blogModel/BlogLikeModel');
const ProfileModel = require('./../../models/ProfileImageModel');
const { cloudinary } = require('./../../helpers/cloudinary');
const BlogComment = require('./../../models/blogModel/BlogCommentModel');
const UserModel = require('./../../models/UserModel')

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
            blogImage:1, 
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



exports.blog = async (req, res) => {

//  blogComments: -1,  blogLikes: -1,  blogviews: -1,
    //GET REQUEST
    //http://localhost:2000/api/blog
    // const userId = "628695d03cf50a6e1a34e27b";

    //http://localhost:2000/api/blog?category=1&hot=2&recent=3&popular=4
   
    const userId = req.user.id;
    let { blogId } = req.params;
    let { category_page = 1, hot_page = 1, recent_page = 1, populars_page = 1 } = req.query;

 
    //Hot
    //Recent
    //popular


    if(!category_page) category_page = Number(category_page) || 1;
    if(!hot_page) hot_page = Number(hot_page) || 1;
    if(!recent_page) recent_page = Number(recent_page) || 1;
    if(!populars_page) populars_page = Number(populars_page) || 1;



    try {

        const categories = await BlogCategoryModel.paginate({}, { page: category_page, limit: 5,  select: "-createdAt -updatedAt -__v"})
    
        const hotm = await BlogModel.paginate({}, 
            { 
                page: 1, limit: 5,  
                select: "createdAt name blogLikes description blogImage createdBy blogComments blogviews",
                populate: [{
                    path: 'createdBy',
                    model: 'User',
                    select: 'fullname profileImage createdAt',
                    }, 
                    {
                        path: 'blogCategory',
                        model: 'BlogCategory',
                        select: 'name createdAt',
                    }
            ],
                sort: [
                    [{ blogComments: -1,  blogLikes: -1,  blogviews: -1, }]
                ],
            }
            );

    
        const recents = await BlogModel.paginate({},
                {
                    page: recent_page, limit: 5,
                    select: "createdAt name blogComments blogLikes description blogImage createdBy blogviews",
                    populate: [{
                        path: 'createdBy',
                        model: 'User',
                        select: 'fullname profileImage createdAt',
                        },
                        {
                            path: 'blogCategory',
                            model: 'BlogCategory',
                            select: 'name createdAt',
                        }
                ],

                sort: [
                    [{ blogComments: -1,  blogLikes: -1,  blogviews: -1, }]
                ],

                }
                
             );


        const populars = await BlogModel.paginate({},
            {
                page: populars_page, limit: 5,
                select: "createdAt name blogComments blogLikes description blogImage createdBy blogviews",
                populate: [
                    {
                    path: 'createdBy',
                    model: 'User',
                    select: 'fullname profileImage createdAt',
                    },
                    {
                        path: 'blogCategory',
                        model: 'BlogCategory',
                        select: 'name createdAt',
                    }
            ],
                
                sort: [
                    [{ blogComments: -1,  blogLikes: -1,  blogviews: -1, }]
                ],
            });

        

        // let recent = await BlogModel.aggregate([

        //     { $match: {} },

        //     {
        //         $lookup: {
        //             from: "users",
        //             localField: 'createdBy',
        //             foreignField: '_id',
        //             as: 'author',
        //         }
        //     },

        //     {$unwind: "$author" },

        //     {
        //         $lookup: {
        //             from: "blogcategories",
        //             localField: 'blogCategory',
        //             foreignField: '_id',
        //             as: 'blogCategory',
        //         }
        //     },

        //     {$unwind: "$blogCategory" },

        //     {
        //         $lookup: {
        //             from: "blogcomments",
        //             localField: 'blogComments',
        //             foreignField: '_id',
        //             as: 'blogComments',
        //         }
        //     },

        //     { $unwind: "$blogComments" },


        //     {
        //         $lookup: {
        //             from: "users",
        //             localField: 'blogComments.commentedBy',
        //             foreignField: '_id',
        //             as: 'commentBy',
        //         }
        //     },

        //     {$unwind: "$commentBy" },

        //     {
        //         $group: {
        //             _id: "$_id",
        //             name: { $first: "$name" },

        //             authorId: { $first: "$author._id" },
        //             authorName: { $first: "$author.fullname" },
        //             profileImage: { $first: "$author.profileImage" },


        //             blogImage: { $first: "$blogImage" },
                  
        //             blogviews: { $first: { $size: "$blogviews" } },
        //             blogLikes: { $first: { $size: "$blogLikes" } },


        //             description: { $first: "$description" },
        //             category: { $first: "$blogCategory.name" },
        //             slug: { $first: "$blogCategory.slug" },

        //             comments:{
        //                 $push: {
        //                 comment: "$blogComments.comment",
        //                 commentedBy: "$commentBy",
        //                 createdDate: "$blogComments.createdDate",
        //                 blogId: "$blogComments.blogId",
        //             }  },

        //         }
        //     },

        //     {
        //         $project: {
        //             id: "$_id",
        //             _id: 0,
        //             name:1,

        //             authorId:1,
        //             authorName:1,
        //             profileImage:1,

        //             blogLikes:1,
        //             blogviews: 1,
        //             description:1,
        //             category:1,
        //             blogImage:1, 
        //             createdBy:1,
        //             createdAt:1,

        //             //     "comments": {
        //             //     "$map": {
        //             //         "input": "$comments",
        //             //         "as": "comment",
        //             //         "in": {
        //             //             "id": "$$comment.commentedBy._id",
        //             //             "commentedBy": "$$comment.commentedBy.fullname",
        //             //             "profileImage": "$$comment.commentedBy.profileImage",
        //             //             "comment": "$$comment.comment",
        //             //             "blogId": "$$comment.blogId",
        //             //         }
        //             //     }
        //             // }
                    
        //         }
        //     },

        //     { $sort: { createdAt: -1 } }


        //     ]);
                                    

        // let popular = await BlogModel.aggregate([

        //     { $match: {} },

        //     {
        //         $lookup: {
        //             from: "users",
        //             localField: 'createdBy',
        //             foreignField: '_id',
        //             as: 'author',
        //         }
        //     },

        //     {$unwind: "$author" },

        //     {
        //         $lookup: {
        //             from: "blogcategories",
        //             localField: 'blogCategory',
        //             foreignField: '_id',
        //             as: 'blogCategory',
        //         }
        //     },

        //     {$unwind: "$blogCategory" },

        //     {
        //         $lookup: {
        //             from: "blogcomments",
        //             localField: 'blogComments',
        //             foreignField: '_id',
        //             as: 'blogComments',
        //         }
        //     },

        //     { $unwind: "$blogComments" },


        //     {
        //         $lookup: {
        //             from: "users",
        //             localField: 'blogComments.commentedBy',
        //             foreignField: '_id',
        //             as: 'commentBy',
        //         }
        //     },

        //     {$unwind: "$commentBy" },

        //     {
        //         $group: {
        //             _id: "$_id",
        //             // category: { $first: "$blogCategory" },
        //             name: { $first: "$name" },

        //             authorId: { $first: "$author._id" },
        //             authorName: { $first: "$author.fullname" },
        //             profileImage: { $first: "$author.profileImage" },

        //             // author: {
        //             //     id: { $first: "$author._id" },
        //             //     fullname: { $first: "$author.fullname" },
        //             //     profileImage: { $first: "$author.profileImage" },
        //             // } ,
        //             blogImage: { $first: "$blogImage" },
        //             // blogLikes: { $first: "$blogLikes" },
        //             blogviews: { $first: { $size: "$blogviews" } },
        //             blogLikes: { $first: { $size: "$blogLikes" } },


        //             description: { $first: "$description" },
        //             category: { $first: "$blogCategory.name" },
        //             slug: { $first: "$blogCategory.slug" },

        //             comments:{
        //                 $push: {
        //                 comment: "$blogComments.comment",
        //                 commentedBy: "$commentBy",
        //                 createdDate: "$blogComments.createdDate",
        //                 blogId: "$blogComments.blogId",
        //             }  },

        //         }
        //     },

        //     {
        //         $project: {
        //             id: "$_id",
        //             _id: 0,
        //             authorId:1,
        //             authorName:1,
        //             profileImage:1,


        //             createdAt:1,
        //             name:1,
        //             blogLikes:1,
        //             description:1,
        //             category:1,
        //             blogImage:1, 
        //             createdBy:1,
        //             blogviews: 1,
        //             author: 1,

        //             sort : { '$add' : [ '$blogviews', '$blogLikes' ] },



        //                 "comments": {
        //                 "$map": {
        //                     "input": "$comments",
        //                     "as": "comment",
        //                     "in": {
        //                         "id": "$$comment.commentedBy._id",
        //                         "commentedBy": "$$comment.commentedBy.fullname",
        //                         "profileImage": "$$comment.commentedBy.profileImage",
        //                         "comment": "$$comment.comment",
        //                         "blogId": "$$comment.blogId",
        //                     }
        //                 }
        //             }
                    
        //         }
        //     },

        //     { $sort: { sort: -1 } }


        //     ]);
                                    

       const newBlog =  await BlogModel.find({}).where('blogviews').size(1);

        // const popularBlog  = await BlogModel.aggregate([
        //     {$project: { count: { $cond: { if: { $isArray: "$blogviews" }, then: { $size: "$blogviews" }, else: "$$REMOVE"} }, 
        //     title: 1, image: 1,description: 1 }},
        //     // { $limit: 1 }
        // ]);

        //SHOW POPULAR BLOG POST IF VIEWS IS GREATER THAN 20

        // const popularBlog = await BlogModel.find(
        //     { $expr: { $gt: [{ $size: { $ifNull: ["$blogviews", []] } }, 20] },  },
        // ).populate('blogCategory');


        return res.status(200).send({categories, hot: hotm.docs[0], recent: recents, popular: populars });
        // return res.status(200).send({ categories:categories,  recent, popular  });

    } catch (error) {
        console.log(error)
        return res.status(500).send({ message: error.message })
    }
}


exports.createNewBlog = async (req, res, next) => {
    //POST REQUEST
    //http://localhost:2000/api/blog/create
    /**
     * {
        "name": "Blog Title With Blog Category And User",
        "short_description": "Blog short Description",
        "description": "Blog short Description",
        "blogCategory":"6286b37ac420a04878903e9a",
        "created_by": "628695d03cf50a6e1a34e27b"
        }
     */
    // NOTE::::: REMEMBER TO VALIDATE YOUR REQUEST INPUT(S) BEFORE SAVING TO DB
    const blogCreatedBy = req?.user?.id;
    const { name } = req.body;

    try {

        let findBlogExist = await BlogModel.findOne({ name });
     
        if(findBlogExist) {
            return res.status(401).send({ status: "failed", message: `Blog name ${name} already exists` });
        }

        // if(!req.files?.authorImages) {
        //     return res.status(400).send({ status: "failed", message: `Please provide author image(s)` });
        // }

        if(!req?.files?.blogImages) {
            return res.status(400).send({ status: "failed", message: `Please provide blog image(s)` });
        }

        // //Upload Image to cloudinary

        const blogImageresponse = await cloudinary.uploader.upload(req?.files?.blogImages[0].path);

        if(!blogImageresponse) {
            //Reject if unable to upload image
            return res.status(404).send({ status: "failed", message: "Unable to upload image please try again"});
        }

        // //Upload Image to cloudinary

        let authorImageUrl;
        let authorImagePublicId;

        if(req?.files?.authorImages) {

            const authorImageresponse = await cloudinary.uploader.upload(req?.files?.authorImages[0].path);
    
            if(!authorImageresponse) {
                //Reject if unable to upload image
                return res.status(404).send({ status: "failed", message: "Unable to upload image please try again"});
            }

            authorImageUrl = blogImageresponse?.public_id;
            authorImagePublicId = authorImageresponse?.secure_url;

        }

        let blogData = {
            ...req.body,
            createdBy:blogCreatedBy,
            blogImages: [{   public_id: blogImageresponse?.public_id, image_url: blogImageresponse?.secure_url, }],
            authorImages: [{  public_id: authorImagePublicId || null, image_url: authorImageUrl || null, }]
        }

        let createNewBlog = new BlogModel(blogData);
        let savedNewBlog = await createNewBlog.save();
        if(!savedNewBlog) {
            return res.status(401).send({ status: "failed", message: "Unable to create new blog"});
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

        return res.status(200).send({ status: "success", message: "Blog Created Successfully", blogs });
    } catch (error) {
        // console.log(error)
        return res.status(500).send({ status: "failed", message: 'Server error encountered while creating blog' })
    }
}


exports.FetchBlogs = async (req, res, next) => {
    //GET REQUEST
    // NOTE::::: REMEMBER TO VALIDATE YOUR REQUEST INPUT(S) BEFORE SAVING TO DB
    // http://localhost:2000/api/blog/lists?category=one
    // http://localhost:2000/api/blog/lists?pages=1&perPage=2
    // http://localhost:2000/api/blog/lists?sortBy=title&sortOrder=asc
    // http://localhost:2000/api/blog/lists

    const userId = req?.user?.id;
    let { blogId } = req?.params;
    let { category_page = 1, hot_page = 1, recent_page = 1, populars_page = 1 } = req.query;
    // http://localhost:2000/api/blog/lists?category_page=1&recent_page=1&populars_page=1
 
    //Hot
    //Recent
    //popular


    category_page = Number(category_page);
    hot_page = Number(hot_page);
    recent_page = Number(recent_page);
    populars_page = Number(populars_page);


    try {

        const categories = await BlogCategoryModel.paginate({}, { page: category_page, limit: 5,  select: "-createdAt -updatedAt -__v"})
    
        const hotm = await BlogModel.paginate({}, 
            {
                page: 1, limit: 1,

                select: "createdAt name blogLikes blogComments description blogImage  blogviews",
                populate: [
                    {
                    path: 'createdBy',
                    model: 'User',
                    select: 'id fullname profileImage createdAt',
                    },
                    {
                        path: 'blogCategory',
                        model: 'BlogCategory',
                        select: 'name createdAt',
                    }
            ],
                sort: { createdAt: -1 },
            }
            );
    
        const recents = await BlogModel.paginate({},
                {
                    page: recent_page, limit: 5,
                    select: "createdAt name blogLikes blogComments  description blogImage createdBy blogviews",
                    populate: [
                        {
                        path: 'createdBy',
                        model: 'User',
                        select: 'fullname profileImage createdAt',
                        },
                        {
                            path: 'blogCategory',
                            model: 'BlogCategory',
                            select: 'name createdAt',
                        }
                ],
                    sort: { createdAt: -1 },
                }
             );


        const populars = await BlogModel.paginate({},
            {
                page: populars_page, limit: 5,
                select: "createdAt name blogLikes blogComments description blogImage createdBy blogviews",
                populate: [
                    {
                    path: 'createdBy',
                    model: 'User',
                    select: 'fullname profileImage createdAt',
                    },
                    {
                        path: 'blogCategory',
                        model: 'BlogCategory',
                        select: 'name createdAt',
                    }
            ],
                sort: { createdAt: -1 },
            });


            return res.status(200).send({categories, hot: hotm.docs[0], recent: recents, popular: populars });
    } catch (error) {
        console.log(error)
        return res.status(500).send({ message: error.message })
    }
}


exports.FetchBlogById = async (req, res, next) => {
    //GET REQUEST
    // http://localhost:2000/api/blog/blogId/show
    // http://localhost:2000/api/blog/6286a710380730138c08e194/show

    // NOTE::::: REMEMBER TO VALIDATE YOUR REQUEST INPUT(S) BEFORE SAVING TO DB
    try {
        let { blogId } = req.params;

        let currentUser = req.user.id;

        let { comments = 1 } = req.query;

        comments = Number(comments);


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

        let blogPosts = await BlogModel.findById(blogId)
                                    .select('createdAt name blogLikes blogviews blogComments description blogImage createdBy')
                                    .populate('createdBy', 'fullname createdAt profileImage')
                                    .populate({
                                        path: 'blogCategory',
                                        model: 'BlogCategory',
                                        select: 'name createdAt',
                                    });
            

        let blogComments = await BlogCommentModel.paginate({ blogId: blogId }, {
                                    page: comments, 
                                    limit: 5, 
                                    populate: {
                                        path: 'commentedBy',
                                        model: 'User',
                                        select: 'fullname profileImage id createdAt',
                                    },
                                    select: "comment blogId blogLikes createdAt id",
                                    sort: { createdAt: -1 },
        });

                                    
        // let blog_ids = blogPosts.map((item) => item.id);

        // let blog_comments = await BlogComment.find({ blogId: blogId })
        // .select('comment blogId blogLikes createdAt id')
        // .populate({
        //     path: 'commentedBy',
        //     model: 'User',
        //     select: 'fullname profileImage createdAt',
        //     // populate: {
        //     //     path: 'profileId',
        //     //     model: 'Profile',
        //     //     select: 'id userId profileImage'
        //     // }
        // });

        const populars = await BlogModel.find()
        .select('createdAt name blogLikes description blogComments blogImage createdBy blogviews')
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
            path: 'blogCategory',
            model: 'BlogCategory',
            select: 'name createdAt',
        })
        .sort({ createdAt: -1  })

        const singleBlog = { blog: blogPosts, blogComments, popular: populars, }
        // const singleBlog = { blog: blogPosts, blog_comments, popular: populars, blogComments}


        let blogPost = await BlogModel.aggregate([

            { $match: { $expr: { _id: mongoose.Types.ObjectId(blogId) } } },

            {
                $lookup: {
                    from: "users",
                    localField: 'createdBy',
                    foreignField: '_id',
                    as: 'author',
                }
            },

            {$unwind: "$author" },
            

            {
                $lookup: {
                    from: "blogcategories",
                    localField: 'blogCategory',
                    foreignField: '_id',
                    as: 'blogCategory',
                }
            },

            {$unwind: "$blogCategory" },

            {
                $lookup: {
                    from: "blogcomments",
                    localField: 'blogComments',
                    foreignField: '_id',
                    as: 'blogComments',
                }
            },

            { $unwind: "$blogComments" },

            {
                $lookup: {
                    from: "users",
                    localField: 'blogComments.commentedBy',
                    foreignField: '_id',
                    as: 'commentBy',
                }
            },

            {$unwind: "$commentBy" },

            {
                $group: {
                    _id: "$_id",
                    name: { $first: "$name" },

                    authorId: { $first: "$author._id" },
                    authorName: { $first: "$author.fullname" },
                    profileImage: { $first: "$author.profileImage" },


                    blogImage: { $first: "$blogImage" },
                    description: { $first: "$description" },
                    category: { $first: "$blogCategory.name" },
                    slug: { $first: "$blogCategory.slug" },

                    comments:{
                        $push: {
                        comment: "$blogComments.comment",
                        commentedBy: "$commentBy",
                        createdDate: "$blogComments.createdDate",
                        blogId: "$blogComments.blogId",
                    }  },

                }
            },
                // {$unwind: "$comments.comment" },
            {
                $project: {
                    id: "$_id",
                    _id: 0,
                    name: 1,

                    authorId:1,
                    authorName:1,
                    profileImage:1,

                    description: 1,
                    blogImage:1,
                    category:1,
                    slug:1,
                    createdAt:1,

                    "comments": {
                        "$map": {
                            "input": "$comments",
                            "as": "comment",
                            "in": {
                                "id": "$$comment.commentedBy._id",
                                "commentedBy": "$$comment.commentedBy.fullname",
                                "profileImage": "$$comment.commentedBy.profileImage",
                                "comment": "$$comment.comment",
                                "blogId": "$$comment.blogId",
                            }
                        }
                    }
                }
            },

            ]);


        let popular = await BlogModel.aggregate([

            { $match: {} },

            {
                $lookup: {
                    from: "users",
                    localField: 'createdBy',
                    foreignField: '_id',
                    as: 'author',
                }
            },

            {$unwind: "$author" },

            {
                $lookup: {
                    from: "blogcategories",
                    localField: 'blogCategory',
                    foreignField: '_id',
                    as: 'blogCategory',
                }
            },

            {$unwind: "$blogCategory" },

            {
                $lookup: {
                    from: "blogcomments",
                    localField: 'blogComments',
                    foreignField: '_id',
                    as: 'blogComments',
                }
            },

            { $unwind: "$blogComments" },


            {
                $lookup: {
                    from: "users",
                    localField: 'blogComments.commentedBy',
                    foreignField: '_id',
                    as: 'commentBy',
                }
            },

            {$unwind: "$commentBy" },

            {
                $group: {
                    _id: "$_id",
                    // category: { $first: "$blogCategory" },
                    name: { $first: "$name" },

                    authorId: { $first: "$author._id" },
                    authorName: { $first: "$author.fullname" },
                    profileImage: { $first: "$author.profileImage" },

                    // author: {
                    //     id: { $first: "$author._id" },
                    //     fullname: { $first: "$author.fullname" },
                    //     profileImage: { $first: "$author.profileImage" },
                    // } ,
                    blogImage: { $first: "$blogImage" },
                    // blogLikes: { $first: "$blogLikes" },
                    blogviews: { $first: { $size: "$blogviews" } },
                    blogLikes: { $first: { $size: "$blogLikes" } },


                    description: { $first: "$description" },
                    category: { $first: "$blogCategory.name" },
                    slug: { $first: "$blogCategory.slug" },

                    comments:{
                        $push: {
                        comment: "$blogComments.comment",
                        commentedBy: "$commentBy",
                        createdDate: "$blogComments.createdDate",
                        blogId: "$blogComments.blogId",
                    }  },

                }
            },

            {
                $project: {
                    id: "$_id",
                    _id: 0,
                    authorId:1,
                    authorName:1,
                    profileImage:1,


                    createdAt:1,
                    name:1,
                    blogLikes:1,
                    description:1,
                    category:1,
                    blogImage:1, 
                    createdBy:1,
                    blogviews: 1,
                    author: 1,

                    sort : { '$add' : [ '$blogviews', '$blogLikes' ] },



                        "comments": {
                        "$map": {
                            "input": "$comments",
                            "as": "comment",
                            "in": {
                                "id": "$$comment.commentedBy._id",
                                "commentedBy": "$$comment.commentedBy.fullname",
                                "profileImage": "$$comment.commentedBy.profileImage",
                                "comment": "$$comment.comment",
                                "blogId": "$$comment.blogId",
                            }
                        }
                    }
                    
                }
            },

            { $sort: { sort: -1 } }


            ]);
        

        // return res.status(200).send({blogPost, popular});
        return res.status(200).send(singleBlog);
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
            updateData['blogImage'] = uploaderResponse.secure_url;

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
    const currentUser =  mongoose.Types.ObjectId(req.user.id);
    const { blogId } = req.params;
   
    try {

        let commentData = { comment, commentedBy:currentUser, blogId };

        let user = await UserModel.findOne({ _id: req.user.id});

        const newComment = new BlogCommentModel(commentData);
 
        const savedBlogComment = await newComment.save();
        
        let updateBlog = await BlogModel.findByIdAndUpdate(blogId,
            { $push: 
                { blogComments: savedBlogComment._id }  
            }, { new: true } );

        const commented_data = {
            comment: savedBlogComment.comment,
            createdAt: savedBlogComment.createdAt,
            blogId: savedBlogComment.blogId,
            id: savedBlogComment.id,
            blogImage: updateBlog.blogImage,
            
        }

        const commentedBy = {
                fullname: user.fullname,
                createdAt: user.createdAt,
                profileImage: user.profileImage,
                id: user.id
        }

        const sendResult = { ...commented_data, commentedBy }

        return res.status(200).send({ blog_comment: sendResult });

        } catch (error) {
            return res.status(500).send({ error: error.message });
        }
}


exports.deleteBlogComment = (req, res) => {

    // let { commentId } = req.body;
  
    let currentUser = req.user;
    const { blogId } = req.params;
    let { commentId } = req.body;
    

    try {
 
            BlogModel.findByIdAndUpdate(blogId, 
                { $pull: 
                    { comments: { _id: {$eq: mongoose.Types.ObjectId(commentId)} 
                } 
            } }, 
            {new: true})
            .populate("comments.commentedBy", "fullname")
            .populate("createdBy", "fullname")

            .exec((err, result) =>{
            if(err) {
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
            message = "You cannot like/unlike you own post";
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
        
        return res.status(200).send({ message })
    } catch (error) {
        return res.status(200).send({ error: error.message })
    }
}
