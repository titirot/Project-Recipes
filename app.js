const express = require('express');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const cors = require('cors');
const userRoutes = require('./routes/userRoutes');
const recipeRoutes = require('./routes/recipeRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const {
    notFound,
    errorHandler,
    normalizeErrorResponse
} = require('./middlewares/errorMiddleware');

dotenv.config();

const app = express();
const dbUri = process.env.DB_URI;

app.use(cors());
app.use(express.json());
app.use(normalizeErrorResponse);
app.use('/api/users', userRoutes);
app.use('/api/recipes', recipeRoutes);
app.use('/api/categories', categoryRoutes);

app.get('/', (req, res) => {
    res.send('השרת שלי עובד!');
});

app.use(notFound);
app.use(errorHandler);

if (!dbUri) {
    console.error('MongoDB connection error: DB_URI is missing in .env');
    process.exit(1);
}

mongoose
    .connect(dbUri)
    .then(() => {
        console.log('Connected to MongoDB');
        console.log(`Database: ${mongoose.connection.name} | Host: ${mongoose.connection.host}`);
        app.listen(process.env.PORT || 3000, () => {
            console.log(`Success! השרת פועל בפורט ${process.env.PORT || 3000}`);
        });
    })
    .catch((error) => {
        console.error('MongoDB connection error:', error.message);
    });