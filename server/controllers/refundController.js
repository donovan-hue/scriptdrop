const Refund = require('../models/Refund');
const Order = require('../models/Order');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const emailService = require('../services/emailService');

/**
 * POST /api/refunds/request
 * Usuario solicita un reembolso para una orden completada
 */
exports.requestRefund = async (req, res) => {
  try {
    const { orderId, reason, description } = req.body;

    if (!orderId || !reason) {
      return res.status(400).json({ success: false, error: 'orderId and reason are required' });
    }

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ success: false, error: 'Order not found' });
    }

    // Verificar que la orden pertenece al usuario autenticado
    if (order.customer.toString() !== req.user.id.toString()) {
      return res.status(403).json({ success: false, error: 'Unauthorized: this order does not belong to you' });
    }

    // Solo se puede refundear una orden entregada/completada (paymentStatus: completed)
    if (order.paymentStatus !== 'completed') {
      return res.status(400).json({
        success: false,
        error: `Cannot request a refund for an order with payment status: ${order.paymentStatus}. Only completed orders are eligible.`,
      });
    }

    // Evitar duplicados
    const existingRefund = await Refund.findOne({ orderId });
    if (existingRefund) {
      return res.status(400).json({
        success: false,
        error: 'A refund request already exists for this order',
        refund: existingRefund,
      });
    }

    const refund = new Refund({
      orderId,
      userId: req.user.id,
      amount: order.totalAmount,
      reason,
      description,
      status: 'requested',
    });

    await refund.save();

    if (req.user.email) {
      emailService.sendRefund(req.user.email, orderId, order.totalAmount)
        .catch(err => console.warn('Refund email failed:', err.message));
    }

    res.status(201).json({ success: true, data: refund });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

/**
 * GET /api/refunds/my
 * Usuario obtiene todos sus refunds con la orden populada
 */
exports.getMyRefunds = async (req, res) => {
  try {
    const refunds = await Refund.find({ userId: req.user.id })
      .populate('orderId', 'totalAmount items status paymentStatus createdAt')
      .sort({ createdAt: -1 });

    res.json({ success: true, data: refunds });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

/**
 * GET /api/refunds/:id  (alias getUserRefunds por id individual)
 * Obtener estado de un refund concreto (propio)
 */
exports.getRefundStatus = async (req, res) => {
  try {
    const { refundId } = req.params;

    const refund = await Refund.findById(refundId).populate('orderId', 'totalAmount items status');

    if (!refund) {
      return res.status(404).json({ success: false, error: 'Refund not found' });
    }
    if (refund.userId.toString() !== req.user.id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, error: 'Unauthorized' });
    }

    res.json({ success: true, data: refund });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

/**
 * PATCH /api/refunds/:id/approve
 * Solo admin: llama a Stripe refunds API y marca el refund como 'approved'
 */
exports.approveRefund = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ success: false, error: 'Only admins can approve refunds' });
    }

    const { id } = req.params;
    const refund = await Refund.findById(id);

    if (!refund) {
      return res.status(404).json({ success: false, error: 'Refund not found' });
    }

    if (refund.status !== 'requested') {
      return res.status(400).json({
        success: false,
        error: `Refund is already in status '${refund.status}', cannot approve`,
      });
    }

    // Obtener la orden para conseguir el stripePaymentId
    const order = await Order.findById(refund.orderId);
    if (!order) {
      return res.status(404).json({ success: false, error: 'Associated order not found' });
    }

    let stripeRefundId = null;

    if (order.stripePaymentId) {
      try {
        const stripeRefund = await stripe.refunds.create({
          payment_intent: order.stripePaymentId,
          amount: Math.round(refund.amount * 100),
          reason: 'requested_by_customer',
        });
        stripeRefundId = stripeRefund.id;
      } catch (stripeErr) {
        console.error('Stripe refund error:', stripeErr.message);
        return res.status(502).json({
          success: false,
          error: `Stripe refund failed: ${stripeErr.message}`,
        });
      }
    }

    const updated = await Refund.findByIdAndUpdate(
      id,
      {
        status: 'approved',
        stripeRefundId,
        reviewedBy: req.user.id,
        reviewedAt: new Date(),
        completedAt: new Date(),
      },
      { new: true }
    ).populate('orderId', 'totalAmount items').populate('userId', 'email');

    // Actualizar paymentStatus de la orden
    await Order.findByIdAndUpdate(refund.orderId, { paymentStatus: 'failed' });

    if (updated?.userId?.email) {
      emailService.sendRefund(updated.userId.email, refund.orderId, refund.amount)
        .catch(err => console.warn('Refund approved email failed:', err.message));
    }

    res.json({ success: true, data: updated });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

/**
 * PATCH /api/refunds/:id/reject
 * Solo admin: rechaza el refund con una razón
 */
exports.rejectRefund = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ success: false, error: 'Only admins can reject refunds' });
    }

    const { id } = req.params;
    const { reviewNotes } = req.body;

    const refund = await Refund.findById(id);
    if (!refund) {
      return res.status(404).json({ success: false, error: 'Refund not found' });
    }

    if (refund.status !== 'requested') {
      return res.status(400).json({
        success: false,
        error: `Refund is already in status '${refund.status}', cannot reject`,
      });
    }

    const updated = await Refund.findByIdAndUpdate(
      id,
      {
        status: 'rejected',
        reviewedBy: req.user.id,
        reviewedAt: new Date(),
        reviewNotes: reviewNotes || 'No reason provided',
      },
      { new: true }
    ).populate('orderId', 'totalAmount items');

    res.json({ success: true, data: updated });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

/**
 * GET /api/refunds/all  — Solo admin: lista todos los refunds
 */
exports.getAllRefunds = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ success: false, error: 'Admins only' });
    }

    const { status, page = 1, limit = 20 } = req.query;
    const filter = status ? { status } : {};

    const refunds = await Refund.find(filter)
      .populate('orderId', 'totalAmount items status')
      .populate('userId', 'username email')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const total = await Refund.countDocuments(filter);

    res.json({ success: true, data: refunds, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// Mantener compatibilidad con el processRefund original (puede ser llamado internamente)
exports.processRefund = async (req, res) => {
  try {
    const { refundId } = req.params;

    const refund = await Refund.findById(refundId);
    if (!refund) return res.status(404).json({ success: false, error: 'Refund not found' });

    const order = await Order.findById(refund.orderId);

    if (order && order.stripePaymentId) {
      const refundResult = await stripe.refunds.create({
        payment_intent: order.stripePaymentId,
        amount: Math.round(refund.amount * 100),
      });

      await Refund.findByIdAndUpdate(refundId, {
        status: 'processed',
        stripeRefundId: refundResult.id,
        completedAt: new Date(),
      });
    }

    res.json({ success: true, message: 'Refund processed' });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// Alias para compatibilidad con la ruta getUserRefunds anterior
exports.getUserRefunds = exports.getMyRefunds;
