const mongoose = require('mongoose');
const PodcastEpisodeModel = require('./../../models/podcast/PodcastEpisodeModel');
const { cloudinary } = require('./../../helpers/cloudinary');


exports.createNewPodcastEpisode = async (req, res, next) => {
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
        const podcastId = req.body.podcastId;
        // const podcastHostId = req.user ? req.user.id : req.body.podcastHostId;        

        if(!mongoose.Types.ObjectId.isValid(podcastId)) {
            return res.status(401).send({ message: "Unknown Podcast"})
        }

        // if(!mongoose.Types.ObjectId.isValid(podcastHostId)) {
        //     return res.status(401).send({ message: "Unknown Podcast Host"})
        // }

        const findIfPodcastExist = await PodcastEpisodeModel.findOne({ episode: req.body.episode });

        if(findIfPodcastExist) {
            return res.status(200).send({ message: "Podcast episode already exist"});
        }
        
        // //Upload Image to cloudinary
        const uploaderResponse = await cloudinary.uploader.upload(req.file.path);

        if(!uploaderResponse) {
            //Reject if unable to upload image
            return res.status(404).send({ message: "Unable to upload image please try again"});
        }

        const createPodcastEpisode = new PodcastEpisodeModel({
            ...req.body, podcastId,
            cloudinaryImagePublicId: uploaderResponse.public_id,
            cloudinaryPodcastPublicId: uploaderResponse.public_id,
            podcastLink: uploaderResponse.secure_url,
            podcastImage: uploaderResponse.secure_url
        });

        // const createPodcast = new PodcastModel(req.body);
        const createdPodcastEpisode = await createPodcastEpisode.save();
        return res.status(200).send({ message: "Podcast created successfully", createdPodcastEpisode});

    } catch (error) {
        return res.status(500).send({ message: error.message });
    }
}


exports.listPodcastEpisodes = async (req, res, next) => {
    //GET REQUEST
    //http://localhost:2000/api/podcast/episodes/lists

    try {
        const podcastEpisodes = await PodcastEpisodeModel.find({});
        if(!podcastEpisodes) {
            return res.status(200).send({ message: "No Episode available", podcastEpisodes: []});
        }
        return res.status(200).send(podcastEpisodes);
    } catch (error) {
        return res.status(200).send({ message: error.message });
    }

}


exports.searchForPodcastEpisode = async (req, res, next) => {
    //GET REQUEST
    //http://localhost:2000/api/podcast/episodes/search
    /**
     * {
            "searchKeyword": "Black Women"
        }
     */
    const searchKeyword = req.body.searchKeyword;
    try {
        let page = (req.query.page) ? parseInt(req.query.page) : 1;
       let perPage = (req.query.perPage) ? parseInt(req.query.perPage) : 10;
       let skip = (page-1)*perPage;

   const searchForPodcastEpisode = await PodcastEpisodeModel.find({
           $or: [
               { title: {  $regex: '.*' + searchKeyword + '.*',  $options: 'i'  } },
            //    { hosts: { $regex: '.*' + searchKeyword + '.*',  $options: 'i' } },
               { topic: { $regex: '.*' + searchKeyword + '.*',  $options: 'i' } },
           ],
           }
   ).skip(skip).limit(perPage);
     //.select('-trendingId -recentSearch -cloudinaryPublicId -createdAt -updatedAt -__v')
       if(!searchForPodcastEpisode) {
           return res.status(404).send({ message: "Podcast episode(s) not found!"})
       }

       let total = searchForPodcastEpisode ? searchForPodcastEpisode.length : 0;

       let paginationData = { totalRecords:total, currentPage:page, perPage:perPage, totalPages:Math.ceil(total/perPage) }
       
       return res.status(200).send({ message: "Podcast Episode(s) found", PodcastEpisodes:searchForPodcastEpisode, paginationData})

    } catch (error) {
        return res.status(500).send({ message: error.message });
    }
}

exports.updatePodcastEpisodeById = async (req, res, next) => {
    //NOTE VALIDATE USER INPUTS BEFORE PROCESSING
   //http://localhost:2000/api/podcast/episode/podcastEpisodeId/update
   const podcastId = req.params.podcastId;

   try {

    if(!mongoose.Types.ObjectId.isValid(podcastEpisodeId)) {
        return res.status(400).send({ message: "Invalid episode parameter"})
    }

   const findPostcastEpisodeAndUpdate = await PodcastEpisodeModel.findByIdAndUpdate(req.params.podcastEpisodeId, {$set: req.body}, {new: true} );

   if(!findPostcastEpisodeAndUpdate) {
       return res.status(400).send({ message: "Unable to update Episode"});
   }
      
       return res.status(200).send({ message: "Episode updated successfully"})
   } catch (error) {
       return res.status(500).send({ message: error.message });
   }

}


exports.deletePodcastEpisodeById = async (req, res, next) => {

    //NOTE VALIDATE USER INPUTS BEFORE PROCESSING
   //http://localhost:2000/api/podcast/episode/podcastEpisodeId/delete
   const podcastId = req.params.podcastId;

   try {
       
    if(!mongoose.Types.ObjectId.isValid(podcastId)) {
        return res.status(400).send({ message: "Invalid Episode parameter"})
    }

    const findPostcastEpisodeAndDelete = await PodcastEpisodeModel.findByIdAndDelete(podcastEpisodeId);
     
    if(!findPostcastEpisodeAndDelete) {
        return res.status(404).send({ message: "Unable to delete podcast episode!"})
    }
       
    return res.status(200).send({ message: "Episode deleted successfully"});

   } catch (error) {
       return res.status(500).send({ message: error.message });
   }

}
