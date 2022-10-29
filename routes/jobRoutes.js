const express = require('express');
const router = express.Router();

const { verifyAccessToken } = require('./../helpers/jwtHelper');

const { permissions } = require('./../middlewares/permissionsMiddleware');

const JobController = require('./../controllers/jobController/JobController');

const AdminJobController = require('./../controllers/adminController/AdminJobController');

const JobCategoryController = require('./../controllers/jobController/JobCategoryController');
const upload = require('./../helpers/multer');
const uploadCv = require('./../helpers/multerCVupload');


//JOB ROUTES
router.get('/alljobs', JobController.jobs);
router.get('/lists', JobController.listJobs);
router.post('/:jobId/apply', verifyAccessToken, permissions(["user", "admin"]), JobController.jobApplication);
router.post('/:jobId/application/upload', verifyAccessToken, permissions(["user", "admin"]), uploadCv.array('doc_uploads'), JobController.uploadCoverLetterAndResumee);
router.post('/:jobId/application/update', verifyAccessToken, permissions(["user", "admin"]), uploadCv.array('doc_uploads'), JobController.updateCoverLetterAndResumee);


//ADMIN JOB ROUTES
// router.get('/',  verifyAccessToken, permissions(["admin"]), AdminJobController.jobs);
router.patch('/:jobId/update',  verifyAccessToken, permissions(["admin"]), upload.single('jobImage'), AdminJobController.updateJobById);
router.post('/create',  verifyAccessToken, permissions(["admin"]), upload.single('jobImage'),  AdminJobController.createNewJob);
router.get('/:jobId/get', verifyAccessToken, permissions(["user", "admin"]), AdminJobController.findJobById);
router.get('/:jobId/list', verifyAccessToken, permissions(["admin"]), AdminJobController.listJobs);
router.delete('/:jobId/delete', verifyAccessToken, permissions(["admin"]), AdminJobController.deleteJobById);


// router.post('/create', JobController.createNewJob);
// router.get('/:jobId/get', JobController.findJobById);

router.patch('/:jobId/application/update', verifyAccessToken, permissions(["user", "admin"]), JobController.updateJobApplication);
router.delete('/:jobId/delete', verifyAccessToken, permissions(["admin"]), JobController.deleteJobById);



//JOB CATEGORY ROUTES
router.get('/categories', verifyAccessToken, permissions(["user", "admin"]), JobCategoryController.listJobCategories);
router.post('/category/create', verifyAccessToken, permissions(["admin"]), JobCategoryController.createNewJobCategory);
router.get('/category/:jobCategoryId/get', verifyAccessToken, permissions(["user", "admin"]), JobCategoryController.findJobCategoryById);
router.delete('/category/:jobCategoryId/delete', verifyAccessToken, permissions(["admin"]), JobCategoryController.deleteJobCategoryById);
router.patch('/category/:jobCategoryId/update', verifyAccessToken, permissions(["admin"]), JobCategoryController.updateJobCategoryById);

module.exports = router;