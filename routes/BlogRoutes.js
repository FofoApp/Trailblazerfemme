    const express = require('express');
    const router = express.Router();

    const BlogController = require('./../controllers/blogController/BlogController');
    const BlogCategoryController = require('./../controllers/blogController/BlogCategoryController');
    const { verifyAccessToken } = require('./../helpers/jwtHelper');
    const { permissions } = require('./../middlewares/permissionsMiddleware');

    const upload = require('./../helpers/multer');

    //BLOG ROUTES
    
    router.get('/', verifyAccessToken, BlogController.blog);
    // router.get('/:blogId/details', verifyAccessToken, BlogController.getSpecificBlogAndItsComments);
    router.post('/create', verifyAccessToken, permissions(["admin"]), upload.single('blogImage'),  BlogController.createNewBlog);
    router.get('/lists', verifyAccessToken, BlogController.FetchBlogs);
    router.get('/:blogId/show', verifyAccessToken, BlogController.FetchBlogById);
    router.patch('/:blogId/update', verifyAccessToken, permissions(["admin"]),  upload.single('blogImage'), BlogController.updateBlogById);
    
    //COMMENT AND DELETE COMMENT
    router.get('/:blogId/comments', verifyAccessToken, BlogController.listBlogComment);
    router.post('/:blogId/comment/create', verifyAccessToken, BlogController.blogComment);
    // router.patch('/:blogId/comment', verifyAccessToken, BlogController.blogComment);
    router.patch('/:blogId/delete-blog-comment', verifyAccessToken, permissions(["admin"]),  BlogController.deleteBlogComment);

    //LIKE AND DISLIKE
    router.patch('/:blogId/like', verifyAccessToken, BlogController.blogLikes);

    //DELETE 
    router.delete('/:blogId/delete', verifyAccessToken, BlogController.deleteBlogById);



    //BLOG CATEGORY ROUTES
    router.get('/categories', verifyAccessToken, BlogCategoryController.FetchBlogCategories);
    router.get('/category/:blogCategoryId/show', verifyAccessToken, BlogCategoryController.FetchBlogCategoryById);
    router.post('/category/create', verifyAccessToken,  BlogCategoryController.createNewBlogCategory);
    router.patch('/category/:blogCategoryId/update', verifyAccessToken, permissions(["admin"]),  BlogCategoryController.updateBlogCategoryById);
    router.delete('/category/:blogCategoryId/delete', verifyAccessToken, permissions(["admin"]), BlogCategoryController.deleteBlogCategoryById);



    module.exports = router;