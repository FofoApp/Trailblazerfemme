const mongoose = require('mongoose');
const JobCategoryModel = require('./../../models/jobModel/JobCategory');

exports.createNewJobCategory = async (req, res, next) => {
    //POST REQUEST
//http://localhost:2000/api/jobs/category/create
/**
 * 
 * {
    "name": "Science",
    "description": "Science jobs that are in hot demands"
    }
 */

const { name, description } = req.body;

    try {
        const createNewJobCategory = new JobCategoryModel({ name, description });
        const createdJobCategory = await createNewJobCategory.save();
        if(!createdJobCategory) {
            return res.status(401).send({ message: "Unable to create new job"});
        }
        return res.status(401).send(createdJobCategory);
    } catch (error) {
        return res.status(500).send({ message: error.message });
    }
}

exports.listJobCategories = async (req, res, next) => {
    //get REQUEST
    //http://localhost:2000/api/jobs/categories

    try {
        const jobCategories = await JobCategoryModel.find({});
        if(!jobCategories) {
            return res.status(401).send({ message: "Job categories not found"});
        }
        return res.status(200).send({ jobCategories });
    } catch (error) {
        return res.status(500).send({ message: error.message });
    }
}

exports.findJobCategoryById = async (req, res, next) => {
    //GET REQUEST
    //http://localhost:2000/api/jobs/category/jobCategoryId/get
    
    const jobCategoryId = req.params.jobCategoryId;
    try {
        if(!mongoose.Types.ObjectId.isValid(jobCategoryId)) {
            return res.status(200).send({ message: "Unknown job category parameter"});
        }
        const jobCategory = await JobCategoryModel.find({_id: jobCategoryId});
        if(!jobCategory) {
            return res.status(401).send({ message: "Job category not found"});
        }
        return res.status(401).send({jobCategory});

    } catch (error) {
        return res.status(500).send({ message: error.message });
    }
}


exports.updateJobCategoryById = async (req, res, next) => {
        //PATCH REQUEST
    //http://localhost:2000/api/jobs/category/628d56ad55040aa7fb78d8b2/update
    /**
     * {
        "title": "Lecturing",
        "slug": "lecturing",
        "description": "Lecturing jobs that are in hot demands"
        }
     */
    const jobCategoryId = req.params.jobCategoryId;
    try {
        if(!mongoose.Types.ObjectId.isValid(jobCategoryId)) {
            return res.status(200).send({ message: "Unknown job category parameter"});
        }

        const updatedjobCategory = await JobCategoryModel.findByIdAndUpdate({_id: jobCategoryId}, { $set: req.body}, {new: true});
        if(!updatedjobCategory) {
            return res.status(401).send({ message: "Job category not found"});
        }
        return res.status(200).send("Job category updated successfully");

    } catch (error) {
        return res.status(500).send({ message: error.message });
    }
}



exports.deleteJobCategoryById = async (req, res, next) => {
    //DELETE REQUEST
    //http://localhost:2000/api/jobs/category/628d56ad55040aa7fb78d8b2/delete
    const jobCategoryId = req.params.jobCategoryId;
    try {

        if(!mongoose.Types.ObjectId.isValid(jobCategoryId)) {
            return res.status(401).send({ message: "Unknown job category parameter"})
        }

        const jobCategory = await JobCategoryModel.findByIdAndDelete({_id: jobCategoryId});
        if(!jobCategory) {
            return res.status(401).send({ message: "Job category not found"});
        }
        return res.status(200).send({message: "Category delete successfully"});

    } catch (error) {
        return res.status(500).send({ message: error.message });
    }
}
