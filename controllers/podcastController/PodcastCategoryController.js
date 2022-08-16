const slugify = require('slugify')
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
            return res.status(401).send({ error: "Category name already exist"});
        }

        const createNewCategory = new PodcastModel(req.body);
        const savedCategory = await createNewCategory.save();

        if(!savedCategory) return res.status(401).send({ error: "Unable to create category" });

        return res.status(200).send(savedCategory);

    } catch (error) {
        return res.status(500).send(error.message);
    }
}

exports.PodcastCategories = async (req, res, next) => {
    //VALIDATE USER INPUT BEFORE PROCESSING
    //http://localhost:2000/api/podcast/categories
    try {
        const findIfCategoryExist = await PodcastModel.find().select('-createdAt -updatedAt');

        if(!findIfCategoryExist) {
            return res.status(200).send({ error: "No category found", categories: [] });
        }
        
        return res.status(200).send({ findIfCategoryExist });

    } catch (error) {
        return res.status(500).send(error.message);
    }
}


exports.updatePodcastCategoryById = async (req, res, next) => {
    //VALIDATE USER INPUT BEFORE PROCESSING
    const {podcastCateogryId} = req.params;
    const {name} = req.body;
    try {

        const slug = slugify(name, {
            replacement: '-',  // replace spaces with replacement character, defaults to `-`
            remove: undefined, // remove characters that match regex, defaults to `undefined`
            lower: true,      // convert to lower case, defaults to `false`
            strict: false,     // strip special characters except replacement, defaults to `false`
            trim: true         // trim leading and trailing replacement chars, defaults to `true`
          });

          const updateData = { name, slug };

        
        const updatePodcastCategory = await PodcastModel.findByIdAndUpdate(podcastCateogryId, {$set: updateData }, { new: true });
        if(!updatePodcastCategory) {
            return res.status(401).send({ error: "Unable to update podcast category"});
        }
        
        return res.status(200).send({ success: "Podcast category updated successfully" });

    } catch (error) {
        return res.status(500).send({error: error.message});
    }
}

exports.deletePodcastCategoryById = async (req, res, next) => {
    //VALIDATE USER INPUT BEFORE PROCESSING
    const {podcastCateogryId} = req.params;
    try {
        const deletePodcastCategory = await PodcastModel.findByIdAndDelete(podcastCateogryId);
        
        if(!deletePodcastCategory) {
            return res.status(401).send({ error: "Unable to delete podcast category" });
        }
        
        return res.status(200).send({ success: "Podcast category deleted successfully" });

    } catch (error) {
        return res.status(500).send({ error: error.message });
    }
}


exports.recentlyPlayedPodcast = async (req, res, next) => {
    //VALIDATE USER INPUT BEFORE PROCESSING
    try {
        const deletePodcastCategory = await PodcastModel.findByIdAndDelete(req.params.podcastId);
        
        if(!deletePodcastCategory) {
            return res.status(401).send({ message: "Unable to delete podcast category" });
        }
        
        return res.status(200).send({ success: "Podcast category deleted successfully" });

    } catch (error) {
        return res.status(500).send(error.message);
    }
}

