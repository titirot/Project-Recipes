const Category = require('../models/Category');

const getAllCategories = async (req, res) => {
    try {
        const categories = await Category.find();
        return res.status(200).json(categories);
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
};

const getAllCategoriesWithRecipes = async (req, res) => {
    try {
        const categories = await Category.find().populate('recipes');
        return res.status(200).json(categories);
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
};

const getCategoryByCodeOrNameWithRecipes = async (req, res) => {
    const { value } = req.params;

    try {
        const category = await Category.findOne({
            $or: [{ code: value.toUpperCase() }, { description: { $regex: `^${value}$`, $options: 'i' } }]
        }).populate('recipes');
        if (!category) {
            return res.status(404).json({ message: 'Category not found' });
        }
        return res.status(200).json(category);
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
};

module.exports = {
    getAllCategories,
    getAllCategoriesWithRecipes,
    getCategoryByCodeOrNameWithRecipes
};
