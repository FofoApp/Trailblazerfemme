const { isValidObjectId } = require("mongoose");
const PodcastEpisodeModel = require('./../../models/podcast/PodcastEpisodeModel');
const { cloudinary } = require('./../../helpers/cloudinary');
const PodcastEpisode = require('./../../models/podcast/PodcastEpisodeModel');


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

        if(!isValidObjectId(podcastId)) {
            return res.status(401).send({ message: "Unknown Podcast"})
        }

        // if(!isValidObjectId(podcastHostId)) {
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

    if(!isValidObjectId(podcastEpisodeId)) {
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
       
    if(!isValidObjectId(podcastId)) {
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


exports.getAllPodcastEpisode = async (req, res) => {
   
    let { pageEpisode = 1, podcastId } = req.body;

    if(!pageEpisode) {
        pageEpisode = paraseInt(pageEpisode) || 1;
    }

    try {

        if(!isValidObjectId(podcastId))  return res.status(404).json({ error: "Invalid podcast" });
        
        const episodes = await PodcastEpisode.paginate({ podcastId: podcastId }, {
            page: pageEpisode,
            limit: 5,
            select: "id title name duration episode podcastImage podcastLink podcastId",
            });

        if(!episodes) return res.status(404).json({ error: "No episode found" });

        return res.status(200).json({ episodes });

    } catch (error) {
        return res.status(500).json({ error: error.message })
    }
}



exports.getPodcastEpisodeById = async (req, res) => {
   
    let { podcastEpisodeId, podcastId } = req.query;

    try {

        if(!isValidObjectId(podcastId))  return res.status(404).json({ error: "Invalid podcast" });
        if(!isValidObjectId(podcastEpisodeId))  return res.status(404).json({ error: "Invalid podcast episode" });
        
        const episode = await PodcastEpisode.findOne({ podcastId: podcastId, podcastEpisodeId: podcastEpisodeId})
                        .select("id title name duration episode podcastImage podcastLink podcastId").exec();

        if(!episode) return res.status(404).json({ error: "No episode found" });

        return res.status(200).json({ episode });

    } catch (error) {
        return res.status(500).json({ error: error.message })
    }
}

exports.getPodcastEpisodeByKeyword = async (req, res) => {
   
    let { keyword } = req.body;

    try {

            const search_result = await PodcastEpisode.findOne({ 
            $or: [
                    { name: { $regex: ".*" + keyword + ".*",  $options: 'i'  }},
                    { title: { $regex: ".*" + keyword + ".*",  $options: 'i'  }},
                ]
                }).select("id title name duration episode podcastImage podcastLink podcastId").exec();


        if(!search_result) return res.status(404).json({ error: "No search found" });

        return res.status(200).json({ search_result });

    } catch (error) {
        return res.status(500).json({ error: error.message })
    }
}