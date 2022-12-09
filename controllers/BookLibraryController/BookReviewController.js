const mongoose = require('mongoose');

const BookReview  = require('../../models/bookLibraryModel/BookReviewModel');
const BookModel = require('../../models/bookLibraryModel/BookModel')

exports.createBookReview = async (req, res, next) => {

    const { bookId, rating, comment} = req.body;

    const review_data = {
        bookId,
        reviewdBy: req.user.id,
        fullname: req.user.username,
        rating: Number(rating),
        comment
    }

    try {
        if(!mongoose.Types.ObjectId.isValid(req.user.id))return res.status(400).send({error: "User not found"});
        if(!mongoose.Types.ObjectId.isValid(req.params.bookId))return res.status(400).send({error: "Book not found"});

        let book = await BookModel.findById(req.params.bookId)
      
        if(!book) return res.status(404).send({error: "Book not found"});

        let review = await BookReview.findOne({ bookId: bookId });
        
        const isReviewed = review?.reviewdBy.toString() === req.user.id.toString();

        
        if(isReviewed) {
            review.rating = Number(rating);
            review.comment = comment;
            review = await review.save();
           
        } else {
           
            review = await BookReview.create(review_data);
            
            book = await BookModel.findByIdAndUpdate(req.params.bookId, { $addToSet: { reviewIds: review._id }})         
        }
       
        next();
    } catch (error) {
    
        return res.status(500).send({error: error.message});  
    }
}


exports.getReviews = async (req, res) => {
    try {
        let reviews = await BookReview.find({})
            // .limit()
            // .skip()

        if(!reviews) return res.status(404).send({error: "No review found"});
        let numberOfReviews = await BookReview.countDocuments();
        reviews.map((review) => {
            return review.ratings = review.rating / numberOfReviews
            // return review.reduce((acc, item) => item.ratings + acc, 0) / numberOfReviews
        })

        
        return res.status(200).send({ reviews, numberOfReviews});
      
    } catch (error) {
        return res.status(500).send({error: error.message});  
    }
}