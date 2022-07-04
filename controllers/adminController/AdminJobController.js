const mongoose = require('mongoose');
const fs = require('fs');

const JobModel = require('./../../models/jobModel/JobModel')
const UserModel = require('./../../models/UserModel');
const JobCategoryModel = require('./../../models/jobModel/JobCategory');
const ProductModel = require('../../models/productModel/ProductModel');
const { jobApplicationValidation } = require('./../../validations/jobValidation');
const { cloudinary } = require('./../../helpers/cloudinary')

exports.jobs = async (req, res, next) => {
     
    //GET REQUEST
    //http://localhost:2000/api/dashboard
    let { page, size } = req.query;

    if(!page) page = 1;
    if(!size) size = 10;

    page = parseInt(page);
    size = parseInt(size);

    const limit = size;
    const skip = (page - 1) * size;


    try {
        let jobCategories = [];
        let jobs = [];

        const adminArray = [];
        const paidArray = [];

        jobCategories = await JobCategoryModel.find({});
        jobs = await JobModel.find({}).limit(5);

        let products = await ProductModel.find({}).limit(5);
        let productLength = await ProductModel.find({});

        const jobCount = await JobModel.find({});

        const users = await UserModel.find({}).select(`-password -__v -updatedAt -following -followers -recentlySearchedBook 
        -recentlyPlayedPodcast -booksRead -library -books -createdAt`)
        .limit(limit)
        .skip(skip);
        
        users.map((user) => {
            if(user.roles[0] === 'admin') adminArray.push(user.roles[0]);

            if(user.isPaid) paidArray.push(user.isPaid);
        });


        const jobData = {
            jobCategories: jobCategories.length,
            jobs,
            total_number_of_jobs: jobCount.length,
            total_number_of_jobs_categories: jobCategories.length,
            total_number_of_jobs_orders: "",

            total_number_of_products: productLength.length,
            products,

            adminCounts: adminArray.length,

            userCounts: users.length,
            paidUserCounts: paidArray.length,
            users: users
        }

        return res.status(200).send(jobData);

    } catch (error) {
        return res.status(500).send({ message: error.message });
    }
}



exports.createNewJob = async (req, res, next) => {
    
    /**
     * POST REQUEST
     * ADMIN ONLY ROUTE
     * http://localhost:2000/api/jobs/create
     * 
     * {
        "title": "Job one",
        "company_name": "Ricz Tech",
        "jobImage": "Images",
        "jobType": "Full Time",
        "jobField": "Human Resource",
        "description": "decription",
        "position": "Developer",
        "qualification": "Any",
        "categoryId": "628d56c755040aa7fb78d8cd",
        "jobImage": "image.jpg"
        }
     */

    try {
                
        // //Upload Image to cloudinary
        const uploaderResponse = await cloudinary.uploader.upload(req.file.path);

        if(!uploaderResponse) {
            //Reject if unable to upload image
            return res.status(404).send({ message: "Unable to upload image please try again"});
        }
    
        const jobData  = {
            ...req.body,
            createdBy: req.user.id,
            userId: req.user.id,
            jobImageCloudinaryPublicId: uploaderResponse.public_id,  
            jobImagePath: uploaderResponse.secure_url
            
        }

        const createNewJob = new JobModel(jobData);

        const createdJob = await createNewJob.save();

        if(!createdJob) {
            return res.status(401).send({ message: "Unable to create new job"});
        }


        fs.unlinkSync(req.file.path);

        return res.status(200).send(createdJob);

    } catch (error) {
        return res.status(500).send({ message: error.message });
    }
}



exports.listJobs = async (req, res, next) => {
    //GET REQUEST
    //http://localhost:2000/api/jobs/lists
    let { page, size } = req.query;

    if(!page) page = 1;
    if(!size) size = 10;

    page = parseInt(page);
    size = parseInt(size);

    const limit = size;
    const skip = (page - 1) * size;

    try {
        const jobs = await JobModel.find({})
        .limit(limit)
        .skip(skip);
        
        if(!jobs) {
            return res.status(200).send({ message: "No job found", jobs: []});
        }
        return res.status(200).send(jobs);
    } catch (error) {
        return res.status(500).send({ message: error.message });
    }
}


exports.findJobById  = async (req, res, next) => {

    //GET REQUEST
    //http://localhost:2000/api/jobs/jobId/get
    //http://localhost:2000/api/jobs/62902e117ecadf9305054e1a/get

    const jobId = req.params.jobId;

try {
    if(!mongoose.Types.ObjectId.isValid(jobId)) {
        return res.status(200).send({ message: "Unknown job parameter"});
    }
    const job = await JobModel.findById(jobId);
    if(!job) {
        return res.status(200).send({ message: "No job found"});
    }

    return res.status(200).send(job);

} catch (error) {
    return res.status(500).send({ message: error.message });
}

}

exports.updateJobById = async (req, res, next) => {

      /**
     * //PATCH REQUEST
     //http://localhost:2000/api/jobs/62aa0d254774270c1f61f639/update
     * 
     * {
        "title": "Job one",
        "company_name": "Ricz Tech",
        "jobType": "Full Time",
        "jobField": "Human Resource",
        "description": "decription",
        "position": "Developer",
        "qualification": "Any",
        "categoryId": "628d56c755040aa7fb78d8cd",
        "jobImage": "image.jpg"
        }
     */

    const jobId = req.params.jobId;

    try {
        
        if(!mongoose.Types.ObjectId.isValid(jobId)) {
            return res.status(200).send({message: "Job info not valid"}); 
        }
        const job = await JobModel.findById(jobId);

        if(!job) {
            return res.status(404).send({ message: "No job found"});
        }

        let updateData = { ...req.body };

        //Upload Image to cloudinary
        //DELETE FILE FROM CLOUDINARY IF EXIST
        if(req?.file?.jobImagePath) {
            let uploaderResponse = await cloudinary.uploader.destroy(job.jobImageCloudinaryPublicId); 
            if(!uploaderResponse) {
                //Reject if unable to upload image
                return res.status(400).send({ message: "Unable to delete profile image please try again"});
            }

            //Upload Image to cloudinary
            uploaderResponse = await cloudinary.uploader.upload(req.file.path);
            updateData[jobImageCloudinaryPublicId] =  uploaderResponse.public_id;
            updateData[jobImagePath] = uploaderResponse.secure_url;

            fs.unlinkSync(req?.file?.path);
        }

        //UPDATE JOB 
         await JobModel.findByIdAndUpdate(jobId, {$set: updateData}, {new: true});
        
        return res.status(200).send({message: "Job updated successfully"});

    } catch (error) {
        // console.log(error)
        return res.status(500).send({ error: error.message });
    }
}


exports.deleteJobById  = async (req, res, next) => {
    //DELETE REQUEST 
    //http://localhost:2000/api/jobs/62aa0d254774270c1f61f639/delete
    
    const jobId = req.params.jobId;

    try {

        if(!mongoose.Types.ObjectId.isValid(jobId)) {
            return res.status(200).send({ message: "Unknown job parameter"});
        }

        let job = await JobModel.findById(jobId);
        
        let publicId  = job.jobImageCloudinaryPublicId;

        let uploaderResponse = await cloudinary.uploader.destroy(publicId);

        if(!uploaderResponse) {
            return res.status(200).send({ message: "Unable to delete image, try again!"});
        }

        job = await JobModel.findByIdAndDelete(jobId);

        if(!job) {
            return res.status(200).send({ message: "No job found"});
        }

        return res.status(200).send({ message: "Job deleted successfully"});

    } catch (error) {
        return res.status(500).send({ message: error.message });
    }

}