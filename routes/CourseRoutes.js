const express = require('express');
const router = express.Router();


const CourseController = require('./../controllers/courseController/CourseController');
const CourseCategoryController = require('./../controllers/courseController/CourseCategoryController');
const courseReview = require('./../controllers/courseController/CourseReviewController');

const upload = require('./../helpers/multer');

const { verifyAccessToken } = require('./../helpers/jwtHelper');

//COURSES
// router.post('/create', verifyAccessToken, upload.fields([{ name: 'courseImage', maxCount: 1 }, {name: 'authorImage', maxCount: 5 }] ), CourseController.createNewCourse);
router.post('/create',  upload.fields([{ name: 'courseImage', maxCount: 1 }, {name: 'author_image', maxCount: 5 }] ), CourseController.createNewCourse);
router.get('/list',  CourseController.findAllCourses);
router.get('/:courseId/get',  CourseController.findCourseById);



//COURSE CATEGORIES

router.post('/category/create',  CourseCategoryController.createCategory);
router.get('/category/list',  CourseCategoryController.findAllCategories);
router.get('/category/:categoryId/get',  CourseCategoryController.findCategoryById);
router.patch('/category/:categoryId/update',  CourseCategoryController.updateCategoryById);
router.delete('/category/:categoryId/delete',  CourseCategoryController.deleteCategoryById);


//COURSE REVIEWS

router.post('/:courseId/create_review', verifyAccessToken, courseReview.createCourseReview);
router.get('/review/:reviewId',  courseReview.findByReviewById);
router.delete('/:courseId/review/:reviewId/delete',  courseReview.deleteReviewById);







module.exports = router;