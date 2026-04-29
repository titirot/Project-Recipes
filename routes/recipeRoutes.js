const express = require('express');
const {
    addRecipe,
    getAllRecipes,
    getRecipeByCode,
    getRecipesByMaxPreparationTime,
    updateRecipe,
    deleteRecipe
} = require('../controllers/recipeController');
const { authenticate, optionalAuthenticate, authorizeRoles } = require('../middlewares/authMiddleware');

const router = express.Router();

router.post('/', authenticate, authorizeRoles('registered', 'admin', 'user'), addRecipe);
router.get('/', optionalAuthenticate, getAllRecipes);
router.get('/by-preparation-time', optionalAuthenticate, getRecipesByMaxPreparationTime);
router.get('/:code', optionalAuthenticate, getRecipeByCode);
router.put('/:id', authenticate, authorizeRoles('registered', 'admin', 'user'), updateRecipe);
router.delete('/:id', authenticate, authorizeRoles('registered', 'admin', 'user'), deleteRecipe);

module.exports = router;
