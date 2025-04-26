const express = require('express');
const { getAllUsers, updateUser, createUser} = require('../controllers/userController');
const { authenticateToken } = require('../middlewares/authMiddleware');
const { checkPermission } = require('../middlewares/permissionMiddleware');

const router = express.Router();

// Lista utenti
router.get('/users', authenticateToken, checkPermission('canViewUsers'), getAllUsers);

// Aggiorna ruolo e permessi
router.put('/users/:id', authenticateToken, checkPermission('canEditUsers'), updateUser);

// Creazione nuovo utente
router.post('/users', authenticateToken, checkPermission('canCreateUsers'), createUser);

module.exports = router;
