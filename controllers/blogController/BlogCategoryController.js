const BlogCategoryModel = require('../../models/blogModel/BlogCategoryModel');


exports.createNewBlogCategory = async (req, res, next) => {
    // NOTE::::: REMEMBER TO VALIDATE YOUR REQUEST INPUT(S) BEFORE SAVING TO DB
    
    try {
        const findBlogCategoryExist = await BlogCategoryModel.findOne({ name: req.body.name });

        if(findBlogCategoryExist) {
            return res.status(401).send({ message: `Blog name ${req.body.name } already exists` });
        }

        const createNewBlogCategory = new BlogCategoryModel(req.body.name);
        const blogCategoryData = await createNewBlogCategory.save();

        return res.status(200).send({ message: "Create new Blog", blogCategoryData });
    } catch (error) {
        console.log(error)
        return res.status(500).send({ message: error.message })
    }
}


exports.FetchBlogCategories = async (req, res, next) => {
    // NOTE::::: REMEMBER TO VALIDATE YOUR REQUEST INPUT(S) BEFORE SAVING TO DB
    try {
        const findBlogCategoryExist = await BlogCategoryModel.find({});

        return res.status(200).send({ blogs: findBlogCategoryExist });
    } catch (error) {
        return res.status(500).send({ error: error.message })
    }
}


exports.FetchBlogCategoryById = async (req, res, next) => {
    // NOTE::::: REMEMBER TO VALIDATE YOUR REQUEST INPUT(S) BEFORE SAVING TO DB
    try {
        const findBlogCategoryExist = await BlogCategoryModel.findById(req.params.blogCategoryId);

        if(!findBlogCategoryExist) {
            return res.status(401).send({ message: "Blog Category not found" });
        }

        return res.status(200).send({ message: "Blog Category", blogCategoryData: findBlogCategoryExist });
    } catch (error) {
        return res.status(500).send({ error: error.message })
    }
}




exports.updateBlogCategoryById = async (req, res, next) => {
    // NOTE::::: REMEMBER TO VALIDATE YOUR REQUEST INPUT(S) BEFORE SAVING TO DB
    try {
        const findBlogCategoryExist = await BlogCategoryModel.findById(req.params.blogCategoryId);

        if(!findBlogCategoryExist) {
            return res.status(401).send({ message: "Blog Category not found" });
        }
        const updateBlogCategory = await BlogCategoryModel.updateOne({ _id: req.params.blogCategoryId }, { $set: req.body.name }, { new: true });
        return res.status(200).send({ message: "Blog Category updated successfully"});
    } catch (error) {
        return res.status(500).send({ message: error.message })
    }
}



exports.deleteBlogCategoryById = async (req, res, next) => {
    // NOTE::::: REMEMBER TO VALIDATE YOUR REQUEST INPUT(S) BEFORE SAVING TO DB
    try {
        const findBlogCategoryExist = await BlogCategoryModel.findById(req.params.blogCategoryId);

        if(!findBlogCategoryExist) {
            return res.status(401).send({ message: "Blog Category not found" });
        }
             await BlogCategoryModel.findByIdAndDelete(req.params.blogCategoryId);
            return res.status(200).send({ message: "Blog Category deleted successfully" });
    } catch (error) {
        return res.status(500).send({ error: error.message })
    }
}
