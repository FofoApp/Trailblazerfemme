    const express = require('express');
    const router = express.Router();

    const BlogController = require('./../controllers/blogController/BlogController');
    const BlogCategoryController = require('./../controllers/blogController/BlogCategoryController');
    const { verifyAccessToken } = require('./../helpers/jwtHelper');
    const { permissions } = require('./../middlewares/permissionsMiddleware');
    //BLOG ROUTES
    
    router.get('/', verifyAccessToken, BlogController.blog);
    router.post('/create', verifyAccessToken, permissions(["admin"]),  BlogController.createNewBlog);
    router.get('/lists', verifyAccessToken, BlogController.FetchBlogs);
    router.get('/:blogId/show', verifyAccessToken, verifyAccessToken, BlogController.FetchBlogById);
    router.put('/:blogId/update', verifyAccessToken, permissions(["admin"]),  BlogController.updateBlogById);
    router.delete('/:blogId/like', verifyAccessToken, BlogController.blogLikes);
    router.delete('/:blogId/delete', verifyAccessToken, BlogController.deleteBlogById);



    //BLOG CATEGORY ROUTES
    router.get('/categories', verifyAccessToken, BlogCategoryController.FetchBlogCategories);
    router.get('/:blogCategoryId/show', verifyAccessToken, BlogCategoryController.FetchBlogCategoryById);
    router.post('/category/create', verifyAccessToken,  BlogCategoryController.createNewBlogCategory);
    router.put('/category/:blogCategoryId/update', verifyAccessToken, permissions(["admin"]),  BlogCategoryController.updateBlogCategoryById);
    router.delete('/category/:blogCategoryId/delete', verifyAccessToken, permissions(["admin"]), BlogCategoryController.deleteBlogCategoryById);



    module.exports = router;