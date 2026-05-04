const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  getRestaurants,
  getRestaurantById,
  getMenu,
  getItems,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem
} = require('../controllers/foodController');

// Restaurantes
router.get('/restaurants', getRestaurants);
router.get('/restaurants/:id', getRestaurantById);

// Items y búsqueda
router.get('/items', getItems);

// Menú de un restaurante
router.get('/menu/:restaurantId', getMenu);

// Gestión de menú (requiere autenticación)
router.post('/menu', protect, createMenuItem);
router.put('/menu/:itemId', protect, updateMenuItem);
router.delete('/menu/:itemId', protect, deleteMenuItem);

module.exports = router;
