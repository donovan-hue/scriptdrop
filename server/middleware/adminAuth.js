const AdminUser = require('../models/AdminUser');

exports.adminProtect = async (req, res, next) => {
  try {
    const admin = await AdminUser.findOne({ userId: req.user.id });
    
    if (!admin) {
      return res.status(403).json({ success: false, error: 'Not an admin' });
    }
    
    if (admin.status !== 'active') {
      return res.status(403).json({ success: false, error: 'Admin account inactive' });
    }
    
    req.admin = admin;
    next();
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

exports.checkPermission = (permission) => {
  return async (req, res, next) => {
    const admin = await AdminUser.findOne({ userId: req.user.id });
    
    if (!admin || !admin.permissions.includes(permission)) {
      return res.status(403).json({ success: false, error: 'Insufficient permissions' });
    }
    
    next();
  };
};

exports.superAdminOnly = async (req, res, next) => {
  try {
    const admin = await AdminUser.findOne({ userId: req.user.id });
    
    if (!admin || admin.role !== 'super_admin') {
      return res.status(403).json({ success: false, error: 'Super admin only' });
    }
    
    next();
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};
