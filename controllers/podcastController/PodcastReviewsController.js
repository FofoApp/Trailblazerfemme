const mongoose = require("mongoose");

const PodcastReview  = require('../../models/bookLibraryModel/PodcastReviewModel');
const PodcastModel = require('../../models/bookLibraryModel/PodcastModel');



exports.createPodcastReview = async (req, res, next) => {

    const { rating, comment} = req.body;
    const { podcastId } = req.params;

    const currentUser = req.user.id;

    const review_data = {
        podcastId,
        reviewdBy: currentUser,
        fullname: req.user.fullname,
        rating: Number(rating),
        comment
    }

    try {
        
        if(!mongoose.Types.ObjectId.isValid(currentUser))return res.status(400).send({error: "User not found"});
        if(!mongoose.Types.ObjectId.isValid(podcastId))return res.status(400).send({error: "Podcast not found"});

        let podcast = await PodcastModel.findById(podcastId);
      
        if(!podcast) return res.status(404).send({ error: "podcast not found" });

        let review = await PodcastReview.findOne({ podcastId: podcastId, reviewdBy: currentUser });
        
        const isReviewed = review?.reviewdBy.toString() === req.user.id.toString();

        
        if(isReviewed) {

            review.rating = Number(rating);
            review.comment = comment;
            review = await review.save();

            const reviews = await PodcastReview.find({});
            const numReviews = reviews.length;

            const rating = reviews.reduce((a, c) => c.rating + a, 0) / numReviews;
            
            podcast = await PodcastModel.findByIdAndUpdate(podcastId, {
                 $addToSet: { reviewIds: review._id },
                 $set: { rating, numReviews }
            });
           
        } else {
           
            const newReview = await PodcastReview.create(review_data);

            const reviews = await PodcastReview.find({});
            const numReviews = reviews.length;

            const rating = reviews.reduce((a, c) => c.rating + a, 0) / numReviews;
            
            podcast = await PodcastModel.findByIdAndUpdate(podcastId, {
                 $addToSet: { reviewIds: newReview._id },
                 $set: { rating, numReviews }
            });


        }
       
        next();

    } catch (error) {
    
        return res.status(500).send({ error: error.message });  
    }
}


exports.getPodcast = async (req, res) => {
    try {
        let podcasts_reviews = await PodcastReview.find({})
            // .limit()
            // .skip()

        if(!podcasts_reviews) return res.status(404).send({ error: "No review found" });
        let numberOfPodcast = await PodcastReview.countDocuments();
        podcasts_reviews.map((review) => {
            return review.ratings = review.rating / numberOfPodcast
            // return review.reduce((acc, item) => item.ratings + acc, 0) / numberOfPodcast
        })

        
        return res.status(200).send({ podcasts_reviews, numberOfPodcast});
      
    } catch (error) {
        return res.status(500).send({error: error.message});  
    }
}

exports.getPodcastById = async (req, res) => {

    const { reviewId } = req.params;

    try {
        if(!isValidObjectId(reviewId))  return res.status(404).send({error: "Podcast review not found"});

        let podcast_review = await PodcastReview.findById(reviewId)
                                                        .select("-__v -updatedAt")
                                                        .exec();                         

        if(!podcast_review) return res.status(404).send({error: "Podcast review not found"});
        
        return res.status(200).send({ podcast_review });
      
    } catch (error) {
        return res.status(500).send({error: error.message});  
    }
}