const mongoose = require('mongoose');
const BookModel = require('./../../models/bookLibraryModel/BookModel');
const BookCategoryModel = require('./../../models/bookLibraryModel/BookCategoryModel');
const UserModel = require('./../../models/UserModel');
const TrendingBookModel = require('./../../models/bookLibraryModel/TrendingBookModel');
const { cloudinary } = require('./../../helpers/cloudinary');

exports.createNewBook = async (req, res, next) => {
    //NOTE: REMEMBER TO VALIDATE USER INPUTS 
    const currentUser = req.user.id;
    const bookCategoryId = req.body.bookCategoryId;

    /**
     * {
            title: "Book title one",
            author: "Book author",
            price: 2000,
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

         await createNewBook.save();

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
        
        return res.status(200).send("Books created successfully");

    } catch (error) {
        console.log(error)
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

        let query = [
            {
                $lookup: { from: 'bookcategories', localField: 'bookCategoryId', foreignField: '_id', as: "book_category" }
            },
            {  $unwind: '$book_category' },
         
            {
                $project: {
                        "book_category":1,
                        "_id": 1,
                        "title": 1,
                        "imagePath": 1,
                        "author": 1,
                        "price": 1,
                        "ratings": 1,
                        "store": 1,
                        "bookCategoryId": 1,
                }
            },
            {
                $group: {_id: "$book_category", category: { $mergeObjects: "$book_category" } }
            }

        ];
       

        let total= await BookModel.countDocuments(query);
		let page = (req.query.page) ? parseInt(req.query.page) : 1;
		let perPage = (req.query.perPage) ? parseInt(req.query.perPage) : 10;
		let skip = (page-1)*perPage;

        query.push({ $skip:skip });
		query.push({ $limit:perPage });

        query.push({ $sort: {createdAt:-1} });

        const books = await BookModel.aggregate(query);

        let paginationData = { totalRecords:total, currentPage:page, perPage:perPage, totalPages:Math.ceil(total/perPage) }

        return res.status(200).send({ books, paginationData});

    } catch (error) {
        console.log(error)
        return res.status(500).send({ message: error.message });
    }
}

exports.fetchBookById = async (req, res, next) => {
    //NOTE: REMEMBER TO VALIDATE USER INPUTS 
    try {
        const bookId = req.params.bookId;

        if(!mongoose.Types.ObjectId.isValid(bookId)) {
            return res.status(401).send({ error: "Invalid book"})
        }
        const findBookExist = await BookModel.findById(bookId)
        .populate("bookCategoryId", "_id title")
        .select("_id title bookImage author price ratings store bookCategoryId");

        if(!findBookExist) {
            return res.status(404).send({ error: "Book not found"})
        }
        
        return res.status(200).send(findBookExist);

    } catch (error) {
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

