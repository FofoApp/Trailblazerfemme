const mongoose = require('mongoose');
const fs = require('fs');

const JobModel = require('./../../models/jobModel/JobModel')
const UserModel = require('./../../models/UserModel');
const JobCategoryModel = require('./../../models/jobModel/JobCategory');
const ProductModel = require('../../models/productModel/ProductModel');
const { jobApplicationValidation } = require('./../../validations/jobValidation');
const { cloudinary } = require('./../../helpers/cloudinary');
const { cloudinaryImageUploadMethod } = require('../../helpers/cloudUpload');


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

        const users = await UserModel.find({}).select(`-updatedAt -following -followers -recentlySearchedBook 
        -recentlyPlayedPodcast -booksRead -library -books -createdAt`)
        .limit(limit)
        .skip(skip);
        
        users.map((user) => {

            if(user?.roles[0] === 'admin') {
                adminArray.push(user?.roles[0]);
            }

            if(user?.isPaid) {
                paidArray.push(user?.isPaid);
            }

        });


        const jobData = {
            jobCategories: jobCategories?.length,
            jobs,
            total_number_of_jobs: jobCount.length,
            total_number_of_jobs_categories: jobCategories?.length,
            total_number_of_jobs_orders: "",

            total_number_of_products: productLength?.length,
            products,

            adminCounts: adminArray?.length,

            userCounts: users?.length,
            paidUserCounts: paidArray?.length,
            users: users
        }

        return res.status(200).json(jobData);

    } catch (error) {
        return res.status(500).json({status: "failed", message: error?.message });
    }
}



exports.createNewJob = async (req, res, next) => {
  
    /**
     * POST REQUEST
     * ADMIN ONLY ROUTE
     * http://localhost:2000/api/jobs/create
     * 
     *{
        "name": "Test new job",
        "company_name": "Company name",
        "description": "Job Description",
        "link": "http://localhost:2000/api/jobs/create",
        "authorImages": "Author name",
        "authorName": "Jane Doe",
        "jobType": "Job Type",
        "jobField": "Job Field",
        "adminAccess": "6360cb6c1731281982334003",
        "accessType": "Premium",
        "position": ["HR", "Social Media Manager"],
        "qualification": ["Bsc. Health Management Studies", "Bsc. Management Science"],
        "categoryId": "628d56c755040aa7fb78d8cd",
        "createdBy": "John Doe",
        "userId": "628d56c755040aa7fb78d8cd"
        }
     */


    const userId = req?.user?.id || null;

    let jobImages = []
    let authorImages = []

    try {

        if(!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(200).json({ status: "success", message: "Unknown user Id"});
        }
                
        // //Upload jobImages to cloudinary
        if(req?.files?.jobImages) {
   
            const { public_id, secure_url } = await cloudinaryImageUploadMethod(req?.files?.jobImages);
  
            if(!secure_url || !public_id) {
            //Reject if unable to upload image
                return res.status(404).json({ status: 'failed', message: "Unable to upload image please try again"});
            }

            // Push image item to array
            jobImages.push({public_id, secure_url})

            // Delete image form temporary system storage
            req?.files?.jobImages?.map((image) => fs.unlinkSync(image?.path))

        }
                
        // //Upload authorImages to cloudinary
        if(req?.files?.authorImages) {


            const { public_id, secure_url } = await cloudinaryImageUploadMethod(req?.files?.authorImages);
   
            if(!secure_url || !public_id) {
            //Reject if unable to upload image
                return res.status(404).json({ status: 'failed', message: "Unable to upload image please try again"});
            }

            // Push image item to array
            authorImages.push({public_id, secure_url});

            // Delete image form temporary system storage
            req?.files?.authorImages?.map((image) => fs.unlinkSync(image?.path));

        }
    
        const jobData  = {
            ...req.body,
            createdBy: userId,
            userId,
            jobImages,
            authorImages,
        }

        const createNewJob = new JobModel(jobData);

        const createdJob = await createNewJob.save();

        if(!createdJob) {
            return res.status(401).json({ message: "Unable to create new job"});
        }

        return res.status(200).json({ status: 'success', message: "Job Created successfully" });

    } catch (error) {
      
        return res.status(500).json({ status: 'failed', message: error?.message });
    }
}



exports.listJobs = async (req, res, next) => {
    //GET REQUEST
    //http://localhost:2000/api/jobs/lists

    const DEFAULT_PAGE = 1;
    const DEFAULT_SIZE = 10;

    let { page = DEFAULT_PAGE, size = DEFAULT_SIZE } = req.query;

    page = Number(page);
    size = Number(size);

    const limit = size;
    const skip = (page - 1) * size;

    try {
        const jobs = await JobModel.find({})
        .limit(limit)
        .skip(skip);
        
        if(!jobs) {
            return res.status(200).json({ status: 'suceess', message: "No job found", jobs: []});
        }

        return res.status(200).json({ status: 'suceess', jobs });

    } catch (error) {
        return res.status(500).json({ status: 'failed', message: error?.message });
    }
}


exports.findJobById  = async (req, res, next) => {

    //GET REQUEST
    //http://localhost:2000/api/jobs/jobId/get
    //http://localhost:2000/api/jobs/62902e117ecadf9305054e1a/get

    const { jobId } = req.params;

try {
    if(!mongoose.Types.ObjectId.isValid(jobId)) {
        return res.status(200).json({ message: "Unknown job parameter"});
    }
    const query = [
        { $match: {_id: mongoose.Types.ObjectId(jobId)} },
        { $lookup: { from: "jobcategories", localField: "categoryId", foreignField: "_id", as: "category" } },
        { $unwind: "$category" },
        { $project: {
             id: "$_id",
            _id: 0,
            "title": 1,
            "company_name": 1,
            "image": 1,
            "description": 1,
            "position": 1,
            "qualification": 1,
            "userId":   1,
            "createdAt": 1,
            "category.id": "$category._id",
            "category.title": "$category.title",
        } },

        { $unset: "category._id" }
    ];

    let job = await JobModel.aggregate(query);
    job = job[0];

    if(!job) {
        return res.status(404).json({status: "failed", message: "No job found"});
    }

    return res.status(200).json({ status: 'suceess', job });

} catch (error) {
    return res.status(500).json({status: "failed", message: error?.message });
}

}

exports.updateJobById = async (req, res, next) => {

      /**
     * //PATCH REQUEST
     //http://localhost:2000/api/jobs/62aa0d254774270c1f61f639/update
     * 
     * {
        "name": "Test new job",
        "company_name": "Company name",
        "description": "Job Description",
        "link": "http://localhost:2000/api/jobs/create",
        "authorImages": "Author name",
        "authorName": "Jane Doe",
        "jobType": "Job Type",
        "jobField": "Job Field",
        "adminAccess": "6360cb6c1731281982334003",
        "accessType": "Premium",
        "position": ["HR", "Social Media Manager"],
        "qualification": ["Bsc. Health Management Studies", "Bsc. Management Science"],
        "categoryId": "628d56c755040aa7fb78d8cd",
        "createdBy": "John Doe",
        "userId": "628d56c755040aa7fb78d8cd"
        }
     */

        const { jobId } = req.params;

        let jobImages = []
        let authorImages = []

    try {
        
        if(!mongoose.Types.ObjectId.isValid(jobId)) {
            return res.status(200).json({status: "failed", message: "Invalid job id"}); 
        }

        const job = await JobModel.findById(jobId);

        if(!job) {
            return res.status(404).json({status: "failed", message: "No job found"});
        }

        //Upload Image to cloudinary
        //DELETE FILE FROM CLOUDINARY IF EXIST IF JOB IMAGE EXIST AND UPLOAD NEW ONE

        if(req?.file?.jobImages && req.body.jobImagesIds) {
            const jobImagesIds = req.body.jobImagesIds;

            // Loop through the ids array and delete each of them from cloudinary
            jobImagesIds.map(async (imageId) => {
                let deleteResponse = await cloudinary.uploader.destroy(imageId?.public_id);

                if(!deleteResponse) {
                    //Reject if unable to delete image
                    return res.status(400).json({ status: "failed", error: "Unable to delete job image please try again"});
                }
            })

            //Upload Image to cloudinary
            const {public_id, secure_url} = await cloudinaryImageUploadMethod(req?.files?.jobImages);

            if(!secure_url && !public_id) {
                return res.status(400).json({ status: "failed", error: "Unable to upload new job image, please try again"});
            }

            jobImages.push({public_id, secure_url});

            req?.files?.jobImages?.map((image) => {
                fs.unlinkSync(image?.path);
            });

        }


        //Upload Image to cloudinary
        //DELETE FILE FROM CLOUDINARY IF EXIST AUTHOR IMAGE EXIST AND UPLOAD NEW ONE

        if(req?.file?.authorImages && req?.body?.authorImageIds) {

            const authorImageIds = req.body.authorImageIds;

            // Loop through the ids array and delete each of them from cloudinary
            authorImageIds.map(async (imageId) => {
                let deleteResponse = await cloudinary.uploader.destroy(imageId?.public_id);

                if(!deleteResponse) {
                    //Reject if unable to delete image
                    return res.status(400).json({ status: "failed", error: "Unable to delete job image please try again"});
                }
            })

            //Upload Image to cloudinary
            const {public_id, secure_url} =  await cloudinaryImageUploadMethod(req?.files?.jobImages);

            if(!secure_url && !public_id) {
                return res.status(400).json({ status: "failed", error: "Unable to upload new job image, please try again"});
            }

            authorImages.push({public_id, secure_url});

            req?.files?.authorImages?.map((image) => {
                fs.unlinkSync(image?.path);
            });

        }

        
        let updateData = { ...req.body, jobImages, authorImages };

        //UPDATE JOB 
         await JobModel.findByIdAndUpdate(jobId, {$set: updateData}, {new: true});
        
        return res.status(200).json({status: "success", status: "success", success: "Job updated successfully"});

    } catch (error) {
        // console.log(error)
        return res.status(500).json({status: "failed", error: error?.message });
    }
}


exports.deleteJobById  = async (req, res, next) => {
    //DELETE REQUEST 
    //http://localhost:2000/api/jobs/62aa0d254774270c1f61f639/delete
    
    const { jobId } = req.params;

    try {

        if(!mongoose.Types.ObjectId.isValid(jobId)) {
            return res.status(400).json({ message: "Unknown job parameter"});
        }

        let job = await JobModel.findById(jobId);

        if(job?.jobImages?.length > 0) {

            job?.jobImages.map( async (image) => {
                // DELETE IMAGES FROM CLOUDINARY
                let deleteResponse = await cloudinary.uploader.destroy(image?.public_id);
                if(!deleteResponse) {
                    return res.status(400).json({ status: 'failed', message: "Unable to job image, please try again!"});
                }
            });
        }

        if(job?.authorImages?.length > 0) {

            job?.authorImages.map( async (image) => {
                // DELETE IMAGES FROM CLOUDINARY
                let deleteResponse = await cloudinary.uploader.destroy(image?.public_id);
                if(!deleteResponse) {
                    return res.status(400).json({ status: 'failed', message: "Unable to delete author image, please try again!"});
                }
            });
        }

        // DELETE JOB
        const deletedJob = await job.delete();

        if(!deletedJob) {
            return res.status(400).json({ status: 'failed', message: "Unable to delete job"});
        }

        return res.status(200).json({ status: 'success', message: "Job deleted successfully"});

    } catch (error) {
        return res.status(500).json({ status: 'failed', message: error?.message });
    }

}