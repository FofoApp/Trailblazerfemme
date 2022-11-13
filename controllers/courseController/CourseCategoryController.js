const CourseCategoryModel = require('../../models/courseModel/CourseCategoryModel');



exports.createCategory = async (req, res) => {
    const { name } = req.body;

    try {
        const category = await CourseCategoryModel.findOne({ name });

        if(category) return res.status(400).json({ error: "Category name already exist" });

        const new_category = await CourseCategoryModel.create({ name });

        return res.status(201).json({ message: "Category successfully created"});

    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}

exports.findAllCategories = async (req, res) => {

    try {
        const categories = await CourseCategoryModel.find({}).select("-__v -courses -updatedAt");

        if(!categories || categories.length === 0) return res.status(400).json({ error: "Category not found" });

        return res.status(201).json({categories });

    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}

exports.findCategoryById = async (req, res) => {
    const { categoryId } = req.params;

    try {

        const category = await CourseCategoryModel.findById(categoryId).select("-__v -courses -updatedAt");

        if(!category) return res.status(400).json({ error: "Category not found" });

        return res.status(200).json({ category });

    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}

exports.updateCategoryById = async (req, res) => {
    const { categoryId } = req.params;
    const { name } = req.body;

    try {

        const category = await CourseCategoryModel.findByIdAndUpdate(categoryId, { $set: { name }}, { new: true });

        if(!category) return res.status(400).json({ error: "Category name aleady exist" });

        return res.status(201).json({ message: "Category deleted successfully" });

    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}

exports.deleteCategoryById = async (req, res) => {
    const { categoryId } = req.params;

    try {

        const category = await CourseCategoryModel.findByIdAndDelete(categoryId);

        if(!category) return res.status(400).json({ error: "Category name aleady exist" });

        return res.status(201).json({ message: "Category deleted successfully" });

    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}