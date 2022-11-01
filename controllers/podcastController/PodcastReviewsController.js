const mongoose = require('mongoose');

const PodcastReview  = require('../../models/bookLibraryModel/PodcastReviewModel');
const PodcastModel = require('../../models/bookLibraryModel/PodcastModel');



exports.createPodcastReview = async (req, res, next) => {

    const { rating, comment} = req.body;
    const { podcastId } = req.params;

    const review_data = {
        podcastId,
        reviewdBy: req.user.id,
        fullname: req.user.username,
        rating: Number(rating),
        comment
    }

    try {
        if(!mongoose.Types.ObjectId.isValid(req.user.id))return res.status(400).send({error: "User not found"});
        if(!mongoose.Types.ObjectId.isValid(podcastId))return res.status(400).send({error: "Podcast not found"});

        let podcast = await PodcastModel.findById(podcastId);
      
        if(!podcast) return res.status(404).send({error: "podcast not found"});

        let review = await PodcastReview.findOne({ podcastId: podcastId });
        
        const isReviewed = review?.reviewdBy.toString() === req.user.id.toString();

        
        if(isReviewed) {
            review.rating = rating;
            review.comment = comment;
            review = await review.save();
           
        } else {
           
            review = await PodcastReview.create(review_data);
            
            podcast = await PodcastModel.findByIdAndUpdate(podcastId, { $addToSet: { reviewIds: review._id }})         
        }
       
        next();
    } catch (error) {
    
        return res.status(500).send({error: error.message});  
    }
}


exports.getPodcast = async (req, res) => {
    try {
        let podcasts_reviews = await PodcastReview.find({})
            // .limit()
            // .skip()

        if(!podcasts_reviews) return res.status(404).send({error: "No review found"});
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
        if(!mongoose.Types.ObjectId.isValid(reviewId))  return res.status(404).send({error: "Podcast review not found"});

        let podcast_review = await PodcastReview.findById(reviewId)
                                                        .select("-__v -updatedAt")
                                                        .exec();                         

        if(!podcast_review) return res.status(404).send({error: "Podcast review not found"});
        
        return res.status(200).send({ podcast_review });
      
    } catch (error) {
        return res.status(500).send({error: error.message});  
    }
}