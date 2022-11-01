const mongoose = require('mongoose');
const BookCategoryModel = require('./../../models/bookLibraryModel/BookCategoryModel');


exports.createNewBookCategory = async (req, res, next) => {
 //Notes:: REMEMBER TO VALIDATE USER INPUTS
    const { name } = req.body;

    try {

        const categoryExist = await BookCategoryModel.findOne({ name });

        if(categoryExist) {

            return res.status(200).send({ message: "Category name already exist"});
        }
        const createNewCategory =  new BookCategoryModel({ name });

        const createdCategory = await createNewCategory.save();

        return res.status(200).send({ message: "Category created successfully", category: createdCategory });

    } catch (error) {
        return res.status(500).send({ error: error.message});
    }
}

exports.fetchBookCategories = async (req, res, next) => {
    try {
        const categories = await BookCategoryModel.find({});

        if(!categories) {
            return res.status(404).send({ message: "No category found"});
        }
        return res.status(200).send({ message: "Categories found", categories });
    } catch (error) {
        return res.status(500).send({ error: error.message});
    }
}


exports.fetchBookCategoryById = async (req, res, next) => {
    try {
        const categoryId = req.params.categoryId;
        if(!mongoose.Types.ObjectId.isValid(categoryId)) {

            return res.status(404).send({ message: "Invalid category"});
        }
        const category = await BookCategoryModel.findById(categoryId);

        if(!category) {
            return res.status(404).send({ message: "Category not found"});
        }
        return res.status(200).send({ message: "Categories found", category });
    } catch (error) {
        return res.status(500).send({ error: error.message});
    }
}


exports.updateBookCategoryById = async (req, res, next) => {
    try {

        const categoryId = req.params.categoryId;

        if(!mongoose.Types.ObjectId.isValid(categoryId)) {
            
            return res.status(404).send({ message: "Invalid category"});
        }

        const category = await BookCategoryModel.findById(categoryId);

        if(!category) {
            return res.status(404).send({ message: "Category not found"});
        }

        await BookCategoryModel.updateOne({ _id: categoryId }, {$set: { ...req.body } });
        
        return res.status(200).send({ message: "Category updated successfully" });

    } catch (error) {
        return res.status(500).send({ error: error.message});
    }
}


exports.deleteBookCategoryById = async (req, res, next) => {
    try {
        const categoryId = req.params.categoryId;
        if(!mongoose.Types.ObjectId.isValid(categoryId)) {
            
            return res.status(404).send({ message: "Invalid category"});
        }
        const category = await BookCategoryModel.findById(categoryId);

        if(!category) {
            return res.status(404).send({ message: "Category not found"});
        }
         await BookCategoryModel.deleteOne({ _id: categoryId });
        
        return res.status(200).send({ message: "Category deleted successfully" });
    } catch (error) {
        return res.status(500).send({error: error.message});
    }
}
