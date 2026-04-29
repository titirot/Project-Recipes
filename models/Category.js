const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
    code: { type: String, required: true, unique: true, trim: true, uppercase: true },
    description: { type: String, required: true, trim: true, minlength: 2 },
    recipes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Recipe' }],
    recipeCount: { type: Number, default: 0, min: 0 }
});

module.exports = mongoose.model('Category', categorySchema);