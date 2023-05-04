const mongoose = require('mongoose');
const fs = require('fs');

const JobModel = require('./../../models/jobModel/JobModel')
const JobCategoryModel = require('./../../models/jobModel/JobCategory');
const JobApplicationModel = require('./../../models/jobModel/JobApplicationModel');
const { jobApplicationValidation } = require('./../../validations/jobValidation');
const { cloudinary } = require('./../../helpers/cloudinary')

exports.jobs = async (req, res, next) => {
     
    //GET REQUEST
    //http://localhost:2000/api/jobs/alljobs

    
    const DEFAULT_PAGE = 1;
    const DEFAULT_SIZE = 2;

    let { page = DEFAULT_PAGE, size = DEFAULT_SIZE } = req.query;

    page = Number(page);
    size = Number(size);

    const limit = size;
    const skip = (page - 1) * size;


    try {

        const categoryQuery = [
            { $match: {}},
            { $project: {
                id: "$_id",
                _id: 0,
                "title": 1,
                "slug": 1,
                "description": 1,
                "createdAt": 1,
            } }
        ];

        
        // const jobQuery = [
        //     { $match: {} },
        //     { $lookup: { from: "jobcategories", localField: "categoryId", foreignField: "_id", as: "category" } },
        //     { $unwind: "$category" },
        //     { $project: {
        //          id: "$_id",
        //         _id: 0,
        //         "title": 1,
        //         "company_name": 1,
        //         "image": 1,
        //         "description": 1,
        //         "position": 1,
        //         "qualification": 1,
        //         "userId":   1,
        //         "createdAt": 1,
        //         "category.id": "$category._id",
        //         "category.title": "$category.title",
        //     } },

        //     { $unset: "category._id" }
        // ];




        const jobCategories = await JobCategoryModel.aggregate(categoryQuery);

        if(!jobCategories) return res.status(400).send({ error: "No job categories" });

        // const jobs = await JobModel.aggregate(jobQuery);

        // const jobs = await JobModel.paginate({}, {
        //     page: hot_page, limit: 5,
        //     populate: [{
        //         path: 'createdBy',
        //         model: 'User',
        //         select: 'fullname profileImage createdAt',
        //         }, 
        //         // {
        //         //     path: 'blogCategory',
        //         //     model: 'BlogCategory',
        //         //     select: 'name createdAt',
        //         // }

        //     ],
        //     sort: [
        //         [{ createdAt: -1, }]
        //     ],
        // });


        const jobs = await JobModel.paginate({}, {
            page, 
            size,
            limit,
            populate: [{
                path: 'createdBy',
                model: 'User',
                select: 'fullname profileImage createdAt',
                }, 
                // {
                //     path: 'blogCategory',
                //     model: 'BlogCategory',
                //     select: 'name createdAt',
                // }

            ],
            sort: [
                [{ createdAt: -1, }]
            ],
        });
        
        if(!jobs) return res.status(400).json({ error: "No job(s)" })

        return res.status(200).send({jobCategories, recommended: jobs});
    } catch (error) {
        return res.status(500).send({ message: error.message });
    }
}


exports.jobApplication = async (req, res, next) => {

    //POST REQUEST 
    //http://localhost:2000/api/jobs/jobId/apply
    //http://localhost:2000/api/jobs/62902e117ecadf9305054e1a/apply
    /**
    *   {
        "fullname": "Olawumi Olusegun",
        "email": "olawumi.olusegun@gmail.com",
        "availability": "Full",
        "phonenumber": "07065066382"
        }
     */
    const currenUser = req.user.id;
    const { jobId }  = req.params;


    try {
        if(!mongoose.Types.ObjectId.isValid(currenUser)) {
            return res.status(200).send({error: "User info not valid"}); 
        }
        if(!mongoose.Types.ObjectId.isValid(jobId)) {
            return res.status(200).send({error: "Job info not valid"}); 
        }

        const result = await jobApplicationValidation(req.body);

        const checkIfUserAlreadyAppliedForSameJob = await JobApplicationModel.findOne({ userId: currenUser, jobId: jobId });
        
        if(checkIfUserAlreadyAppliedForSameJob) {
            return res.status(200).send({error: "You already applied for this job"});
        }



        const applyForJob = new JobApplicationModel({...result, jobId, userId: currenUser });

        const applied = await applyForJob.save();

        if(!applied) return res.status(400).send({ error: "Unable to complete job application"});

        return res.status(201).send({success: "User data saved, kindly upload your resumee and cover letter", 
        data: { id: applied._id, } });

    } catch (error) {
      
        return res.status(500).send({ error: error.message });
    }
}

exports.uploadCoverLetterAndResumee = async (req, res, next) => {
    //POST REQUEST
    //http://localhost:2000/api/jobs/jobId/application/upload
    //http://localhost:2000/api/jobs/62902e117ecadf9305054e1a/application/upload
    //ACCEPTED FORMAT .docx, .pdf, .doc
    const currenUser = req.user.id;
    const { jobId } = req.params;
    const urls = [];
    let publicIdArray = [];

    try {
        if(!mongoose.Types.ObjectId.isValid(currenUser)) {
            return res.status(400).send({error: "User info not valid"}); 
        }
        if(!mongoose.Types.ObjectId.isValid(jobId)) {
            return res.status(400).send({error: "Job info not valid"}); 
        }

        const checkIfUserAlreadyAppliedForSameJob = await JobApplicationModel.findOne({userId: currenUser, jobId: jobId });
        
        if(!checkIfUserAlreadyAppliedForSameJob) {
            return res.status(400).send({error: "You have not applied for this job"}); 
        }
        if(checkIfUserAlreadyAppliedForSameJob.resumee && checkIfUserAlreadyAppliedForSameJob.coverLetter) {

            //PUSH CLOUDINARY ID TO publicIdArray
            publicIdArray.push(checkIfUserAlreadyAppliedForSameJob.resumeePublicId, checkIfUserAlreadyAppliedForSameJob.coverLetterPublicId)

            for(let publicId of publicIdArray) {
                 //DELETE DOCUMENTS FROM CLOUDINARY STORAGE USING THE ID IN publicIdArray
                let uploaderResponse = await cloudinary.uploader.destroy(publicId,  { resource_type: "raw" }); 
                
            }

             //SET THE IMAGE CV FIELDS TO NULL
            await JobApplicationModel.updateOne({userId: currenUser, jobId: jobId }, {$set: {
                resumeePublicId: null,
                coverLetterPublicId: null,
                resumee: null,
                coverLetter: null,

            }}, {new: true});
        }

        if(req.method === 'POST'){
            const files = req.files;
            
            for(const file of files){
                const { path } = file;

                //Upload NEW DOCUMENTS to cloudinary
                const uploaderResponse = await cloudinary.uploader.upload(path,  { resource_type: "raw" });
                if(!uploaderResponse) {
                    //Reject if unable to upload image
                    return res.status(404).send({ error: "Unable to upload document please try again"});
                }

                urls.push(uploaderResponse);
               
            }
        }

       

        // const result = await jobApplicationValidation(req.body);
        //UPDATE THE DATABASE WITH NEW DOCUMENT LINKS
        const updateApplication = await JobApplicationModel.updateOne({userId: currenUser, jobId: jobId},
            {   $set:
            {
                resumeePublicId: urls[0].public_id,
                resumee: urls[0].secure_url,

                coverLetterPublicId: urls[1].public_id,
                coverLetter: urls[1].secure_url,

            } }, {new: true});

             for(let item of req.files) fs.unlinkSync(item.path);
        
            return res.status(200).send({success: "Documents uploaded successfully"});

    } catch (error) {
        return res.status(500).send({ error: error.message });
    }
}
exports.updateCoverLetterAndResumee = async (req, res, next) => {
    //PATCH REQUEST
    //http://localhost:2000/api/jobs/JOBiD/update
    //http://localhost:2000/api/jobs/62902e117ecadf9305054e1a/application/update
    //ACCEPTED FORMAT .docx, .pdf, .doc
    const currenUser = req.user.id;
    const {jobId} = req.params;
    const uploadData = {};
    try {
        if(!mongoose.Types.ObjectId.isValid(currenUser)) {
            return res.status(200).send({error: "User info not valid"}); 
        }
        if(!mongoose.Types.ObjectId.isValid(jobId)) {
            return res.status(200).send({error: "Job info not valid"}); 
        }

        const checkIfUserAlreadyAppliedForSameJob = await JobApplicationModel.findOne({userId: currenUser, jobId: jobId });
        
        if(!checkIfUserAlreadyAppliedForSameJob) {
            return res.status(200).send({error: "You have not applied for this job"}); 
        }

        //Upload Image to cloudinary
        //DELETE FILE FROM CLOUDINARY IF EXIST
        if(req?.file?.resumee) {
            let uploaderResponse = await cloudinary.uploader.destroy(checkIfUserAlreadyAppliedForSameJob.resumeePublicId);        
            if(!uploaderResponse) {
                //Reject if unable to upload image
                return res.status(404).send({ error: "Unable to delete profile image please try again"});
            }

            //Upload Image to cloudinary
            uploaderResponse = await cloudinary.uploader.upload(req.file.path);

            uploadData[resumeePublicId] =  uploaderResponse.public_id;
            uploadData[resumee] = uploaderResponse.secure_url;
        }
        if(req.file.coverLetterPublicId) {
            let uploaderResponse = await cloudinary.uploader.destroy(checkIfUserAlreadyAppliedForSameJob.coverLetterPublicId);        
            if(!uploaderResponse) {
                //Reject if unable to upload image
                return res.status(404).send({ error: "Unable to delete profile image please try again"});
            }
            //Upload Image to cloudinary
            uploaderResponse = await cloudinary.uploader.upload(req.file.path);
            uploadData[coverLetterPublicId] =  uploaderResponse.public_id;
            uploadData[coverLetter] = uploaderResponse.secure_url;
        }

        // const result = await jobApplicationValidation(req.body);

        const updateApplication = await JobApplicationModel.updateOne({userId: currenUser, jobId: jobId},
            {   $set:  uploadData}, {new: true});
        
        return res.status(200).send({success: "Documents updated successfully"});

    } catch (error) {
        return res.status(500).send({ error: error.message });
    }
}


exports.updateJobApplication = async (req, res, next) => {
    //PATCH REQUEST
    //http://localhost:2000/api/jobs/JOBiD/update
    //http://localhost:2000/api/jobs/62902e117ecadf9305054e1a/application/update
    /**
     * {
        "fullname": "Olawumi Olusegun",
        "email": "olawumi.olusegun@gmail.com",
        "availability": "Full",
        "phonenumber": "07065066382"
        }
     */
    const currenUser = req.user.id;
    const {jobId} = req.params;

    try {
        if(!mongoose.Types.ObjectId.isValid(currenUser)) {
            return res.status(400).send({message: "User info not valid"}); 
        }
        if(!mongoose.Types.ObjectId.isValid(jobId)) {
            return res.status(400).send({error: "Job info not valid"}); 
        }

        const result = await jobApplicationValidation(req.body, true);

        const checkIfUserAlreadyAppliedForSameJob = await JobApplicationModel.findOne({userId: currenUser, jobId: jobId });
        
        if(!checkIfUserAlreadyAppliedForSameJob) {
            return res.status(400).send({error: "You have not applied for this job"}); 
        }

        const updateApplication = await JobApplicationModel.updateOne({userId: currenUser, jobId: jobId}, {$set: result}, {new: true});

        return res.status(200).send({success: "User data saved successfully"});

    } catch (error) {
        return res.status(500).send({ error: error.message });
    }
}


exports.createNewJob = async (req, res, next) => {

    const userId = req?.user?.id;

    console.log(req.body)

    /**
     * POST REQUEST
     * http://localhost:2000/api/jobs/create
     * {
        "title": "Job one",
        "company_name": "Ricz Tech",
        "jobImages": "Images",
        "link": "Images",
        "author_name": "Author Name",
        "author_image": "Author Name",
        "description": "decription",
        "position": "Developer",
        "qualification": "Any",
        "categoryId": "628d56c755040aa7fb78d8cd",
        "userId": "628695d03cf50a6e1a34e27b"
        }
     */
        

    try {

        return res.status(200).send(req.body);

        const jobPayload = { ...req.body, userId, createdBy: userId  };

        const createNewJob = new JobModel(jobPayload);

        const createdJob = await createNewJob.save();

        if(!createdJob) {
            return res.status(400).send({ success: "Unable to create new job"});
        }

        return res.status(200).send(createdJob);

    } catch (error) {
        console.log(error)
        return res.status(500).send({ error: error?.message });
    }
}


exports.listJobs = async (req, res, next) => {
    //GET REQUEST
    //http://localhost:2000/api/jobs/lists
    
    try {
        const jobs = await JobModel.find({});
        
        if(!jobs || jobs.length === 0) {
            return res.status(200).send({ success: "No job found"});
        }
        return res.status(200).send(jobs);
    } catch (error) {
        return res.status(500).send({ error: error.message });
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
        const job = await JobModel.find({});
        if(!job) {
            return res.status(200).send({ message: "No job found"});
        }
        return res.status(200).send(job);
    } catch (error) {
        return res.status(500).send({ message: error.message });
    }
}


exports.updateJobById  = async (req, res, next) => {
    const jobId = req.params.jobId;
    try {
        if(!mongoose.Types.ObjectId.isValid(jobId)) {
            return res.status(200).send({ message: "Unknown job parameter"});
        }
        const job = await JobModel.findByIdAndUpdate({_id: jobId}, {$set: req.body}, {new: true});
        if(!job) {
            return res.status(200).send({ message: "Unable to update job"});
        }
        return res.status(200).send({ message: "Job updated successfully"});
    } catch (error) {
        return res.status(500).send({ message: error.message });
    }
}

exports.deleteJobById  = async (req, res, next) => {
    const jobId = req.params.jobId;
    try {
        if(!mongoose.Types.ObjectId.isValid(jobId)) {
            return res.status(200).send({ message: "Unknown job parameter"});
        }
        const job = await JobModel.findByIdAndDelete({_id: jobId});
        if(!job) {
            return res.status(200).send({ message: "No job found"});
        }
        return res.status(200).send({ message: "Job deleted successfully"});
    } catch (error) {
        return res.status(500).send({ message: error.message });
    }
}
