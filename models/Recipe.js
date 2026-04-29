const mongoose = require('mongoose');

// הגדרת תת-סכמה לשכבות (כדי שיהיה מסודר)
const layerSchema = new mongoose.Schema({
    description: { type: String, required: true },
    ingredients: [{ type: String, required: true }] // מערך של מצרכים
});

const recipeSchema = new mongoose.Schema({
    code: { type: Number, required: true, unique: true },
    name: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    categories: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Category' }], // קישור לקטגוריה
    preparationTime: { type: Number, required: true },
    level: { type: Number, min: 1, max: 5 },
    addDate: { type: Date, default: Date.now },
    layers: [layerSchema], // שימוש בתת-סכמה שיצרנו למעלה
    instructions: [{ type: String }],
    image: { type: String },
    isPrivate: { type: Boolean, default: false },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true } // קישור למשתמש שיצר
});

module.exports = mongoose.model('Recipe', recipeSchema);