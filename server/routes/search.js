const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  globalSearch,
  searchUsers,
  searchSuggestions
} = require('../controllers/searchController');

router.get('/global', protect, globalSearch);
router.get('/users', protect, searchUsers);
router.get('/suggestions', protect, searchSuggestions);

module.exports = router;
