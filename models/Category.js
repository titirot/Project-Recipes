const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
    code: { type: String, required: true, unique: true },
    description: { type: String, required: true },
    recipes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Recipe' }] // מערך של מזהי מתכונים
});

module.exports = mongoose.model('Category', categorySchema);