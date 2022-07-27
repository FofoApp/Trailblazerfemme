const mongoose = require('mongoose');
const fs = require('fs');

const JobModel = require('./../../models/jobModel/JobModel')
const JobCategoryModel = require('./../../models/jobModel/JobCategory');
const JobApplicationModel = require('./../../models/jobModel/JobApplicationModel');
const { jobApplicationValidation } = require('./../../validations/jobValidation');
const { cloudinary } = require('./../../helpers/cloudinary')

exports.jobs = async (req, res, next) => {
     
    //GET REQUEST
    //http://localhost:2000/api/jobs  
    try {
        let jobCategories = [];
        let jobs = [];

        jobCategories = await JobCategoryModel.find({});
        jobs = await JobModel.find({});

        return res.status(200).send({jobCategories, jobs});
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
    const jobId = req.params.jobId;
   

    try {
        if(!mongoose.Types.ObjectId.isValid(currenUser)) {
            return res.status(200).send({message: "User info not valid"}); 
        }
        if(!mongoose.Types.ObjectId.isValid(jobId)) {
            return res.status(200).send({message: "Job info not valid"}); 
        }

        const result = await jobApplicationValidation(req.body);

        const checkIfUserAlreadyAppliedForSameJob = await JobApplicationModel.findOne({userId: currenUser, jobId: jobId });
        
        if(checkIfUserAlreadyAppliedForSameJob) {
            return res.status(200).send({message: "You already applied for this job"});
        }



        const applyForJob = new JobApplicationModel({...result, jobId, userId: currenUser });

        const applied = await applyForJob.save();

        return res.status(200).send({message: "User data saved, kindly upload your resumee and cover letter"});

    } catch (error) {
        return res.status(500).send({ message: error.message });
    }
}

exports.uploadCoverLetterAndResumee = async (req, res, next) => {
    //POST REQUEST
    //http://localhost:2000/api/jobs/jobId/application/upload
    //http://localhost:2000/api/jobs/62902e117ecadf9305054e1a/application/upload
    //ACCEPTED FORMAT .docx, .pdf, .doc
    const currenUser = req.user.id;
    const jobId = req.params.jobId;
    const urls = [];
    let publicIdArray = [];

    try {
        if(!mongoose.Types.ObjectId.isValid(currenUser)) {
            return res.status(200).send({message: "User info not valid"}); 
        }
        if(!mongoose.Types.ObjectId.isValid(jobId)) {
            return res.status(200).send({message: "Job info not valid"}); 
        }

        const checkIfUserAlreadyAppliedForSameJob = await JobApplicationModel.findOne({userId: currenUser, jobId: jobId });
        
        if(!checkIfUserAlreadyAppliedForSameJob) {
            return res.status(200).send({message: "You have not applied for this job"}); 
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
                    return res.status(404).send({ message: "Unable to upload document please try again"});
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
        
            return res.status(200).send({message: "Documents uploaded successfully"});

    } catch (error) {
        return res.status(500).send({ message: error.message });
    }
}
exports.updateCoverLetterAndResumee = async (req, res, next) => {
    //PATCH REQUEST
    //http://localhost:2000/api/jobs/JOBiD/update
    //http://localhost:2000/api/jobs/62902e117ecadf9305054e1a/application/update
    //ACCEPTED FORMAT .docx, .pdf, .doc
    const currenUser = req.user.id;
    const jobId = req.params.jobId;
    const uploadData = {};
    try {
        if(!mongoose.Types.ObjectId.isValid(currenUser)) {
            return res.status(200).send({message: "User info not valid"}); 
        }
        if(!mongoose.Types.ObjectId.isValid(jobId)) {
            return res.status(200).send({message: "Job info not valid"}); 
        }

        const checkIfUserAlreadyAppliedForSameJob = await JobApplicationModel.findOne({userId: currenUser, jobId: jobId });
        
        if(!checkIfUserAlreadyAppliedForSameJob) {
            return res.status(200).send({message: "You have not applied for this job"}); 
        }

        //Upload Image to cloudinary
        //DELETE FILE FROM CLOUDINARY IF EXIST
        if(req?.file?.resumee) {
            let uploaderResponse = await cloudinary.uploader.destroy(checkIfUserAlreadyAppliedForSameJob.resumeePublicId);        
            if(!uploaderResponse) {
                //Reject if unable to upload image
                return res.status(404).send({ message: "Unable to delete profile image please try again"});
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
                return res.status(404).send({ message: "Unable to delete profile image please try again"});
            }
            //Upload Image to cloudinary
            uploaderResponse = await cloudinary.uploader.upload(req.file.path);
            uploadData[coverLetterPublicId] =  uploaderResponse.public_id;
            uploadData[coverLetter] = uploaderResponse.secure_url;
        }

        // const result = await jobApplicationValidation(req.body);

        const updateApplication = await JobApplicationModel.updateOne({userId: currenUser, jobId: jobId},
            {   $set:  uploadData}, {new: true});
        
        return res.status(200).send({message: "Documents updated successfully"});

    } catch (error) {
        return res.status(500).send({ message: error.message });
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
    const jobId = req.params.jobId;

    try {
        if(!mongoose.Types.ObjectId.isValid(currenUser)) {
            return res.status(200).send({message: "User info not valid"}); 
        }
        if(!mongoose.Types.ObjectId.isValid(jobId)) {
            return res.status(200).send({message: "Job info not valid"}); 
        }

        const result = await jobApplicationValidation(req.body, true);

        const checkIfUserAlreadyAppliedForSameJob = await JobApplicationModel.findOne({userId: currenUser, jobId: jobId });
        
        if(!checkIfUserAlreadyAppliedForSameJob) {
            return res.status(200).send({message: "You have not applied for this job"}); 
        }

        const updateApplication = await JobApplicationModel.updateOne({userId: currenUser, jobId: jobId}, {$set: result}, {new: true});

        return res.status(200).send({message: "User data saved successfully"});

    } catch (error) {
        return res.status(500).send({ message: error.message });
    }
}


exports.createNewJob = async (req, res, next) => {
    /**
     * POST REQUEST
     * http://localhost:2000/api/jobs/create
     * {
        "title": "Job one",
        "company_name": "Ricz Tech",
        "image": "Images",
        "description": "decription",
        "position": "Developer",
        "qualification": "Any",
        "categoryId": "628d56c755040aa7fb78d8cd",
        "userId": "628695d03cf50a6e1a34e27b"
        }
     */

    try {
        const createNewJob = new JobModel(req.body);
        const createdJob = await createNewJob.save();
        if(!createdJob) {
            return res.status(401).send({ message: "Unable to create new job"});
        }
        return res.status(401).send(createdJob);
    } catch (error) {
        return res.status(500).send({ message: error.message });
    }
}


exports.listJobs = async (req, res, next) => {
    //GET REQUEST
    //http://localhost:2000/api/jobs/lists
    
    try {
        const jobs = await JobModel.find({});
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
