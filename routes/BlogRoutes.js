    const express = require('express');
    const router = express.Router();

    const BlogController = require('./../controllers/blogController/BlogController');
    const BlogCommentController = require('./../controllers/blogController/BlogCommentController');
    const BlogCategoryController = require('./../controllers/blogController/BlogCategoryController');
    const { verifyAccessToken } = require('./../helpers/jwtHelper');
    const { permissions } = require('./../middlewares/permissionsMiddleware');

    const upload = require('./../helpers/multer');

    //BLOG ROUTES
    
    router.get('/', verifyAccessToken, BlogController.blog);
    // router.get('/:blogId/details', verifyAccessToken, BlogController.getSpecificBlogAndItsComments);
    const blogImageFields = [{name: 'blogImages', maxCount: 2 }, {name: 'authorImages', maxCount: 1},]
    router.post('/create', verifyAccessToken, permissions(["admin"]), upload.fields(blogImageFields),  BlogController.createNewBlog);
    router.get('/lists', verifyAccessToken, BlogController.FetchBlogs);
    router.post('/search', verifyAccessToken, BlogController.searchBlogByTitleOrAuthorName);
    router.get('/:blogId/show', verifyAccessToken, BlogController.FetchBlogById);
    router.patch('/:blogId/update', verifyAccessToken, permissions(["admin"]),  upload.single('blogImage'), BlogController.updateBlogById);
    
    //COMMENT AND DELETE COMMENT
    router.get('/:blogId/comments', verifyAccessToken, BlogController.listBlogComment);
    router.post('/:blogId/comment/create', verifyAccessToken, BlogController.blogComment);
    // router.patch('/:blogId/comment', verifyAccessToken, BlogController.blogComment);
    router.patch('/:blogId/delete-blog-comment', verifyAccessToken, permissions(["admin"]),  BlogController.deleteBlogComment);
    router.patch('/:blogId/update/:commentId', verifyAccessToken, permissions(["admin"]),  BlogCommentController.updateBlogCommentById);
    router.delete('/:blogId/delete/:commentId', verifyAccessToken, permissions(["admin"]),  BlogCommentController.deleteBlogCommentById);

    //LIKE AND DISLIKE
    router.patch('/:blogId/like', verifyAccessToken, BlogController.blogLikes);

    //DELETE 
    router.delete('/:blogId/delete', verifyAccessToken,  permissions(["admin"]), BlogController.deleteBlogById);

    //BLOG CATEGORY ROUTES
    router.get('/categories', verifyAccessToken, BlogCategoryController.FetchBlogCategories);
    router.get('/category/:blogCategoryId/show', verifyAccessToken, BlogCategoryController.FetchBlogCategoryById);
    router.post('/category/create', verifyAccessToken,  BlogCategoryController.createNewBlogCategory);
    router.patch('/category/:blogCategoryId/update', verifyAccessToken, permissions(["admin"]),  BlogCategoryController.updateBlogCategoryById);
    router.delete('/category/:blogCategoryId/delete', verifyAccessToken, permissions(["admin"]), BlogCategoryController.deleteBlogCategoryById);

    module.exports = router;