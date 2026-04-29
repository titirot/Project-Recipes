const express = require('express');
const {
    getAllCategories,
    getAllCategoriesWithRecipes,
    getCategoryByCodeOrNameWithRecipes
} = require('../controllers/categoryController');

const router = express.Router();

router.get('/', getAllCategories);
router.get('/with-recipes', getAllCategoriesWithRecipes);
router.get('/lookup/:value', getCategoryByCodeOrNameWithRecipes);

module.exports = router;
