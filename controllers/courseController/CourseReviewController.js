const mongoose = require('mongoose');

const CourseReview  = require('../../models/courseModel/CourseReviewModel');
const CourseModel = require('../../models/courseModel/CourseModel')


exports.createCourseReview = async (req, res, next) => {

    const { courseId, rating, comment} = req.body;

    const review_data = {
        courseId,
        reviewdBy: req.user.id,
        fullname: req.user.fullname,
        rating: Number(rating),
        comment
    }

    try {
        if(!mongoose.Types.ObjectId.isValid(req.user.id))return res.status(400).send({error: "User not found"});
        if(!mongoose.Types.ObjectId.isValid(req.params.courseId))return res.status(400).send({error: "Course not found"});

        let course = await CourseModel.findById(req.params.courseId)
      
        if(!course) return res.status(404).send({error: "Course not found"});  

        let review = await CourseReview.findOne({ courseId: courseId });
        
        //CHECKING IF USER ALREADY REVIEWED A COURSE
        const isReviewed = review?.reviewdBy.toString() === req.user.id.toString();

        
        if(isReviewed) {

            review.rating = review_data.rating;
            review.comment = review_data.comment;
            review = await review.save();

            const reviews = await CourseReview.find({});
            const numReviews = reviews.length;

            const rating = reviews.reduce((a, c) => c.rating + a, 0) / numReviews;

            const update_course = await CourseModel.findByIdAndUpdate(courseId, {
                $addToSet: { reviewIds: review.id },
                $set: { rating, numReviews }
           });

           return res.status(200).send({ message: "Course reviewed successfully"});
           
        } else {
           
            const create_new_review = await CourseReview.create(review_data);

            if(!create_new_review) res.status(400).send({error: "Unable to create review"});
            
            const reviews = await CourseReview.find({});

            const numReviews = reviews.length;

            const rating = (reviews.reduce((a, c) => c.rating + a, 0)) / numReviews;

            const update_course = await CourseModel.findByIdAndUpdate(courseId, {
                $addToSet: { reviewIds: create_new_review.id },
                $set: { rating, numReviews }
           });

            return res.status(200).send({ message: "Course reviewed successfully"});
        }


    } catch (error) {
        console.log(error)
        return res.status(500).send({error: error.message});
    }
}


exports.findByReviewById = async (req, res) => {

    const { reviewId } = req.params;

    try {
        const review = await CourseReview.findById(reviewId).populate({
            path: "reviewdBy",
            model: "User",
            select: "id fullname profileImage"
        });

        if(!review) return res.status(404).send({error: "Review not found"});

        return res.status(200).send({ review });

    } catch (error) {
        
        return res.status(500).send({error: error.message});
    }
}



exports.deleteReviewById = async (req, res) => {
    
    const { courseId, reviewId } = req.params;

    try {

        const review = await CourseReview.findById(reviewId);

        if(!review) return res.status(404).send({error: "Review not found"});

        const course = await CourseModel.findById(courseId);
        if(!course) return res.status(404).send({error: "Course not found"});

        if(course.reviewIds.includes(reviewId)) {
            course.reviewIds.pull(reviewId)
            course.save()
        }

        const delete_review = await CourseReview.findByIdAndDelete(reviewId);

        const reviews = await CourseReview.find({});

        if(reviews.length  === 0) {
            const update_course = await CourseModel.findByIdAndUpdate(courseId, {
                $set: { rating: 0, numReviews: 0 }
           });

           return res.status(200).send({ message: "Review deleted succesfully" });
        }

        const numReviews = reviews.length;

        const set_rating = (reviews.reduce((a, c) => c.rating + a, 0)) / numReviews;

        const update_course = await CourseModel.findByIdAndUpdate(courseId, {
            $set: { rating: Number(set_rating), numReviews }
       });

        return res.status(200).send({ message: "Review deleted succesfully" });


    } catch (error) {
        return res.status(500).send({ error: error.message });
    }
}