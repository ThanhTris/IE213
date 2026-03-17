const express = require('express');
const {
  upsertUserByWallet,
  getUserByWallet,
  updateUserByWallet,
  getAllUsers,
} = require('../controllers/user.controller');

const router = express.Router();

// Web3 login/register
router.post('/auth', upsertUserByWallet);

// Get user by wallet (profile)
router.get('/me', getUserByWallet);

// Update user
router.put('/:walletAddress', updateUserByWallet);

// Admin get all users
router.get('/', getAllUsers);

module.exports = router;
