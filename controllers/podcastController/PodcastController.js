const mongoose = require('mongoose');
const PodcastModel = require('./../../models/podcast/PodcastModel');
const PodcastCategoryModel = require('./../../models/podcast/PodcastCategoryModel');
const PopularPodcastModel = require('./../../models/podcast/PopularPodcastModel');
const { cloudinary } = require('./../../helpers/cloudinary');



exports.podcasts = async (req, res, next) => {

    //GET REQUEST
    //http://localhost:2000/api/podcast
    try {

    //ALL PODCAST CATEGORIES
    const podcastCategories = await PodcastCategoryModel.find().select('-createdAt -updatedAt -__v');

    //TOP PODCASTER

    const topPodcasters = await PodcastModel.aggregate(
        [
            { $group : { _id : "$podcastHostId", hostNames: { $addToSet: "$hosts" }, totalNumberOfPodcasts: { $sum: 1} } }
        ]
    );

        
        //RECENTLY PLAYED PODCAST
        const recentlyPlayedPodcast = await PodcastModel.aggregate(
            [
                { $group : { _id : "$recentlyPlayedPodcast" } },
                {
                    $lookup: { from: "users",  localField: "recentlyPlayedPodcast", foreignField: "_id", as: "recentlyPlayed" }
                },
                // { 
                //     $project : {
                //     "_id":1,
                //     "title" : 1,
                //     "imagePath": 1,
    
                // //     "comments_count":{$size:{"$ifNull":["$blog_comments",[]]}},
                // //     "likes_count":{$size:{"$ifNull":["$blog_likes",[]]}}
                //     } 
                // },
    
            ]
        );

        //POPULAR POPULAR
        const popular = await PopularPodcastModel.find({}).populate("podcastId");

        //YOU MIGHT LIKE
        const youMightLike = await PodcastModel.aggregate(
            [
                // { $group : { _id : "$podcastCategoryId" } },
                {
                    $lookup: { from: "podcasts",  localField: "podcastCategoryId", foreignField: "_id", as: "podcasts" }
                },
                { 
                    $project : {
                    "_id":1,
                    "title" : 1,
                    "imagePath": 1,
    
                //     "comments_count":{$size:{"$ifNull":["$blog_comments",[]]}},
                //     "likes_count":{$size:{"$ifNull":["$blog_likes",[]]}}
                    } 
                },
    
            ]
        );
        
        return res.status(200).send({ message: "Podcast", 
        categories: podcastCategories,
        recentlyPlayedPodcast,
        topPodcasters,
        youMightLike,
        popular
    });
        
        } catch (error) {
            return res.status(500).send({ message: error.message });
        }
}


exports.createNewPodcast = async (req, res, next) => {
    //NOTE VALIDATE USER INPUTS BEFORE PROCESSING

    //http://localhost:2000/api/podcast/create
    /*
    {
    "title": "Don’t make me think: A common sense approach to career thinking • EP 10",
    "topic": "Black Women In Tech",
    "imagePath": "image location",
    "about": "There are many variations of passages of Lorem Ipsum available, but the majority have suffered alteration in some form, by injected humour, or randomised words whichdon't look even slightly believable.",
    "hosts": "Omoregie & Johnson",
    "tags": "Career, Black Women",
    "podcastCategoryId":"628aa41619bac3aea4eea770",
    "podcastHostId":"628695d03cf50a6e1a34e27b"
    }

    */

    try {
        const podcastCategoryId = req.body.podcastCategoryId;
        const podcastHostId = req.user ? req.user.id : req.body.podcastHostId;        

        if(!mongoose.Types.ObjectId.isValid(podcastCategoryId)) {
            return res.status(401).send({ message: "Unknown Podcast Category"})
        }

        if(!mongoose.Types.ObjectId.isValid(podcastHostId)) {
            return res.status(401).send({ message: "Unknown Podcast Host"})
        }

        const findIfPodcastExist = await PodcastModel.findOne({ title: req.body.title });

        if(findIfPodcastExist) {
            return res.status(200).send({ message: "Podcast name already exist"});
        }
        
        // //Upload Image to cloudinary
        const uploaderResponse = await cloudinary.uploader.upload(req.file.path);

        if(!uploaderResponse) {
            //Reject if unable to upload image
            return res.status(404).send({ message: "Unable to upload image please try again"});
        }

        const createPodcast = new PodcastModel({
            ...req.body, podcastCategoryId, podcastHostId,
             cloudinaryPublicId: uploaderResponse.public_id,
            imagePath: uploaderResponse.secure_url
        });

        // const createPodcast = new PodcastModel(req.body);
        const createdPodcast = await createPodcast.save();
        return res.status(200).send({ message: "Podcast created successfully", createdPodcast});

    } catch (error) {
        return res.status(500).send({ message: error.message });
    }
}

exports.listPodcasts = async (req, res, next) => {
    //NOTE VALIDATE USER INPUTS BEFORE PROCESSING
    //GET REQUEST
    //http://localhost:2000/api/podcast/lists
    try {
        const podcasts = await PodcastModel.find({});
        if(!podcasts) {
            return res.status(200).send({ message: "No podcast available", podcasts: []});
        }
        return res.status(200).send(podcasts);
    } catch (error) {
        return res.status(200).send({ message: error.message });
    }
}


exports.searchForPodcast = async (req, res, next) => {
    //NOTE VALIDATE USER INPUTS BEFORE PROCESSING
    //GEY REQUEST
   //http://localhost:2000/api/podcast/search

   /*
   Search keyword could be either title, hostname or topic
    {
    "searchKeyword": "Omoregie"
    }
   */
   const searchKeyword = req.body.searchKeyword;
   try {

       let page = (req.query.page) ? parseInt(req.query.page) : 1;
       let perPage = (req.query.perPage) ? parseInt(req.query.perPage) : 10;
       let skip = (page-1)*perPage;

   const searchForPodcast = await PodcastModel.find({
           $or: [
               { title: {  $regex: '.*' + searchKeyword + '.*',  $options: 'i'  } },
               { hosts: { $regex: '.*' + searchKeyword + '.*',  $options: 'i' } },
               { topic: { $regex: '.*' + searchKeyword + '.*',  $options: 'i' } },
           ],
           }

   ).skip(skip).limit(perPage);
   
     //.select('-trendingId -recentSearch -cloudinaryPublicId -createdAt -updatedAt -__v')

       if(!searchForPodcast) {
           return res.status(404).send({ message: "Podcast with the search phrase not found!"})
       }

       let total = searchForPodcast ? searchForPodcast.length : 0;

       let paginationData = { totalRecords:total, currentPage:page, perPage:perPage, totalPages:Math.ceil(total/perPage) }
       
       return res.status(200).send({  Podcasts:searchForPodcast, paginationData});
       
   } catch (error) {
       return res.status(500).send({ message: error.message });
   }

}


exports.searchPodcastById = async (req, res, next) => {
    //NOTE VALIDATE USER INPUTS BEFORE PROCESSING
    //GET REQUEST
   //http://localhost:2000/api/podcast/podcastId/search
   //http://localhost:2000/api/podcast/628b3a7bc2a03c780da819b9/search
   const podcastId = req.params.podcastId;

   try {

    if(!mongoose.Types.ObjectId.isValid(podcastId)) {
        return res.status(400).send({ message: "Invalid podcast parameter"})
    }
    const podcast = await PodcastModel.findOne({_id: podcastId }).select('-__v -updatedAt, -createdAt');

//    const findPostcastAndUpdate = await PodcastModel.findByIdAndUpdate(podcastId, {$set: req.body}, {new: true} );
//    if(!findPostcastAndUpdate) {
//        return res.status(400).send({ message: "Unable to update podcast"});
//    }

    // const findIfUserAlreadyExistInPopularPodcast = await PopularPodcastModel.findOne({userWhoListenedToPodcast: "628695d03cf50a6e1a34e27b"});
    
    // if(findIfUserAlreadyExistInPopularPodcast) {
    //     console.log("You already listend")
    //     return res.status("200").send({ message: "User already listend"})
    // }

   const updatePopularPodcast = await PopularPodcastModel.create( { podcastId: podcastId, userWhoListenedToPodcast: "628695d03cf50a6e1a34e27b" });
      
       return res.status(200).send({ message: "Podcast found", podcast})
   } catch (error) {
       return res.status(500).send({ message: error.message });
   }

}

exports.updatePodcastById = async (req, res, next) => {
    //NOTE VALIDATE USER INPUTS BEFORE PROCESSING
    //PATCH REQUEST
   //http://localhost:2000/api/podcast/podcastId/update
   //http://localhost:2000/api/podcast/628b36a28bebdadd00d787ed/update
   const podcastId = req.params.podcastId;

   try {

    if(!mongoose.Types.ObjectId.isValid(podcastId)) {
        return res.status(400).send({ message: "Invalid podcast parameter"})
    }

   const findPostcastAndUpdate = await PodcastModel.findByIdAndUpdate(req.params.podcastId, {$set: req.body}, {new: true} );

   if(!findPostcastAndUpdate) {
       return res.status(400).send({ message: "Unable to update podcast"});
   }
      
       return res.status(200).send({ message: "Podcast updated successfully"})
   } catch (error) {
       return res.status(500).send({ message: error.message });
   }

}


exports.deletePodcastById = async (req, res, next) => {

    //NOTE VALIDATE USER INPUTS BEFORE PROCESSING
    //DELETE REQUEST
    //http://localhost:2000/api/podcast/podcastId/delete
    //http://localhost:2000/api/podcast/628b36a28bebdadd00d787ed/delete
   const podcastId = req.params.podcastId;

   try {
       
    if(!mongoose.Types.ObjectId.isValid(podcastId)) {
        return res.status(400).send({ message: "Invalid podcast parameter"})
    }

    const findPostcastAndDelete = await PodcastModel.findByIdAndDelete(podcastId);
     
    if(!findPostcastAndDelete) {
        return res.status(404).send({ message: "Unable to delete podcast!"})
    }
       
    return res.status(200).send({ message: "Podcast deleted successfully"});

   } catch (error) {
       return res.status(500).send({ message: error.message });
   }

}
