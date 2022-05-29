const express = require('express');

const router = express.Router();

const PostController = require('./../controllers/postController/PostController');
const PostCommentController = require('./../controllers/postController/PostCommentController');

const { verifyAccessToken } = require('./../helpers/jwtHelper');
const upload = require('./../helpers/multer');


    router.post('/:communityId/create', verifyAccessToken, upload.single('postImage'), PostController.createNewPost);
    router.patch('/:postId/comment', verifyAccessToken, PostCommentController.comment);
    router.get('/lists', PostController.listPosts);
    router.get('/:postId/get', PostController.findPostById);
    router.patch('/:postId/update', PostController.updatePostById);
    router.delete('/:postId/delete', PostController.deletePostById);


module.exports = router;