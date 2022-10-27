const fs = require('fs');
const mongoose = require('mongoose');
const PodcastModel = require('./../../models/podcast/PodcastModel');
const UserModel = require('./../../models/UserModel');
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

    const query =  [
                        { $group : { _id : "$podcastHostId", hosts: { $addToSet: "$hosts" }, totalNumberOfPodcasts: { $sum: 1} } }
                   ];

    const topPodcasters = await PodcastModel.aggregate(query);

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
        
        return res.status(200).send({
        categories: podcastCategories,
        recentlyPlayedPodcast,
        topPodcasters,
        youMightLike,
        popular
    });
        
        } catch (error) {
            return res.status(500).send({ error: error.message });
        }
}


exports.createNewPodcast = async (req, res, next) => {
    //NOTE VALIDATE USER INPUTS BEFORE PROCESSING

    //http://localhost:2000/api/podcast/create
    /*
    {
    "name": "Don’t make me think: A common sense approach to career thinking • EP 10",
    "description": "Description",
    "podcastImage": "image location",
    "hosts": "Omoregie & Johnson",
    "tags": "Career, Black Women",
    "link": "podcastlink.com/podcast/getpodcast"
    "podcastCategoryId":"628aa41619bac3aea4eea770",
    "podcastHostId":"628695d03cf50a6e1a34e27b"
    }

    */
   const { podcastCategoryId, podcastHostId, name, description, hosts, tags, link } = req.body;

   const file = req.file;

   if(!file) return res.status(400).send({ error: "Please upload an image"});

    try {

        if(!mongoose.Types.ObjectId.isValid(podcastCategoryId)) {
            return res.status(401).send({ error: "Unknown Podcast Category"})
        }

        if(!mongoose.Types.ObjectId.isValid(podcastHostId)) {
            return res.status(401).send({ error: "Unknown Podcast Host"})
        }

        const findIfPodcastExist = await PodcastModel.findOne({ name });

        if(findIfPodcastExist) {
            return res.status(400).send({ error: "Podcast name already exist"});
        }
        
        // //Upload Image to cloudinary
        const uploaderResponse = await cloudinary.uploader.upload(file.path);
        
        if(!uploaderResponse) {
            //Reject if unable to upload image
            return res.status(404).send({ error: "Unable to upload image please try again"});
        }

        const createPodcast = new PodcastModel({
            podcastCategoryId, podcastHostId, name, description, hosts, tags, link,
             podcastCloudinaryPublicId: uploaderResponse.public_id,
            podcastImage: uploaderResponse.secure_url
        });

        // const createPodcast = new PodcastModel(req.body);
        const createdPodcast = await createPodcast.save();

        //Delete the file from localStorage after upload to server and database
        if(createdPodcast) fs.unlinkSync(file.path)

        return res.status(201).send(createdPodcast);

    } catch (error) {
        return res.status(500).send({ message: error.message });
    }
}

exports.listPodcasts = async (req, res, next) => {
    //NOTE VALIDATE USER INPUTS BEFORE PROCESSING
    //GET REQUEST
    //http://localhost:2000/api/podcast/lists
    try {
        
        // const podcast = await PodcastModel.find({})
        //                                     .populate({
        //                                         path: 'hosts',
        //                                         model: 'User',
        //                                         select: 'fullname createdAt',
        //                                         populate: {
        //                                             path: 'profileId',
        //                                             model: 'Profile',
        //                                             select: '_id userId profileImage',
        //                                 }
        //                             });


            // return res.status(200).send(podcast);

        const query = [
            {$match: {} },
            { $lookup: { from:'users',  localField: 'hosts', foreignField: "_id", as: 'hosts' } },
            { $unwind: '$hosts' },
            { $project: {
                "id": "$_id",
                "_id": 0,
                "name": 1,
                "topic": 1,
                "description": 1,
                "podcastImage": 1,
                "link": 1,
                "tags": 1,
                "hosts.id": "$hosts._id",
                "hosts.fullname": 1, 
                "hosts.profileImage": 1,
            } }
        ];

        const podcasts = await PodcastModel.aggregate(query)
   
        if(!podcasts || !podcasts.length) {
            return res.status(204).send({ error: "No podcast available"});
        }
  
        return res.status(200).send(podcasts);

    } catch (error) {
        return res.status(500).send({ error: error.message });
    }
}


exports.searchForPodcast = async (req, res, next) => {
    //NOTE VALIDATE USER INPUTS BEFORE PROCESSING
    //GEY REQUEST
   //http://localhost:2000/api/podcast/search

   /*
   Search keyword could be either title, hostname or topic
    { "keyword": "Omoregie" }
   */

    
   let keyword = req.body.keyword;

   const search  = [
            { name: {  $regex: '.*' + keyword + '.*',   $options: 'i'  } },
            { tags: {  $regex: '.*' + keyword + '.*',   $options: 'i' } },
    ]


   let { page, perpage } = req.query;

   page = (page) ? parseInt(page) : 1;
   perpage = (perpage) ? parseInt(perpage) : 10;

   let skip = (page - 1) * perpage;

   try {
   
    if(await UserModel.findOne({ fullname: { $regex: '.*' + keyword + '.*',   $options: 'i' } })) {
       
        let user = await UserModel.findOne({ fullname: { $regex: '.*' + keyword + '.*',   $options: 'i' } });
        keyword = user._id.toString();
        search.push( { hosts: { $in: [keyword] } },)
    }

   const searchForPodcast = await PodcastModel.find( { $or: search } )
        .populate({
            path: 'hosts',
            model: 'User',
            select: 'fullname profileImage createdAt',
        })
        .skip(skip).limit(perpage)
        .select("id name description podcastImage link tags")

//    .skip(skip).limit(perpage)
   
//      .select('-trendingId -recentSearch -cloudinaryPublicId -createdAt -updatedAt -__v')

    //  const query = [
    //     { $match: { $or: [
    //         { name: {  $regex: '.*' + keyword + '.*',   $options: 'i'  } },
    //         // { hosts: {  $regex: '.*' + keyword + '.*',   $options: 'i' } },
    //         { tags: {  $regex: '.*' + keyword + '.*',   $options: 'i' } },
    //     ] } },

    //     { $lookup: { from: "users", localField: '_id', foreignField: "hosts", as: "hosts" } },
    //     { $unwind: "$hosts" },
    //     { $project: {
    //         "id": "$_id",
    //         "_id": 0,
    //         "name": 1,
    //         "description": 1,
    //         "podcastImage": 1,
    //         "link": 1,
    //         "hosts": 1,
    //         "tags": 1,

    //         "hosts.id": "$hosts._id",
    //         "hosts.fullname": 1, 
    //         "hosts.profileImage": 1,
    //         "hosts._id": null,

    //     } }
        
    //  ];

    //  await Actor.find({ $text: { $search: `"${query.name}"`  } })

    //  const searched = await PodcastModel.aggregate(query);

    //  return res.status(200).send(searched);

       if(!searchForPodcast) {
           return res.status(404).send({ message: "Podcast with the search phrase not found!"})
       }

       let total = searchForPodcast ? searchForPodcast.length : 0;

       let paginationData = { totalRecords:total, currentPage:page, perpage:perpage, totalPages:Math.ceil(total/perpage) }
       
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

   const { podcastId } = req.params;
   
   try {

    if(!mongoose.Types.ObjectId.isValid(podcastId)) {
        return res.status(400).send({ message: "Invalid podcast parameter"});
    }

    // const podcast = await PodcastModel.findOne({_id: podcastId }).select('-__v -updatedAt, -createdAt');

    const query = [
        { $match: { _id: mongoose.Types.ObjectId(podcastId) } },
        // { $lookup: { from: "users", localField: 'hosts', foreignField: "_id", as: "hosts" } },
        { $unwind: "$hosts" },
        { $project: {
            "id": "$_id",
            "_id": 0,
            "name": 1,
            "topic": 1,
            "description": 1,
            "podcastImage": 1,
            "link": 1,
            "hosts": 1,
            "tags": 1,
            // "hosts.id": "$hosts._id",
            // "hosts.fullname": 1,
            // "hosts.profileImage": 1,
            // "hosts._id": null,
        } }
        
     ];

     const podcast = await PodcastModel.aggregate(query);

//    const updatePopularPodcast = await PopularPodcastModel.create( { podcastId: podcastId, userWhoListenedToPodcast: "628695d03cf50a6e1a34e27b" });
      
       return res.status(200).send(podcast[0]);

   } catch (error) {
       return res.status(500).send({ message: error.message });
   }

}

exports.updatePodcastById = async (req, res, next) => {
    //NOTE VALIDATE USER INPUTS BEFORE PROCESSING
    //PATCH REQUEST
   //http://localhost:2000/api/podcast/podcastId/update
   //http://localhost:2000/api/podcast/628b36a28bebdadd00d787ed/update

   const { podcastId } = req.params;

   try {

    if(!mongoose.Types.ObjectId.isValid(podcastId)) {
        return res.status(400).send({ error: "Invalid podcast parameter"})
    }

   const findPostcastAndUpdate = await PodcastModel.findByIdAndUpdate(podcastId, {$set: req.body}, {new: true} );

   if(!findPostcastAndUpdate) {
       return res.status(400).send({ error: "Unable to update podcast"});
   }
      
       return res.status(200).send({ success: "Podcast updated successfully" });

   } catch (error) {
       return res.status(500).send({ error: error.message });
   }

}


exports.deletePodcastById = async (req, res, next) => {

    //NOTE VALIDATE USER INPUTS BEFORE PROCESSING
    //DELETE REQUEST
    //http://localhost:2000/api/podcast/podcastId/delete
    //http://localhost:2000/api/podcast/628b36a28bebdadd00d787ed/delete

   const { podcastId } = req.params;

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
