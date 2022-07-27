
const PodcastModel = require('./../../models/podcast/PodcastCategoryModel')

exports.createPodcastCategory = async (req, res, next) => {
    //http://localhost:2000/api/podcast/category/create
    /*
    {
    "name": "Motivation",
    "slug": "motivation"
    }
    */

    //VALIDATE USER INPUT BEFORE PROCESSING
    try {
        const findIfCategoryExist = await PodcastModel.findOne({name: req.body.name});
        if(findIfCategoryExist) {
            return res.status(401).send({ message: "Category name already exist"});
        }

        const createNewCategory = new PodcastModel(req.body);
        const savedCategory = await createNewCategory.save();

        return res.status(200).send({ message: "Category created successfully", savedCategory });

    } catch (error) {
        return res.status(200).send(error.message);
    }
}

exports.PodcastCategories = async (req, res, next) => {
    //VALIDATE USER INPUT BEFORE PROCESSING
    //http://localhost:2000/api/podcast/categories
    try {
        const findIfCategoryExist = await PodcastModel.find().select('-createdAt -updatedAt');

        if(!findIfCategoryExist) {
            return res.status(200).send({ message: "No category found", categories: [] });
        }
        
        return res.status(200).send({ message: "Categories found", categories: findIfCategoryExist });

    } catch (error) {
        return res.status(200).send(error.message);
    }
}


exports.updatePodcastCategoryById = async (req, res, next) => {
    //VALIDATE USER INPUT BEFORE PROCESSING
    try {
        const updatePodcastCategory = await PodcastModel.findByIdAndUpdate(req.params.podcastId, {$set: req.body }, { new: true });
        
        if(!updatePodcastCategory) {
            return res.status(401).send({ message: "No update podcast category", categories: [] });
        }
        
        return res.status(200).send({ message: "Podcast category updated successfully" });

    } catch (error) {
        return res.status(200).send(error.message);
    }
}

exports.deletePodcastCategoryById = async (req, res, next) => {
    //VALIDATE USER INPUT BEFORE PROCESSING
    try {
        const deletePodcastCategory = await PodcastModel.findByIdAndDelete(req.params.podcastId);
        
        if(!deletePodcastCategory) {
            return res.status(401).send({ message: "Unable to delete podcast category" });
        }
        
        return res.status(200).send({ message: "Podcast category deleted successfully" });

    } catch (error) {
        return res.status(200).send(error.message);
    }
}


exports.recentlyPlayedPodcast = async (req, res, next) => {
    //VALIDATE USER INPUT BEFORE PROCESSING
    try {
        const deletePodcastCategory = await PodcastModel.findByIdAndDelete(req.params.podcastId);
        
        if(!deletePodcastCategory) {
            return res.status(401).send({ message: "Unable to delete podcast category" });
        }
        
        return res.status(200).send({ message: "Podcast category deleted successfully" });

    } catch (error) {
        return res.status(200).send(error.message);
    }
}

