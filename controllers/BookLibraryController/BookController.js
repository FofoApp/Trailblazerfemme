const mongoose = require('mongoose');
const BookModel = require('./../../models/bookLibraryModel/BookModel');
const BookCategoryModel = require('./../../models/bookLibraryModel/BookCategoryModel');
const UserModel = require('./../../models/UserModel');
const TrendingBookModel = require('./../../models/bookLibraryModel/TrendingBookModel');
const { cloudinary } = require('./../../helpers/cloudinary');

const createNewBook = async (req, res, next) => {
    //NOTE: REMEMBER TO VALIDATE USER INPUTS 
    const currentUser = req.user.id;
    try {
  
        const bookCategoryId = req.body.categoryId;
        if(!mongoose.Types.ObjectId.isValid(bookCategoryId)) {
            return res.status(401).send({ message: "Invalid book category"})
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
            ...req.body, bookCategoryId, 
             cloudinaryPublicId: uploaderResponse.public_id,
            imagePath: uploaderResponse.secure_url,
            createdBy: currentUser
        });

        const createdBook = await createNewBook.save();

        let query = [
            {
                $lookup: { from: 'bookcategories', localField: 'bookCategoryId', foreignField: '_id', as: "book_category" }
            },
            {  $unwind: '$book_category' },

        ];
       

        if(req.query.keyword && req.query.keyword !=''){ 
			query.push({
			  $match: { 
			    $or :[
			      { title : { $regex: '.*' + req.query.keyword + '.*',  $options: 'i' }  },
			      { author : {$regex: '.*' + req.query.keyword + '.*',  $options: 'i' }  },
			      { topic : {$regex: '.*' + req.query.keyword + '.*',  $options: 'i' }  },
			    ]
			  }
			});
		}

        if(req.body.keyword && req.body.keyword !=''){ 
			query.push({
			  $match: { 
			    $or :[
			      { title : { $regex: '.*' + req.body.keyword + '.*',  $options: 'i' }  },
			      { author : {$regex: '.*' + req.body.keyword + '.*',  $options: 'i' }  },
			      { topic : {$regex: '.*' + req.body.keyword + '.*',  $options: 'i' }  },
			    ]
			  }
			});
		}

        let total= await BookModel.countDocuments(query);
		let page= (req.query.page) ? parseInt(req.query.page) : 1;
		let perPage = (req.query.perPage) ? parseInt(req.query.perPage) : 10;
		let skip = (page-1)*perPage;

        query.push({ $skip:skip, });
		query.push({ $limit:perPage, });

        query.push({ $sort: {createdAt:-1} });	

        const books = await BookModel.aggregate(query);

        let paginationData = { totalRecords:total, currentPage:page, perPage:perPage, totalPages:Math.ceil(total/perPage) }

        return res.status(200).send({ message: "Book created successfully", books, paginationData});
    } catch (error) {
        return res.status(500).send({ message: error.message });
    }
}

const searchBook = async (req, res, next) => {
    //NOTE: REMEMBER TO VALIDATE USER INPUTS 
  
    try {
        const searchKeyword = req.body.keyword;

        let query=[
			// {
			// 	$lookup: { from: "users", localField: "userId", foreignField: "_id", as: "creator" },
                
			// },
            // {$unwind: '$creator'},

            { $lookup: { from: "bookcategories", localField: "bookCategoryId", foreignField: "_id", as: "book_category_details" },
			},
            {
                $group: { _id: "$book_category"}
            }

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
            //     "comments_count":{$size:{"$ifNull":["$blog_comments",[]]}},
            //     "likes_count":{$size:{"$ifNull":["$blog_likes",[]]}}
            //     } 
            // }
        ];

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

        const findBookExist = await BookModel.aggregate(query);

        if(!findBookExist) {
            return res.status(401).send({ message: "Books not found" });
        }
        // return  res.status(404).send(findBookExist[0]);

        const updateRecentBookSearch = await BookModel.updateOne({_id: findBookExist[0]._id }, 
            { $addToSet : { recentSearch: findBookExist[0]._id } });

        return res.status(200).send({ message: "Book found", updateRecentBookSearch});
    } catch (error) {
        console.log(error)
        return res.status(500).send({ message: error.message });
    }
}


const fetchBooks = async (req, res, next) => {
    //NOTE: REMEMBER TO VALIDATE USER INPUTS 
    try {
        const findBookExist = await BookModel.find({});
        if(!findBookExist) {
            return res.status(401).send({ message: "Books not found" });
        }

        let categories = await BookCategoryModel.find({}).select('_id title iconName');

        if(!categories) {
            return res.status(404).send({ message: "No categories found", categories: [] })
        }
        return res.status(200).send({ message: "No categories found", categories })


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
        //                 "imagePath": 1,
        //                 "author": 1,
        //                 "price": 1,
        //                 "ratings": 1,
        //                 "store": 1,
        //                 "bookCategoryId": 1,
        //         }
        //     },
        //     {
        //         $group: {_id: "$book_category", mergedSales: { $mergeObjects: "$book_category" } }
        //     }

        // ];
       

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

        return res.status(200).send({ message: "Book found", books });
    } catch (error) {
        return res.status(500).send({ message: error.message });
    }
}

const fetchBookById = async (req, res, next) => {
    //NOTE: REMEMBER TO VALIDATE USER INPUTS 
    try {
        const bookId = req.params.bookId;
        if(!mongoose.Types.ObjectId.isValid(bookId)) {
            return res.status(401).send({ message: "Invalid book"})
        }
        const findBookExist = await BookModel.findById(bookId);
        if(!findBookExist) {
            return res.status(404).send({ message: "Book not found"})
        }
        return res.status(200).send({ message: "Book found", book: findBookExist });

    } catch (error) {
        return res.status(500).send({ message: error.message });
    }
}


const updateBookById = async (req, res, next) => {
    //NOTE: REMEMBER TO VALIDATE USER INPUTS 
    try {
        const bookId = req.params.bookId;
        if(!mongoose.Types.ObjectId.isValid(bookId)) {
            return res.status(401).send({ message: "Invalid book"})
        }
        const findBookExist = await BookModel.findById(bookId);
        if(!findBookExist) {
            return res.status(404).send({ message: "Book not found"})
        }
         await BookModel.updateOne({_id: bookId}, { $set: { ...req.body }});
        
        return res.status(200).send({ message: "Book updated successfully" });
    } catch (error) {
        return res.status(500).send({ message: error.message });
    }
}

const deleteBookById = async (req, res, next) => {
    //NOTE: REMEMBER TO VALIDATE USER INPUTS 
    try {
        const bookId = req.params.bookId;
        if(!mongoose.Types.ObjectId.isValid(bookId)) {
            return res.status(401).send({ message: "Invalid book"})
        }
        const findBookExist = await BookModel.findById(bookId);
        if(!findBookExist) {
            return res.status(404).send({ message: "Book not found"})
        }
        await BookModel.deleteOne({_id: bookId });

        return res.status(200).send({ message: "Book deleted successfully" });
    } catch (error) {
        return res.status(500).send({ message: error.message });
    }
}

const trendingBooks = async (req, res, next) => {
    //NOTE: REMEMBER TO VALIDATE USER INPUTS 
    try {
      
        const userId = "628695d03cf50a6e1a34e27b";
        const bookId = "62882bcfa245bf62ffdf90d6";

        
        let query = [
			{
				$lookup:
				{
				 from: "users",
				 localField: "userId",
				 foreignField: "_id",
				 as: "user"
				}
			},
            // {$unwind: '$creator'},
			{
				$lookup:
				{
				 from: "trendingbooks",
				 localField: "bookId",
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

        return res.status(200).send({ message: "Trending",  populatedData});
    } catch (error) {
        console.log(error)
        return res.status(500).send({ message: error.message });
    }
}

module.exports = {
    createNewBook,
    fetchBooks,
    fetchBookById,
    updateBookById,
    deleteBookById,
    searchBook,
    trendingBooks
}