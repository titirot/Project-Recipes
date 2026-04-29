const express = require('express');
const {
    register,
    login,
    getAllUsers,
    updatePassword,
    deleteUser
} = require('../controllers/userController');
const {
    authenticate,
    authorizeRoles,
    authorizeSelfOrAdmin
} = require('../middlewares/authMiddleware');

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/', authenticate, authorizeRoles('admin'), getAllUsers);
router.patch('/:id/password', authenticate, authorizeSelfOrAdmin('id'), updatePassword);
router.delete('/:id', authenticate, authorizeRoles('admin'), deleteUser);

module.exports = router;
