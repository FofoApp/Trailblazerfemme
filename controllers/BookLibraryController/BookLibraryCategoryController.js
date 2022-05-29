const mongoose = require('mongoose');
const BookCategoryModel = require('./../../models/bookLibraryModel/BookCategoryModel');


const createNewBookCategory = async (req, res, next) => {
 //Notes:: REMEMBER TO VALIDATE USER INPUTS
    try {
        const categoryExist = await BookCategoryModel.findOne({ title: req.body.title });

        if(categoryExist) {

            return res.status(200).send({ message: "Category name already exist"});
        }
        const createNewCategory =  new BookCategoryModel(req.body);

        const createdCategory = await createNewCategory.save();

        return res.status(200).send({ message: "Category created successfully", category: createdCategory });

    } catch (error) {
        return res.status(500).send(error.message);
    }
}

const fetchBookCategories = async (req, res, next) => {
    try {
        const categories = await BookCategoryModel.find({});

        if(!categories) {
            return res.status(404).send({ message: "Category not found"});
        }
        return res.status(200).send({ message: "Categories found", categories });
    } catch (error) {
        return res.status(500).send(error.message);
    }
}


const fetchBookCategoryById = async (req, res, next) => {
    try {
        const categoryId = req.params.id;
        if(!mongoose.Types.ObjectId.isValid(categoryId)) {

            return res.status(404).send({ message: "Invalid category"});
        }
        const category = await BookCategoryModel.findById(categoryId);

        if(!category) {
            return res.status(404).send({ message: "Category not found"});
        }
        return res.status(200).send({ message: "Categories found", category });
    } catch (error) {
        return res.status(500).send(error.message);
    }
}


const updateBookCategoryById = async (req, res, next) => {
    try {
        const categoryId = req.params.id;
        if(!mongoose.Types.ObjectId.isValid(categoryId)) {
            
            return res.status(404).send({ message: "Invalid category"});
        }
        const category = await BookCategoryModel.findById(categoryId);

        if(!category) {
            return res.status(404).send({ message: "Category not found"});
        }
         await BookCategoryModel.updateOne({ _id: categoryId }, {$set: { ...req.body } })
        
        return res.status(200).send({ message: "Category updated successfully" });
    } catch (error) {
        return res.status(500).send(error.message);
    }
}


const deleteBookCategoryById = async (req, res, next) => {
    try {
        const categoryId = req.params.id;
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
        return res.status(500).send(error.message);
    }
}






module.exports = {
    createNewBookCategory,
    fetchBookCategories,
    fetchBookCategoryById,
    updateBookCategoryById,
    deleteBookCategoryById
}