const mongoose = require('mongoose');
const Joi = require('joi');
const Recipe = require('../models/Recipe');
const Category = require('../models/Category');
const recipeValidator = require('../validations/recipeValidation');
const objectIdRule = Joi.string().hex().length(24);
const getRequesterId = (req) => req.user?.id;

const recipeUpdateValidator = (data) => {
    const schema = Joi.object({
        code: Joi.number().integer().positive(),
        name: Joi.string().min(2),
        description: Joi.string(),
        categories: Joi.array().items(objectIdRule),
        preparationTime: Joi.number().min(1),
        level: Joi.number().min(1).max(5),
        layers: Joi.array().items(
            Joi.object({
                description: Joi.string().required(),
                ingredients: Joi.array().items(Joi.string()).required()
            })
        ),
        instructions: Joi.array().items(Joi.string()),
        image: Joi.string(),
        isPrivate: Joi.boolean(),
        owner: objectIdRule
    }).min(1);

    return schema.validate(data);
};

const addRecipe = async (req, res) => {
    const { error } = recipeValidator(req.body);

    if (error) {
        return res.status(400).json({ message: error.details[0].message });
    }

    try {
        const ownerId = getRequesterId(req);
        if (!ownerId || !mongoose.Types.ObjectId.isValid(ownerId)) {
            return res.status(401).json({ message: 'Valid user token is required' });
        }

        const categoryIds = [...new Set((req.body.categories || []).map((id) => id.toString()))];
        if (categoryIds.length > 0) {
            const existingCategoriesCount = await Category.countDocuments({
                _id: { $in: categoryIds }
            });
            if (existingCategoriesCount !== categoryIds.length) {
                return res.status(404).json({ message: 'One or more categories were not found' });
            }
        }

        const recipe = new Recipe({ ...req.body, owner: ownerId });
        const savedRecipe = await recipe.save();

        if (categoryIds.length > 0) {
            await Category.updateMany(
                { _id: { $in: categoryIds } },
                {
                    $addToSet: { recipes: savedRecipe._id },
                    $inc: { recipeCount: 1 }
                }
            );
        }

        return res.status(201).json(savedRecipe);
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
};

const getAllRecipes = async (req, res) => {
    try {
        const requesterId = getRequesterId(req);
        const search = (req.query.search || '').trim();
        const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
        const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 10, 1), 100);
        const skip = (page - 1) * limit;

        const accessFilter =
            requesterId && mongoose.Types.ObjectId.isValid(requesterId)
                ? { $or: [{ isPrivate: false }, { owner: requesterId }] }
                : { isPrivate: false };

        const searchFilter = search
            ? {
                $or: [
                    { name: { $regex: search, $options: 'i' } },
                    { description: { $regex: search, $options: 'i' } },
                    { instructions: { $elemMatch: { $regex: search, $options: 'i' } } }
                ]
            }
            : {};

        const filter = { ...accessFilter, ...searchFilter };

        const [recipes, total] = await Promise.all([
            Recipe.find(filter)
                .populate('categories')
                .populate('owner')
                .sort({ addDate: -1 })
                .skip(skip)
                .limit(limit),
            Recipe.countDocuments(filter)
        ]);

        return res.status(200).json({
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
            items: recipes
        });
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
};

const getRecipeByCode = async (req, res) => {
    const { code } = req.params;
    try {
        const recipe = await Recipe.findOne({ code: Number(code) }).populate('categories').populate('owner');

        if (!recipe) {
            return res.status(404).json({ message: 'Recipe not found' });
        }

        const requesterId = getRequesterId(req);
        const canAccessPrivateRecipe =
            !recipe.isPrivate ||
            (requesterId &&
                mongoose.Types.ObjectId.isValid(requesterId) &&
                recipe.owner &&
                recipe.owner._id.toString() === requesterId.toString());

        if (!canAccessPrivateRecipe) {
            return res.status(403).json({ message: 'This private recipe is not accessible' });
        }

        return res.status(200).json(recipe);
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
};

const getRecipesByMaxPreparationTime = async (req, res) => {
    const maxMinutes = Number(req.query.maxMinutes);
    if (!Number.isFinite(maxMinutes) || maxMinutes <= 0) {
        return res.status(400).json({ message: 'maxMinutes query parameter must be a positive number' });
    }

    try {
        const requesterId = getRequesterId(req);
        const accessFilter =
            requesterId && mongoose.Types.ObjectId.isValid(requesterId)
                ? { $or: [{ isPrivate: false }, { owner: requesterId }] }
                : { isPrivate: false };
        const recipes = await Recipe.find({
            ...accessFilter,
            preparationTime: { $lte: maxMinutes }
        })
            .populate('categories')
            .populate('owner')
            .sort({ preparationTime: 1 });
        return res.status(200).json(recipes);
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
};

const updateRecipe = async (req, res) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ message: 'Invalid recipe id' });
    }

    const { error } = recipeUpdateValidator(req.body);
    if (error) {
        return res.status(400).json({ message: error.details[0].message });
    }

    try {
        const existingRecipe = await Recipe.findById(id);
        if (!existingRecipe) {
            return res.status(404).json({ message: 'Recipe not found' });
        }

        const requesterId = getRequesterId(req);
        const isAdmin = req.user?.role === 'admin';
        if (!requesterId || (!isAdmin && existingRecipe.owner.toString() !== requesterId.toString())) {
            return res.status(403).json({ message: 'You can update only your own recipes' });
        }

        const nextCategoryIds = [...new Set((req.body.categories || existingRecipe.categories || []).map(String))];
        if (nextCategoryIds.length > 0) {
            const existingCategoriesCount = await Category.countDocuments({ _id: { $in: nextCategoryIds } });
            if (existingCategoriesCount !== nextCategoryIds.length) {
                return res.status(404).json({ message: 'One or more categories were not found' });
            }
        }

        const previousCategoryIds = (existingRecipe.categories || []).map(String);
        const toAdd = nextCategoryIds.filter((idValue) => !previousCategoryIds.includes(idValue));
        const toRemove = previousCategoryIds.filter((idValue) => !nextCategoryIds.includes(idValue));

        const updatedRecipe = await Recipe.findByIdAndUpdate(
            id,
            { ...req.body, owner: existingRecipe.owner },
            { new: true, runValidators: true }
        );

        if (toAdd.length > 0) {
            await Category.updateMany(
                { _id: { $in: toAdd } },
                { $addToSet: { recipes: updatedRecipe._id }, $inc: { recipeCount: 1 } }
            );
        }
        if (toRemove.length > 0) {
            await Category.updateMany(
                { _id: { $in: toRemove } },
                { $pull: { recipes: updatedRecipe._id }, $inc: { recipeCount: -1 } }
            );
            await Category.updateMany(
                { _id: { $in: toRemove }, recipeCount: { $lt: 0 } },
                { $set: { recipeCount: 0 } }
            );
        }

        return res.status(200).json(updatedRecipe);
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
};

const deleteRecipe = async (req, res) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ message: 'Invalid recipe id' });
    }

    try {
        const existingRecipe = await Recipe.findById(id);
        if (!existingRecipe) {
            return res.status(404).json({ message: 'Recipe not found' });
        }

        const requesterId = getRequesterId(req);
        const isAdmin = req.user?.role === 'admin';
        if (!requesterId || (!isAdmin && existingRecipe.owner.toString() !== requesterId.toString())) {
            return res.status(403).json({ message: 'You can delete only your own recipes' });
        }

        const deletedRecipe = await Recipe.findByIdAndDelete(id);

        const categoryIds = (deletedRecipe.categories || []).map((categoryId) => categoryId.toString());
        if (categoryIds.length > 0) {
            await Category.updateMany(
                { _id: { $in: categoryIds } },
                {
                    $pull: { recipes: deletedRecipe._id },
                    $inc: { recipeCount: -1 }
                }
            );
            await Category.updateMany(
                { _id: { $in: categoryIds }, recipeCount: { $lt: 0 } },
                { $set: { recipeCount: 0 } }
            );
        }

        return res.status(200).json({ message: 'Recipe deleted successfully' });
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
};

module.exports = {
    addRecipe,
    getAllRecipes,
    getRecipeByCode,
    getRecipesByMaxPreparationTime,
    updateRecipe,
    deleteRecipe
};
