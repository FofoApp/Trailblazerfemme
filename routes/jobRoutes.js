const express = require('express');
const router = express.Router();

const { verifyAccessToken } = require('./../helpers/jwtHelper');
const JobController = require('./../controllers/jobController/JobController');
const JobCategoryController = require('./../controllers/jobController/JobCategoryController');
const upload = require('./../helpers/multer');
const uploadCv = require('./../helpers/multerCVupload');


//JOB ROUTES
router.get('/', JobController.jobs);
router.get('/lists', JobController.listJobs);
router.post('/:jobId/apply', verifyAccessToken, JobController.jobApplication);
router.post('/:jobId/application/upload', verifyAccessToken, uploadCv.array('doc_uploads'), JobController.uploadCoverLetterAndResumee);
router.post('/:jobId/application/update', verifyAccessToken, uploadCv.array('doc_uploads'), JobController.updateCoverLetterAndResumee);

router.post('/create', JobController.createNewJob);
router.get('/:jobId/get', JobController.findJobById);

router.patch('/:jobId/application/update', verifyAccessToken, JobController.updateJobApplication);
router.delete('/:jobId/delete', verifyAccessToken, JobController.deleteJobById);



//JOB CATEGORY ROUTES
router.get('/categories', JobCategoryController.listJobCategories);
router.post('/category/create', JobCategoryController.createNewJobCategory);
router.get('/category/:jobCategoryId/get', JobCategoryController.findJobCategoryById);
router.delete('/category/:jobCategoryId/delete', JobCategoryController.deleteJobCategoryById);
router.patch('/category/:jobCategoryId/update', JobCategoryController.updateJobCategoryById);

module.exports = router;