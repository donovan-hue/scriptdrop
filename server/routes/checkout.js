const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  createClothingCheckoutSession,
  createFoodCheckoutSession,
  getCheckoutSession,
  handleStripeWebhook,
} = require('../config/stripe');
const Order = require('../models/Order');
const emailService = require('../services/emailService');
const { emitNotification } = require('../services/socketService');

/**
 * POST /api/checkout/create-payment-intent
 * Crea un PaymentIntent de Stripe para una orden existente
 */
router.post('/create-payment-intent', protect, async (req, res) => {
  try {
    const { orderId } = req.body;

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ success: false, error: 'Order not found' });
    }

    if (order.customer.toString() !== req.user.id.toString()) {
      return res.status(403).json({ success: false, error: 'Not authorized' });
    }

    const { stripe } = require('../config/stripe');
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(order.totalAmount * 100),
      currency: 'usd',
      receipt_email: req.user.email,
      metadata: {
        orderId: orderId,
        userId: req.user.id.toString(),
      },
    });

    // Guardar el paymentIntentId en la orden para poder hacer refunds después
    await Order.findByIdAndUpdate(orderId, {
      stripePaymentId: paymentIntent.id,
    });

    res.json({
      success: true,
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    });
  } catch (error) {
    console.error('create-payment-intent error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/checkout/clothing
 * Crear sesión de checkout para compras de ropa
 */
router.post('/clothing', protect, async (req, res) => {
  try {
    const { items, total } = req.body;
    const customerEmail = req.user.email;

    if (!items || items.length === 0) {
      return res.status(400).json({ error: 'No items in cart' });
    }

    const session = await createClothingCheckoutSession(items, customerEmail);

    res.json({
      success: true,
      sessionId: session.id,
      url: session.url,
      message: '✅ Checkout session created successfully',
    });
  } catch (error) {
    console.error('Clothing checkout error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to create checkout session',
    });
  }
});

/**
 * POST /api/checkout/food
 * Crear sesión de checkout para pedidos de comida
 */
router.post('/food', protect, async (req, res) => {
  try {
    const { items, restaurant, deliveryAddress, deliveryFee, total } = req.body;
    const customerEmail = req.user.email;

    if (!items || items.length === 0) {
      return res.status(400).json({ error: 'No items in order' });
    }

    const order = {
      items,
      restaurant,
      deliveryAddress,
      deliveryFee: deliveryFee || 0,
      _id: null, // Will be set after order creation
    };

    const session = await createFoodCheckoutSession(order, customerEmail);

    res.json({
      success: true,
      sessionId: session.id,
      url: session.url,
      message: '✅ Checkout session created successfully',
    });
  } catch (error) {
    console.error('Food checkout error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to create checkout session',
    });
  }
});

/**
 * GET /api/checkout/session/:sessionId
 * Obtener información de sesión de checkout
 */
router.get('/session/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params;

    const session = await getCheckoutSession(sessionId);

    res.json({
      success: true,
      session,
      paymentStatus: session.payment_status,
      message: '✅ Session retrieved successfully',
    });
  } catch (error) {
    console.error('Get session error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to retrieve session',
    });
  }
});

/**
 * POST /api/checkout/webhook
 * Webhook para Stripe (eventos de pago)
 * IMPORTANTE: Configure este URL en Stripe Dashboard como:
 *   https://TU_DOMINIO/api/checkout/webhook
 */
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const signature = req.headers['stripe-signature'];

  try {
    const event = await handleStripeWebhook(req.body, signature);

    // ── checkout.session.completed → marcar orden como pagada ──────────────
    if (event.type === 'session.completed') {
      const session = event.data;
      const orderId = session.metadata?.orderId;

      if (orderId) {
        const updatedOrder = await Order.findByIdAndUpdate(orderId, {
          paymentStatus: 'completed',
          stripePaymentId: session.payment_intent,
          status: 'confirmed',
          $push: {
            trackingHistory: {
              status: 'confirmed',
              timestamp: new Date(),
              location: 'Payment confirmed via Stripe',
            },
          },
        }, { new: true }).populate('customer', 'email firstName username');

        console.log(`Order ${orderId} marked as paid (session ${session.id})`);

        if (updatedOrder && updatedOrder.customer) {
          const customer = updatedOrder.customer;

          // Email de confirmacion de orden (fire-and-forget)
          emailService.sendEmail(
            customer.email,
            'order_confirmation',
            { orderId, total: updatedOrder.totalAmount || 0 }
          ).catch(err => console.error('Order confirmation email failed:', err));

          // Notificacion Socket.io al cliente
          emitNotification(customer._id.toString(), {
            type: 'order',
            orderId,
            status: 'confirmed'
          });
        }
      }

      // Para compras de tienda (clothing) que no tienen orderId en metadata,
      // crear una Order nueva con los datos de la sesión
      if (!orderId && session.metadata?.type === 'clothing') {
        console.log(`Clothing purchase completed - session ${session.id}. No orderId in metadata.`);
      }
    }

    // ── payment_intent.payment_failed → marcar orden como fallida ───────────
    if (event.type === 'payment.failed') {
      const paymentIntent = event.data;
      const orderId = paymentIntent.metadata?.orderId;

      if (orderId) {
        await Order.findByIdAndUpdate(orderId, {
          paymentStatus: 'failed',
          $push: {
            trackingHistory: {
              status: 'cancelled',
              timestamp: new Date(),
              location: `Payment failed: ${paymentIntent.last_payment_error?.message || 'Unknown error'}`,
            },
          },
        });
        console.log(`Order ${orderId} marked as payment failed`);
      }
    }

    res.json({
      success: true,
      message: 'Webhook received and processed',
      eventType: event.type,
    });
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * POST /api/checkout/refund
 * Procesar refund de pago (Admin only)
 */
router.post('/refund', protect, async (req, res) => {
  try {
    const { paymentIntentId, reason } = req.body;

    // Verificar que sea admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Only admins can process refunds' });
    }

    const { refundPayment } = require('../config/stripe');
    const refund = await refundPayment(
      paymentIntentId,
      reason || 'requested_by_customer'
    );

    res.json({
      success: true,
      refund,
      message: '✅ Refund processed successfully',
    });
  } catch (error) {
    console.error('Refund error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to process refund',
    });
  }
});

module.exports = router;
