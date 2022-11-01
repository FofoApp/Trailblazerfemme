const mongoose = require('mongoose');
const MyLibraryModel = require('./../../models/bookLibraryModel/MyLibraryModel');
const BookCategoryModel = require('./../../models/bookLibraryModel/BookCategoryModel');
const BookModel = require('./../../models/bookLibraryModel/BookModel')
const UserModel = require('./../../models/UserModel')

const APIFeatures = require('./../../helpers/apiFeatures');
const User = require('./../../models/UserModel');

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


// exports.fetchAllBooksInLibrary = async (req, res, next) => {
//     //FOR AUTHENTICATED USERS
//     //GET REQUEST
//     //http://localhost:2000/api/library


//     try {
//         //ALL BOOK CATEGORIES
//         const categories = await BookCategoryModel.find().select('-createdAt -updatedAt -__v');

//         //TOP BOOK AUTHORS

//         const topAuthors = await BookModel.aggregate(
//             [
//                 { $match: {} },
//                 // { $group : { _id : "$author", name: { $addToSet: "$author, $title" }, 
//                 // books: { $push: "$title $bookImage $price" },
//                 {
//                     $group :  {
//                         _id : {
//                             author: "$author",
//                             id: "$_id",
//                             title: "$title",
//                             bookImage: "$bookImage",
//                             price: "$price",
//                             totalBooksWritten: { $sum: 1},
//                         },
                        
//                     },
                   
//                 },
//                     {$unwind: '$_id'},
//                 {
//                     $project: { 
//                         "details": "$_id",
//                         "_id": 0
//                     }
//                 }
//             ]
//          );

//         //  console.log(topAuthors)

//         //ALL BOOKS IN MY LIBRARY
//         let query = [
//             {
//                 $match:{  'userId': mongoose.Types.ObjectId(req.user.id) }
//             },
//             {
//                 $lookup: { from: "users", localField: "userId", foreignField: "_id", as: "user" }
//             },
//             {$unwind: '$user'},
//             {
//                 $lookup: { from: "books",  localField: "bookId", foreignField: "_id", as: "books" }
//             },
//             {$unwind: '$books'},
            
//         ];

//         const myLibrary = await MyLibraryModel.find({ userId: mongoose.Types.ObjectId(req.user.id) })
//             .populate("userId", "fullname profileImage")
//             .populate("bookId", "title author price store bookImage")

//         console.log(myLibrary)

//         let total= await MyLibraryModel.countDocuments(query);
// 		let page= (req.query.page) ? parseInt(req.query.page) : 1;
// 		let perPage = (req.query.perPage) ? parseInt(req.query.perPage) : 10;
// 		let skip = (page-1)*perPage;

//         query.push({ $skip:skip, });
// 		query.push({ $limit:perPage, });


//         // if(req.body.keyword && req.body.keyword !=''){
// 		// 	query.push({
// 		// 	  $match: {
// 		// 	    $or :[
// 		// 	    //   { topic : { $regex: '.*' + req.body.keyword + '.*',  $options: 'i' }  },
// 		// 	      { 'book.title' : {$regex: '.*' + req.body.keyword + '.*',  $options: 'i' },  },
// 		// 	      { 'book.author' : {$regex: '.*' + req.body.keyword + '.*',  $options: 'i' },  },
// 		// 	    ]
// 		// 	  }
// 		// 	});
// 		// }

   

//         // const findBooksInLibrary = await MyLibraryModel.aggregate(query);
//         let paginationData = { totalRecords:total, currentPage:page, perPage:perPage, totalPages:Math.ceil(total/perPage) }
   
//         // return res.status(200).send({ message: "Books", categories: categories, myLibrary: findBooksInLibrary, topAuthors, paginationData });

//         return res.status(200).send({ message: "Books", categories: categories, myLibrary, topAuthors, paginationData });
//     } catch (error) {
//         return res.status(500).send({ message: error.message });
//     }
// }


exports.fetchAllBooksInLibrary = async (req, res, next) => {
    //FOR AUTHENTICATED USERS
    //GET REQUEST
    //http://localhost:2000/api/library

    let { pc = 1, bl = 1, tb = 1 } = req.query;

    if(!pc) {
        pc = Number(pc) || 1;
    }

    if(!bl) {
        bl = Number(bl) || 1;
    }

    if(!tb) {
        tb = Number(tb) || 1;
    }


    try {
        //ALL BOOK CATEGORIES
        const categories = await BookCategoryModel.paginate({},
            {   
                page: pc,
                limit: 10,
                select: '-createdAt -updatedAt -__v'
            }
            )

        const books_in_library = await BookModel.paginate({},
            {   
                page: bl,
                limit: 10,
                select: '-updatedAt -__v'
            }
            )
        
        const trending_books = await BookModel.paginate({},
            {   
                page: tb,
                limit: 10,
                select: ' -updatedAt -__v',
                sort: { createdAt: -1 }
            })

        // const book_author = books_in_library.map((author) => author.id.toString())

        const topAuth = await BookModel.find({},
            {   
                page: tb,
                limit: 10,
                select: 'id fullname profileImage',
                paginate: { 
                    path: "createdBy",
                    model: "User",
                    select: 'id fullname profileImage'
                },
                sort: { createdAt: -1 }
            });


        const top_authors = topAuth.map((author) => {
            if(author.createdBy == undefined || author.createdBy == null) {
                delete author
            }
            return author.createdBy;
        })

       



        //TOP BOOK AUTHORS

        const tAuthor = await BookModel.aggregate([
            { $match: {}},
            {
                $group: {
                    _id : '$createdBy',
                    author : {  $first: '$author' },
                    title : {  $first: '$title' },
                    price : {  $first: '$price' },
                    totalBooksWritten: { $sum:1 }
                 }
            },
            
            {
                $project: {
                  id: "$_id",
                  author: 1,
                  title: 1,
                  price: 1,
                  totalBooksWritten: 1,
                  _id:0
                }
              },

              { $sort: { totalBooksWritten: -1 } },
              
        ]);
        
        
        // return res.status(200).send({ tAuthor });


        const topAuthors = await BookModel.aggregate(
            [
                { $match: {} },
                // { $group : { _id : "$author", name: { $addToSet: "$author, $title" }, 
                // books: { $push: "$title $bookImage $price" },
                {
                    $group :  {
                        _id : {
                            author: "$author",
                            id: "$_id",
                            title: "$title",
                            bookImage: "$bookImage",
                            price: "$price",
                            bookLink: "$bookLink",
                            totalBooksWritten: { $sum: 1},
                        },
                        
                    },
                   
                },
                    {$unwind: '$_id'},
                {
                    $project: { 
                        "details": "$_id",
                        "_id": 0
                    }
                }
            ]
         );


        //ALL BOOKS IN MY LIBRARY
        let query = [
            {
                $match:{  'userId': mongoose.Types.ObjectId(req.user.id) }
            },
            {
                $lookup: { from: "users", localField: "userId", foreignField: "_id", as: "user" }
            },
            {$unwind: '$user'},
            {
                $lookup: { from: "books",  localField: "bookId", foreignField: "_id", as: "books" }
            },
            {$unwind: '$books'},
            
        ];

        const myLibrary = await MyLibraryModel.find({ userId: mongoose.Types.ObjectId(req.user.id) })
            .populate("userId", "fullname profileImage")
            .populate("bookId", "title author price store bookImage")


        let total= await MyLibraryModel.countDocuments(query);
		let page= (req.query.page) ? parseInt(req.query.page) : 1;
		let perPage = (req.query.perPage) ? parseInt(req.query.perPage) : 10;
		let skip = (page-1)*perPage;

        query.push({ $skip:skip, });
		query.push({ $limit:perPage, });


        // if(req.body.keyword && req.body.keyword !=''){
		// 	query.push({
		// 	  $match: {
		// 	    $or :[
		// 	    //   { topic : { $regex: '.*' + req.body.keyword + '.*',  $options: 'i' }  },
		// 	      { 'book.title' : {$regex: '.*' + req.body.keyword + '.*',  $options: 'i' },  },
		// 	      { 'book.author' : {$regex: '.*' + req.body.keyword + '.*',  $options: 'i' },  },
		// 	    ]
		// 	  }
		// 	});
		// }

   

        // const findBooksInLibrary = await MyLibraryModel.aggregate(query);
        let paginationData = { totalRecords:total, currentPage:page, perPage:perPage, totalPages:Math.ceil(total/perPage) }
   
        // return res.status(200).send({ message: "Books", categories: categories, myLibrary: findBooksInLibrary, topAuthors, paginationData });
        const book_details = {categories, continue_reading: books_in_library[0], myLibrary: books_in_library, trending: trending_books, top_authors: tAuthor,}
        return res.status(200).send({ book_details, message: "Books", tAuthor, categories: categories, myLibrary, topAuthors, paginationData });
    } catch (error) {
        return res.status(500).send({ message: error.message });
    }
}

exports.searchBooksByAuthorId = async (req, res) => {
    const { authorId } = req.params;
    try {
        // let  apiFeatures  = new APIFeatures(BookModel.find(), "Book title book").search();
        //  apiFeatures  = await apiFeatures.query;
        // console.log("apiFeatures", apiFeatures)

        const books_by_author = await BookModel.find({ createdBy: authorId })
        .select('-readers -trendingId -recentSearch -cloudinaryPublicId -createdAt -updatedAt -__v')
        .populate({
            path: "bookCategoryId",
            model:"BookCategory",
            select: "id title" 
        })
        .populate({
            path: "createdBy",
            model:"User",
            select: "id fullname profileImage createdAt "
        })
    //   .skip(skip).limit(perPage);
    return res.status(200).send({ books_by_author })
    } catch (error) {
         return res.status(500).send({ error: error.message })
    }
}

exports.searchBookInLibrary = async (req, res, next) => {
    //GET REQUEST
    //http://localhost:2000/api/library/search
    let keyword = req.body.keyword;
    const currentUser = req.user.id;


    try {

		let page= (req.query.page) ? parseInt(req.query.page) : 1;
		let perPage = (req.query.perPage) ? parseInt(req.query.perPage) : 10;
		let skip = (page-1)*perPage;

        const recentSearch = await UserModel.findOne({ _id: currentUser }).populate({
            path: "recentlySearchedBook",
            model: "Book",
            populate: {
                path: "createdBy",
                model: "User",
                select: "id fullname profileImage"
            }
        }).limit(5)

        const search_details = recentSearch.recentlySearchedBook;
        const data  = search_details.map((item) => {
            return {
                description: item.description,
                id: item.id,
                title: item.title,
                author: item.author,
                price: item.price,
                ratings: item.ratings,
                store: item.store,
                bookImage: item.bookImage,

                createdBy: {
                    fullname: item.createdBy.fullname,
                    id: item.createdBy.id,
                    profileImage: item.createdBy.profileImage,
                    createdAt: item.createdBy.createdAt,
                }

            }
        })

    const findSearchKeyword = await BookModel.paginate({
            $or: [
                { title: {  $regex: '.*' + keyword + '.*',  $options: 'i'  } },
                { author: { $regex: '.*' + keyword + '.*',  $options: 'i' } },
                // { topic: { $regex: '.*' + keyword + '.*',  $options: 'i' } },
            ],
            },

            {
                select: "id title bookImage description author price ratings store createdAt ",
                populate: {
                    path: "bookCategoryId",
                    model:"BookCategory",
                    select: "id title" 
                },
                populate: {
                    path: "createdBy",
                    model:"User",
                    select: "id fullname profileImage createdAt "
                }

            }
    )
    
      
        if(!findSearchKeyword || findSearchKeyword.length <= 0) {
            return res.status(404).send({ message: "Book with the search phrase not found!"})
        }
       
        // const updateUserSearchBook = await UserModel.findByIdAndUpdate(currentUser, { $addToSet: { recentlySearchedBook: findSearchKeyword.id } })
        const doc = await UserModel.findById(currentUser);
        doc.recentlySearchedBook.addToSet(findSearchKeyword.docs[0]._id);
        await doc.save();


        

        

        let total = findSearchKeyword ? findSearchKeyword.length : 0;

        let paginationData = { totalRecords:total, currentPage:page, perPage:perPage, totalPages:Math.ceil(total/perPage) }
        
        return res.status(200).send({ searchedBooks:findSearchKeyword, recentSearch : data})
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

        const result = { findSearchKeyword, usersWhoRead: extractDetails, similarBooks }

        return res.status(200).send({message: "Book found", search_result: result})
    } catch (error) {
        return res.status(500).send({ message: error.message });
    }
}

exports.userReadBook = async (req, res, next) => {
    //PATCH REQUEST
    //http://localhost:2000/api/library/:bookId/read
    //http://localhost:2000/api/library/book/628800b0de57eb226b1ef22b/read

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

        const updateBookRead = await BookModel.findByIdAndUpdate(bookId, {$addToSet: { readers: userId }}, { new: true }).select("id title description ratings bookImage price store readers")
        .populate({
            path: "bookCategoryId",
            model:"BookCategory",
            select: "id title" 
        });
        const user_ids = updateBookRead.readers.map((userId) => userId.toString())
        

        const book_readers = await UserModel.find({_id: { $in: [...user_ids] }})
        .select("id fullname profileImage createdAt");

        const book_reviews = [];
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
               
     
        // .populate({
        //     path: "createdBy",
        //     model:"User",
        //     select: "id fullname profileImage createdAt "
        // })
        
        if(!updateBookRead) {
            return res.status(401).send({ error: "Unable to process reading request"});
        }

        return res.status(200).send({book_readers, updateBookRead, book_reviews, similar_books});

    } catch (error) {
        return res.status(500).send({ error: error.message });
    }
}
