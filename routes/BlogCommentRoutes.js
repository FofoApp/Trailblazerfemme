const express = require('express');
const router = express.Router();

const BlogCommentController = require('./../controllers/blogController/BlogCommentController');
const { verifyAccessToken } = require('./../helpers/jwtHelper');


//List all blog comments
router.get('/:blogId/comments', BlogCommentController.FetchBlogComments);

//Create new blog comment
router.post('/:blogId/comment/create', verifyAccessToken, BlogCommentController.createNewBlogComment);


//Get Blog comment by ID 
router.get('/:blogId/comment', BlogCommentController.FetchBlogCommentById);

//Update Blog comment by ID 
router.put('/:blogId/update', BlogCommentController.updateBlogCommentById);

//Delete Blog comment by ID 
router.delete('/:blogId/delete', BlogCommentController.deleteBlogCommentById);


module.exports = router;