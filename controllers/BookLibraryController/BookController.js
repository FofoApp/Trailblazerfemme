const mongoose = require('mongoose');
const BookModel = require('./../../models/bookLibraryModel/BookModel');
const BookCategoryModel = require('./../../models/bookLibraryModel/BookCategoryModel');
const UserModel = require('./../../models/UserModel');
const BookReview  = require('../../models/bookLibraryModel/BookReviewModel');
const TrendingBookModel = require('./../../models/bookLibraryModel/TrendingBookModel');
const { cloudinary } = require('./../../helpers/cloudinary');



exports.testBooks = async (req, res, next) => {

    const userId = req.user.id;

    try {
        //Book Categories
        const bookCategories = await BookCategoryModel.find({}, 'title books')
        .populate({ path: 'books',  select: 'title author price store bookImage', });
        if(!bookCategories) return res.status(404).send({error: 'Book Categories not found'});

        //Continue Reading
        
        //'books', 'title author price store bookImage'
        const userWithBook = await UserModel.findById(userId)
        .populate({ path: 'books',  select: 'title author price store bookImage',})
        .populate({ path: 'booksRead',  select: 'title author price store bookImage',})
        .populate({ path: 'library',  select: 'title author price store bookImage',})
        .populate({ path: 'recentlySearchedBook',  select: 'title author price store bookImage',})
        
        if(!userWithBook) {
            return res.status(404).send({ error: 'Books not found'});
        }

        return res.status(200).send({ bookCategories, userWithBook, });
    } catch (error) {
        return res.status(500).send({error:error.message})
    }
}

exports.createNewBook = async (req, res, next) => {
    //NOTE: REMEMBER TO VALIDATE USER INPUTS 
    const currentUser = req.user.id;
    const bookCategoryId = req.body.bookCategoryId;

    /**
     * {
            title: "Book title one",
            author: "Book author",
            price: 2000,
            bookLink: "",
            ratings: 4,
            bookImage: "image",
            bookCategoryId: "",
     * }
     */

    try {

        if(!mongoose.Types.ObjectId.isValid(bookCategoryId)) {
            return res.status(401).send({ error: "Invalid book category"})
        }

        const findBookExist = await BookModel.findOne({ title: req.body.title });
       

        if(findBookExist) {
            return res.status(402).send({ message: "Book already exist" });
        }
        
        
        // //Upload Image to cloudinary
        const uploaderResponse = await cloudinary.uploader.upload(req.file.path);

        if(!uploaderResponse) {
            //Reject if unable to upload image
            return res.status(404).send({ message: "Unable to upload image please try again"});
        }
        
        const createNewBook = new BookModel({
            ...req.body,
             cloudinaryPublicId: uploaderResponse.public_id,
            bookImage: uploaderResponse.secure_url,
            createdBy: currentUser
        });

         const createdBook = await createNewBook.save();

        // let query = [
        //     {
        //         $lookup: { from: 'bookcategories', localField: 'bookCategoryId', foreignField: '_id', as: "book_category" }
        //     },
        //     {  $unwind: '$book_category' },

        // ];
       

        // if(req.query.keyword && req.query.keyword !=''){ 
		// 	query.push({
		// 	  $match: { 
		// 	    $or :[
		// 	      { title : { $regex: '.*' + req.query.keyword + '.*',  $options: 'i' }  },
		// 	      { author : {$regex: '.*' + req.query.keyword + '.*',  $options: 'i' }  },
		// 	      { topic : {$regex: '.*' + req.query.keyword + '.*',  $options: 'i' }  },
		// 	    ]
		// 	  }
		// 	});
		// }

        // if(req.body.keyword && req.body.keyword !=''){ 
		// 	query.push({
		// 	  $match: { 
		// 	    $or :[
		// 	      { title : { $regex: '.*' + req.body.keyword + '.*',  $options: 'i' }  },
		// 	      { author : {$regex: '.*' + req.body.keyword + '.*',  $options: 'i' }  },
		// 	      { topic : {$regex: '.*' + req.body.keyword + '.*',  $options: 'i' }  },
		// 	    ]
		// 	  }
		// 	});
		// }

        // let total= await BookModel.countDocuments(query);
		// let page= (req.query.page) ? parseInt(req.query.page) : 1;
		// let perPage = (req.query.perPage) ? parseInt(req.query.perPage) : 10;
		// let skip = (page-1)*perPage;

        // query.push({ $skip:skip, });
		// query.push({ $limit:perPage, });

        // query.push({ $sort: {createdAt:-1} });

        // const books = await BookModel.aggregate(query);

        // let paginationData = { totalRecords:total, currentPage:page, perPage:perPage, totalPages:Math.ceil(total/perPage) }

        // return res.status(200).send({ message: "Book created successfully", books, paginationData});
       
        // const joblink = `${req.protocol}://${req.get('host')}/api/jobs/create`;

        return res.status(200).send({ book: createdBook });

    } catch (error) {
        // console.log(error)
        return res.status(500).send({ message: error.message });
    }
}

exports.searchAllBooks = async (req, res, next) => {
    
    try {

        const { searchKeyword } = req.body;

        if(!searchKeyword || searchKeyword === "") {
            return res.status(400).send({ error: "Please provide a search keyword" });
        }

        const searched = await BookModel.find({
            $or: [
                { title : { $regex: '.*' + searchKeyword + '.*',  $options: 'i' }  },
                { author : { $regex: '.*' + searchKeyword + '.*',  $options: 'i' }  },
            ]
        }).select( "_id title imagePath author price ratings store");

         if(searched.length === 0) return res.status(400).send({ error: "No match found" });

         return res.status(200).send(searched);

    } catch (error) {
        return res.status(500).send({ error: error.message });
    }
}

exports.searchBook = async (req, res, next) => {
    //NOTE: REMEMBER TO VALIDATE USER INPUTS
  
    try {
        const { searchKeyword } = req.body;

        if(!searchKeyword || searchKeyword === "") {
            return res.status(400).send({ error: "Please provide a search keyword" });
        }

        const searched = await BookModel.find({
            $or: [
                { title : { $regex: '.*' + searchKeyword + '.*',  $options: 'i' }  },
                { author : { $regex: '.*' + searchKeyword + '.*',  $options: 'i' }  },
            ]
        }).select( "_id title imagePath author price ratings store").limit(20)

       
         if(searched.length === 0) {
            return res.status(400).send({ error: "No match found" });
         }

         return res.status(200).send(searched);

         

        // let query=[
			// {
			// 	$lookup: { from: "users", localField: "userId", foreignField: "_id", as: "creator" },
                
			// },
            // {$unwind: '$creator'},

            // { $lookup: { from: "bookcategories", localField: "bookCategoryId", foreignField: "_id", as: "book_category_details" },
			// },
            // {
            //     $group: { _id: "$book_category"}
            // },

			// {$unwind: '$book_category_details'},
            // { 
            //     $project : {
            //     "_id":1,
            //     "createdAt":1,
            //     "title": 1,
            //     "imagePath":1,
            //     "author":1,
            //     "price":1,
            //     "ratings":1,
            //     "store":1,
            //     "userId":1,
            //     "book_category_details":1,
            //     "cloudinaryPublicId": 0,
            //     "bookCategoryId": 0,
            //     "createdAt": 0,
            //     "comments_count":{$size:{"$ifNull":["$blog_comments", []]}},
            //     "likes_count":{$size:{"$ifNull":["$blog_likes", []]}}
            //     } 
            // }
        // ];

        // if(searchKeyword && searchKeyword !=''){ 
		// 	query.push({
		// 	  $match: { 
		// 	    $or :[
		// 	      { title : { $regex: '.*' + searchKeyword + '.*',  $options: 'i' }  },
		// 	      { author : { $regex: '.*' + searchKeyword + '.*',  $options: 'i' }  },
		// 	      { 'book_category_details.title' : {$regex: '.*' + searchKeyword + '.*',  $options: 'i' }  }
		// 	    ]
		// 	  }
		// 	});
		// }

        // const findBookExist = await BookModel.aggregate(query);

        // if(!findBookExist) {
        //     return res.status(401).send({ error: "Books not found" });
        // }
        // return  res.status(404).send(findBookExist[0]);

        // const updateRecentBookSearch = await BookModel.updateOne({_id: findBookExist[0]._id }, 
        //     { $addToSet : { recentSearch: findBookExist[0]._id } });

        // return res.status(200).send(updateRecentBookSearch);
    } catch (error) {
 
        return res.status(500).send({ error: error.message });
    }
}


exports.fetchBooks = async (req, res, next) => {
    //NOTE: REMEMBER TO VALIDATE USER INPUTS 
    try {

        const findBookExist = await BookModel.find({});

        if(!findBookExist) {
            return res.status(401).send({ error: "Books not found" });
        }

        let categories = await BookCategoryModel.find({}).select('_id title');

        if(!categories) {
            return res.status(404).send("No categories found")
        }

        // let query = [
        //     {
        //         $lookup: { from: 'bookcategories', localField: 'bookCategoryId', foreignField: '_id', as: "book_category" }
        //     },
        //     {  $unwind: '$book_category' },
         
        //     {
        //         $project: {
        //                 "book_category":1,
        //                 "_id": 1,
        //                 "title": 1,
        //                 "bookImage": 1,
        //                 "author": 1,
        //                 "bookLink": 1,
        //                 "price": 1,
        //                 "ratings": 1,
        //                 "store": 1,
        //                 "bookCategoryId": 1,
        //         }
        //     },
        //     {
        //         $group: {_id: "$book_category", category: { $mergeObjects: "$book_category" } }
        //     }

        // ];

       // let total= await BookModel.countDocuments(query);

        let total= await BookModel.countDocuments();
		let page = (req.query.page) ? parseInt(req.query.page) : 1;
		let perPage = (req.query.perPage) ? parseInt(req.query.perPage) : 10;
		let skip = (page-1) * perPage;

        // query.push({ $skip:skip });
		// query.push({ $limit:perPage });

        // query.push({ $sort: {createdAt:-1} });

        // const books = await BookModel.aggregate(query);

        const books = await BookModel.find({})
                                     .select('_id title author bookImage bookLink price ratings store bookCategoryId')
                                    .populate('bookCategoryId', 'title')
                                    .populate('createdBy', "id fullname email profileImagePath")
                                    .skip(skip)
                                    .limit(perPage)

        let paginationData = { totalRecords:total, currentPage:page, perPage:perPage, totalPages:Math.ceil(total/perPage) }

        return res.status(200).send({ books, paginationData});

    } catch (error) {
        // console.log(error)
        return res.status(500).send({ message: error.message });
    }
}

exports.fetchBookById = async (req, res, next) => {
    // let sess = await mongoose.startSession();
    //NOTE: REMEMBER TO VALIDATE USER INPUTS 
    try {
        const { bookId } = req.params;

        if(!mongoose.Types.ObjectId.isValid(bookId)) {
            return res.status(401).send({ error: "Invalid book"})
        }
        // sess.startTransaction();

        let findBookExist = await BookModel.findById(bookId, 
                            // {$addToSet: { 'readers': req.user.id } },
                            // { session: sess  }
                            )
                            .select("_id title bookImage author price ratings store")
                            .populate({           
                                path: 'readers',
                                select: 'fullname profileImage createdAt',
                                model: 'User',
                                populate: {
                                    path: 'profileId',
                                    model: 'Profile',
                                    select: 'profileImage',
                                },
                                
                            })
                            .populate({
                                path: 'bookCategoryId',
                                model: 'BookCategory',
                                select: 'title',
                                populate: {
                                    path: 'books',
                                    model: 'Book',
                                    select: "title bookImage author store"
                                }

                            })

        let reviews = await BookReview.find({ bookId })
        .populate({
            path: "reviewdBy",
            model: "User",
            select: "id fullname profileImage createdAt"
        })
        // .limit()
        // .skip()

        const similar_books = await BookModel.aggregate(
            [
                { $sample: { size: 40 } },
                {
                    $project: {
                        id: "$_id",
                        title: "$title", 
                        description: "$description",  
                        ratings: "$ratings",  
                        bookImage: "$bookImage",   
                        price: "$price",  
                        store: "$store",  
                        _id: 0,

                    }
                }
            ])

    if(!reviews) return res.status(404).send({error: "No review found"});
    let numberOfReviews = await BookReview.countDocuments();
    reviews.map((review) => {
        return review.ratings = review.rating / numberOfReviews
        // return review.reduce((acc, item) => item.ratings + acc, 0) / numberOfReviews
    })
        // await sess.commitTransaction();

        if(!findBookExist) {
            return res.status(404).send({ error: "Book not found"})
        }
        
        return res.status(200).send({findBookExist, reviews, similar_books});

    } catch (error) {
        // await sess.abortTransaction();
        // await sess.endSession();
        console.log(error)
        return res.status(500).send({ error: error.message });
    }
}


exports.updateBookById = async (req, res, next) => {
    //NOTE: REMEMBER TO VALIDATE USER INPUTS 

    try {
        const bookId = req.params.bookId;
        if(!mongoose.Types.ObjectId.isValid(bookId)) {
            return res.status(401).send({ error: "Invalid book"})
        }
        if(req.body.bookCategoryId && !mongoose.Types.ObjectId.isValid(req.body.bookCategoryId)) {
            return res.status(401).send({ error: "Invalid bookCategoryId"});
        }
        const findBookExist = await BookModel.findById(bookId);
        if(!findBookExist) {
            return res.status(404).send({ error: "Book not found"})
        }

         await BookModel.updateOne({_id: bookId}, { $set: { ...req.body }});
        
        return res.status(200).send("Book updated successfully");
    } catch (error) {
        return res.status(500).send({ error: error.message });
    }
}

exports.deleteBookById = async (req, res, next) => {
    //NOTE: REMEMBER TO VALIDATE USER INPUTS 
    try {
        const bookId = req.params.bookId;
        if(!mongoose.Types.ObjectId.isValid(bookId)) {
            return res.status(401).send({ error: "Invalid book"})
        }
        const findBookExist = await BookModel.findById(bookId);
        
        if(!findBookExist) {
            return res.status(404).send({ error: "Book not found"})
        }
        await BookModel.deleteOne({_id: bookId });

        return res.status(200).send({ message: "Book deleted successfully" });
    } catch (error) {
        return res.status(500).send({ message: error.message });
    }
}

exports.trendingBooks = async (req, res, next) => {
    //NOTE: REMEMBER TO VALIDATE USER INPUTS 
    try {
      
        const userId = req.user.userId;
        const bookId = req.params.bookId;

        
        let query = [
			{
				$lookup:
				{
				 from: "users",
				 localField: userId,
				 foreignField: "_id",
				 as: "user"
				}
			},
            // {$unwind: '$creator'},
			{
				$lookup:
				{
				 from: "trendingbooks",
				 localField: bookId,
				 foreignField: "_id",
				 as: "trending"
				}
			},

        ];
        let post = await BookModel.aggregate(query);
        return res.status(200).send(post)

      
        // const trendBook = await TrendingBookModel.create({
        //     userId: user._id,
        //     bookId: book._id
        // })

        // return res.status(200).send({ message: "Trending",  populatedData});
    } catch (error) {
        console.log(error)
        return res.status(500).send({ message: error.message });
    }
}

