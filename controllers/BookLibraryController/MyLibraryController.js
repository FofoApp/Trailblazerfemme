const mongoose = require('mongoose');
const MyLibraryModel = require('./../../models/bookLibraryModel/MyLibraryModel');
const BookCategoryModel = require('./../../models/bookLibraryModel/BookCategoryModel');
const BookModel = require('./../../models/bookLibraryModel/BookModel')
const UserModel = require('./../../models/UserModel')

exports.addBookToMyLibrary = async (req, res, next) => {
    //POST REQUEST 
    //http://localhost:2000/api/library/category/create
    const userId = req.user.id;
    const bookId = req.params.bookId;
    //ADD A BOOK TO MY LIBRARY
    try {
        const addBook = new MyLibraryModel({ userId, bookId });
        const addedBook = await addBook.save();
        return res.status(200).send({ message: "Book added to library", addedBook });
    } catch (error) {
        return res.status(500).send({ message: error.message });
    }
    
}
exports.fetchAllBooksInLibrary = async (req, res, next) => {
    //FOR AUTHENTICATED USERS
    //GET REQUEST
    //http://localhost:2000/api/library


    try {
        //ALL BOOK CATEGORIES
        const categories = await BookCategoryModel.find().select('-createdAt -updatedAt -__v');

        //TOP BOOK AUTHORS

        const topAuthors = await BookModel.aggregate(
            [
                { $group : { _id : "$author", name: { $addToSet: "$author" }, books: { $push: "$title" }, totalBooksWritten: { $sum: 1} } }
            ]
         );

        //  console.log(topAuthors)

        //ALL BOOKS IN MY LIBRARY
        let query=[
            {
                $lookup: { from: "users", localField: "userId", foreignField: "_id", as: "user" }
            },
            {$unwind: '$user'},
            {
                $lookup: { from: "books",  localField: "bookId", foreignField: "_id", as: "book" }
            },
            {$unwind: '$book'},
            {
                $match:{  'userId': mongoose.Types.ObjectId(req.user.id) }
            },
            { 
                $project : {
                "_id":1,
                "userId": 1,
                "bookId": 1,
                "user._id": 1,
                "user.fullname": 1,
                "user.email": 1,
                "user.phonenumber": 1,
                "user.field": 1,
                "user.profileImagePath": 1,
                "user.socialLinks": 1,
                "user.isPaid": 1,
                "user.nextPaymentDate": 1,
                "user.roles": 1,
                "book._id": 1,
                "book.title": 1,
                "book.imagePath": 1,
                "book.author": 1,
                "book.price": "1",
                "book.ratings": 1,
                "book.store": 1,
                "book.bookCategoryId": 1,

            

            //     "comments_count":{$size:{"$ifNull":["$blog_comments",[]]}},
            //     "likes_count":{$size:{"$ifNull":["$blog_likes",[]]}}
                } 
            },

        ];

        let total= await MyLibraryModel.countDocuments(query);
		let page= (req.query.page) ? parseInt(req.query.page) : 1;
		let perPage = (req.query.perPage) ? parseInt(req.query.perPage) : 10;
		let skip = (page-1)*perPage;

        query.push({ $skip:skip, });
		query.push({ $limit:perPage, });


        if(req.body.keyword && req.body.keyword !=''){ 
			query.push({
			  $match: { 
			    $or :[
			    //   { topic : { $regex: '.*' + req.body.keyword + '.*',  $options: 'i' }  },
			      { 'book.title' : {$regex: '.*' + req.body.keyword + '.*',  $options: 'i' }  },
			      { 'book.author' : {$regex: '.*' + req.body.keyword + '.*',  $options: 'i' }  },
			    ]
			  }
			});
		}

        const findBooksInLibrary = await MyLibraryModel.aggregate(query);
        let paginationData = { totalRecords:total, currentPage:page, perPage:perPage, totalPages:Math.ceil(total/perPage) }
   
        return res.status(200).send({ message: "Books", categories: categories, myLibrary: findBooksInLibrary, topAuthors, paginationData });
    } catch (error) {
        return res.status(500).send({ message: error.message });
    }
}

exports.searchBookInLibrary = async (req, res, next) => {
    //GET REQUEST
    //http://localhost:2000/api/library/search
    const searchKeyword = req.body.searchKeyword;
    try {

		let page= (req.query.page) ? parseInt(req.query.page) : 1;
		let perPage = (req.query.perPage) ? parseInt(req.query.perPage) : 10;
		let skip = (page-1)*perPage;

    const findSearchKeyword = await BookModel.find({
            $or: [
                { title: {  $regex: '.*' + searchKeyword + '.*',  $options: 'i'  } },
                { author: { $regex: '.*' + searchKeyword + '.*',  $options: 'i' } },
                // { topic: { $regex: '.*' + searchKeyword + '.*',  $options: 'i' } },
            ],
            }
    ).select('-trendingId -recentSearch -cloudinaryPublicId -createdAt -updatedAt -__v')
      .skip(skip).limit(perPage);
      
        if(!findSearchKeyword) {
            return res.status(404).send({ message: "Book with the search phrase not found!"})
        }

        let total = findSearchKeyword ? findSearchKeyword.length : 0;

        let paginationData = { totalRecords:total, currentPage:page, perPage:perPage, totalPages:Math.ceil(total/perPage) }
        return res.status(200).send({ searchedBooks:findSearchKeyword, paginationData})
    } catch (error) {
        return res.status(500).send({ message: error.message });
    }
}

exports.searchBookInLibraryById = async (req, res, next) => {
    //GET REQUEST
    //http://localhost:2000/api/library/:bookId/book
    //http://localhost:2000/api/library/62882d1a3760d3ad2c20612c/book
    try {
        if(!mongoose.Types.ObjectId.isValid(req.params.bookId)) {
            return res.status(404).send({ message: "Unknown book parameter "});
        }

        const usersWhoRead = await UserModel.findOne({ whoRead: req.params.bookId }).select('-password');

        const findSearchKeyword =  await BookModel.find({ _id: req.params.bookId}).select('-trendingId -recentSearch -cloudinaryPublicId -createdAt -updatedAt -__v');
     
        if(!findSearchKeyword) {
            return res.status(404).send({ message: "No book found"})
        }
        const convertMongooseObjectIdToString = findSearchKeyword[0].bookCategoryId[0].toHexString();

    //SIMILAR BOOKS
                
     const similarBooks = await BookModel.find({bookCategoryId: convertMongooseObjectIdToString }).select('-whoRead -trendingId -recentSearch -cloudinaryPublicId -price -ratings -store -bookCategoryId -createdAt -updatedAt -__v');
    
       const { _id, profileImagePath, ...others } = usersWhoRead._doc;       
       const extractDetails = { _id, profileImagePath };

        // const relatedBooks = await BookModel.find({ bookCategoryId: convertMongooseObjectIdToString });

        return res.status(200).send({ message: "Book found", findSearchKeyword, usersWhoRead: extractDetails, similarBooks  })
    } catch (error) {
        return res.status(500).send({ message: error.message });
    }
}

exports.userReadBook = async (req, res, next) => {
    //PATCH REQUEST
    //http://localhost:2000/api/library/:bookId/read
    //http://localhost:2000/api/library/628800b0de57eb226b1ef22b/read

    const bookId = req.params.bookId;
    const userId = req.user.id;

    try {

        if(!mongoose.Types.ObjectId.isValid(bookId)) {
            return res.status(404).send({ error: "Unknown book id"});
        }

        const  updateUserReadBook = await UserModel.updateOne({ _id: userId }, 
            {$addToSet: { booksRead: bookId }}, { new: true });

        if(!updateUserReadBook) {
            return res.status(401).send({ error: "Unable to process reading request"});
        }
        
        next();

    } catch (error) {
        return res.status(500).send({ error: error.message });
    }
}

exports.readBook = async (req, res, next) => {
    //PATCH REQUEST
    //http://localhost:2000/api/library/:bookId/read
    //http://localhost:2000/api/library/628800b0de57eb226b1ef22b/read

    const bookId = req.params.bookId;
    const userId = req.user.id;

    try {

        if(!mongoose.Types.ObjectId.isValid(bookId)) {
            return res.status(404).send({ error: "Unknown book id"});
        }

        const updateBookRead = await BookModel.findByIdAndUpdate(bookId, {$addToSet: {readers: userId }}, { new: true }).select("_id title ratings bookImage price store bookCategoryId");
        
        if(!updateBookRead) {
            return res.status(401).send({ error: "Unable to process reading request"});
        }

        return res.status(200).send(updateBookRead);

    } catch (error) {
        return res.status(500).send({ error: error.message });
    }
}
