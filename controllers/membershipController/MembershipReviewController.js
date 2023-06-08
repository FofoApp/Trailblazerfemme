const mongoose = require('mongoose');

const MembershipReviewModel = require('./../../models/membershipModel/MembershipReviewModel')
const MembershipModel = require('./../../models/adminModel/AdminMembershipModel')

exports.listMemberships = async (req, res, next) => {

    // 

    try {

        let memberships = await MembershipModel.findById({})
                                                .populate({
                                                    path: "members",
                                                    model: "User",
                                                    select: ""
                                                })

        if(!memberships) {
            return res.status(200).json({ status: "success", memberships: [] });
        }

        const data = memberships.map((membership) => {
            return {
                amount: membership?.amount,
                membershipType: membership?.name,
                membershipId: membership?.id,
                description: membership?.description,
                createdAt: membership?.createdAt,
                members: {
                    membersCount: 0,
                    userInfo: {
                        id: membership?.members?.id,
                        fullname: membership?.members?.fullname,
                        profileImage: membership?.members?.profileImage,
                    }
                }
            }
        })

        return res.status(200).json({ status: "success", memberships: data });
        
    } catch (error) {
        return res.status(500).json({ status: "failed", error: error?.message, message: error?.message });
    }
}

exports.createMembershipReview = async (req, res, next) => {

    const { MembershipId, rating, comment} = req.body;

    const review_data = {
        MembershipId,
        reviewdBy: req.user.id,
        fullname: req.user.username,
        rating: Number(rating),
        comment
    }

    try {
        if(!mongoose.Types.ObjectId.isValid(req.user.id))return res.status(400).send({error: "User not found"});
        if(!mongoose.Types.ObjectId.isValid(MembershipId))return res.status(400).send({error: "Membership plan not found"});

        let membership = await MembershipModel.findById(MembershipId)
      
        if(!membership) return res.status(404).send({error: "Membership not found!!"}); 
    
        let review = await MembershipReviewModel.findOne({ MembershipId: MembershipId });
        
        const isReviewed = review?.reviewdBy.toString() === req.user.id.toString();
      
        if(isReviewed) {
            review.rating = rating;
            review.comment = comment;
            review = await review.save();
            await MembershipModel.findByIdAndUpdate({_id: MembershipId}, { $addToSet: { reviewsIds: review._id }})
           
        } else {
            review = await MembershipReviewModel.create(review_data);            
            update = await MembershipModel.findByIdAndUpdate({_id: MembershipId}, { $addToSet: { reviewsIds: review._id }})
           
        }
       
        next();
    } catch (error) {
        console.log(error)
        return res.status(500).send({error: error.message});  
    }
}


exports.getReviews = async (req, res) => {
    let { pg = 1} = req.query;
    if(!pg) {
        pg = parseInt(pg) || 1;
    }

    
    try {

        let reviews = await MembershipReviewModel.paginate({}, {
            page: pg,
            limit: 10,
            select: "-__v -updatedAt"
        });

        // .limit()
        // .skip()

        if(!reviews) return res.status(404).send({error: "No review found"});

        let numberOfReviews = await MembershipReviewModel.countDocuments();

        reviews.docs.map((review) => {
            return review.ratings = review.rating / numberOfReviews
            // return review.reduce((acc, item) => item.ratings + acc, 0) / numberOfReviews
        });

        
        return res.status(200).send({ reviews, numberOfReviews});
      
    } catch (error) {
        return res.status(500).send({error: error.message});  
    }
}