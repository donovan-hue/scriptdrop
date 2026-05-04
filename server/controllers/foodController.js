const User = require('../models/User');
const Order = require('../models/Order');
const MenuItem = require('../models/MenuItem');

// Obtener lista de restaurantes (usuarios con rol 'seller')
exports.getRestaurants = async (req, res) => {
  try {
    const { search, page = 1, limit = 20 } = req.query;

    let filter = { role: 'seller' };

    if (search) {
      filter.$or = [
        { username: { $regex: search, $options: 'i' } },
        { bio: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const restaurants = await User.find(filter)
      .select('username avatar bio location website rating deliveryFee deliveryTime isVerified createdAt')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await User.countDocuments(filter);

    res.status(200).json({
      success: true,
      restaurants,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Obtener un restaurante por ID
exports.getRestaurantById = async (req, res) => {
  try {
    const restaurant = await User.findOne({ _id: req.params.id, role: 'seller' })
      .select('username avatar bio location website rating deliveryFee deliveryTime isVerified');

    if (!restaurant) {
      return res.status(404).json({ success: false, message: 'Restaurant not found' });
    }

    res.status(200).json({ success: true, restaurant });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/food/menu/:restaurantId — Menú completo de un restaurante
exports.getMenu = async (req, res) => {
  try {
    const restaurant = await User.findOne({ _id: req.params.restaurantId, role: 'seller' }).select('_id');
    if (!restaurant) {
      return res.status(404).json({ success: false, message: 'Restaurant not found' });
    }

    const { category } = req.query;
    const filter = { restaurant: req.params.restaurantId, available: true };
    if (category) filter.category = category;

    const items = await MenuItem.find(filter).sort({ category: 1, name: 1 });

    // Agrupar por categoría
    const grouped = items.reduce((acc, item) => {
      if (!acc[item.category]) acc[item.category] = [];
      acc[item.category].push(item);
      return acc;
    }, {});

    res.status(200).json({ success: true, menu: grouped, total: items.length });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/food/items — Buscar items por nombre o categoría
exports.getItems = async (req, res) => {
  try {
    const { search, category, restaurantId, page = 1, limit = 20 } = req.query;

    const filter = { available: true };
    if (restaurantId) filter.restaurant = restaurantId;
    if (category) filter.category = category;
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const items = await MenuItem.find(filter)
      .populate('restaurant', 'username avatar deliveryFee deliveryTime')
      .sort({ name: 1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await MenuItem.countDocuments(filter);

    res.status(200).json({
      success: true,
      items,
      pagination: { total, page: parseInt(page), pages: Math.ceil(total / parseInt(limit)) }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/food/menu — Crear item de menú (solo el restaurante dueño)
exports.createMenuItem = async (req, res) => {
  try {
    const { name, description, price, category, image, preparationTime, allergens, tags } = req.body;

    if (req.user.role !== 'seller' && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Only sellers can create menu items' });
    }

    const item = await MenuItem.create({
      restaurant: req.user._id,
      name, description, price, category,
      image, preparationTime, allergens, tags
    });

    res.status(201).json({ success: true, item });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// PUT /api/food/menu/:itemId — Actualizar item de menú
exports.updateMenuItem = async (req, res) => {
  try {
    const item = await MenuItem.findById(req.params.itemId);
    if (!item) return res.status(404).json({ success: false, message: 'Item not found' });

    if (item.restaurant.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const updated = await MenuItem.findByIdAndUpdate(req.params.itemId, req.body, { new: true });
    res.status(200).json({ success: true, item: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// DELETE /api/food/menu/:itemId — Eliminar item de menú
exports.deleteMenuItem = async (req, res) => {
  try {
    const item = await MenuItem.findById(req.params.itemId);
    if (!item) return res.status(404).json({ success: false, message: 'Item not found' });

    if (item.restaurant.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    await item.deleteOne();
    res.status(200).json({ success: true, message: 'Item deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
