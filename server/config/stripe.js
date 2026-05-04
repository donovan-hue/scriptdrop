const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

/**
 * Crear sesión de checkout para compras de ropa
 * @param {Object} items - Items del carrito
 * @param {String} customerEmail - Email del cliente
 * @returns {Object} - Sesión de Stripe
 */
const createClothingCheckoutSession = async (items, customerEmail) => {
  try {
    const lineItems = items.map(item => ({
      price_data: {
        currency: 'usd',
        product_data: {
          name: item.name,
          description: item.description || 'Clothing item',
          images: item.images || [],
          metadata: {
            productId: item.id,
            category: item.category,
          },
        },
        unit_amount: Math.round(item.price * 100), // Convert to cents
      },
      quantity: item.quantity || 1,
    }));

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      customer_email: customerEmail,
      success_url: `${process.env.CLIENT_URL}/shop/checkout?session_id={CHECKOUT_SESSION_ID}&success=true`,
      cancel_url: `${process.env.CLIENT_URL}/shop/cart?cancelled=true`,
      metadata: {
        type: 'clothing',
        orderType: 'shop',
      },
    });

    return session;
  } catch (error) {
    console.error('Stripe checkout error:', error);
    throw error;
  }
};

/**
 * Crear sesión de checkout para pedidos de comida
 * @param {Object} order - Datos de la orden
 * @param {String} customerEmail - Email del cliente
 * @returns {Object} - Sesión de Stripe
 */
const createFoodCheckoutSession = async (order, customerEmail) => {
  try {
    const lineItems = order.items.map(item => ({
      price_data: {
        currency: 'usd',
        product_data: {
          name: item.name,
          description: `${item.quantity}x @ ${item.restaurant}`,
          images: item.image ? [item.image] : [],
          metadata: {
            itemId: item.id,
            restaurant: item.restaurant,
          },
        },
        unit_amount: Math.round(item.price * 100),
      },
      quantity: item.quantity || 1,
    }));

    // Add delivery fee if applicable
    if (order.deliveryFee > 0) {
      lineItems.push({
        price_data: {
          currency: 'usd',
          product_data: {
            name: 'Delivery Fee',
            description: `Delivery to ${order.deliveryAddress.city}`,
          },
          unit_amount: Math.round(order.deliveryFee * 100),
        },
        quantity: 1,
      });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      customer_email: customerEmail,
      success_url: `${process.env.CLIENT_URL}/food/order-tracking?session_id={CHECKOUT_SESSION_ID}&success=true`,
      cancel_url: `${process.env.CLIENT_URL}/food/cart?cancelled=true`,
      metadata: {
        type: 'food',
        orderType: 'delivery',
        orderId: order._id?.toString(),
        restaurant: order.restaurant,
      },
    });

    return session;
  } catch (error) {
    console.error('Stripe food checkout error:', error);
    throw error;
  }
};

/**
 * Obtener sesión de checkout
 * @param {String} sessionId - Session ID de Stripe
 * @returns {Object} - Datos de sesión
 */
const getCheckoutSession = async (sessionId) => {
  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['payment_intent', 'line_items'],
    });
    return session;
  } catch (error) {
    console.error('Error retrieving checkout session:', error);
    throw error;
  }
};

/**
 * Procesar webhook de Stripe
 * @param {String} body - Body del webhook
 * @param {String} signature - Firma del webhook
 * @returns {Object} - Evento procesado
 */
const handleStripeWebhook = async (body, signature) => {
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (error) {
    console.error('Webhook signature verification failed:', error);
    throw new Error('Invalid webhook signature');
  }

  // Procesar eventos
  switch (event.type) {
    case 'checkout.session.completed':
      console.log('✅ Checkout session completed:', event.data.object.id);
      return {
        type: 'session.completed',
        data: event.data.object,
      };

    case 'payment_intent.succeeded':
      console.log('✅ Payment succeeded:', event.data.object.id);
      return {
        type: 'payment.succeeded',
        data: event.data.object,
      };

    case 'payment_intent.payment_failed':
      console.log('❌ Payment failed:', event.data.object.id);
      return {
        type: 'payment.failed',
        data: event.data.object,
      };

    case 'charge.refunded':
      console.log('🔄 Charge refunded:', event.data.object.id);
      return {
        type: 'refund.processed',
        data: event.data.object,
      };

    default:
      console.log('Unhandled event type:', event.type);
  }

  return event;
};

/**
 * Refundar pago
 * @param {String} paymentIntentId - Payment Intent ID
 * @param {String} reason - Razón del refund
 * @returns {Object} - Refund data
 */
const refundPayment = async (paymentIntentId, reason = 'requested_by_customer') => {
  try {
    const refund = await stripe.refunds.create({
      payment_intent: paymentIntentId,
      reason: reason,
    });
    return refund;
  } catch (error) {
    console.error('Refund error:', error);
    throw error;
  }
};

module.exports = {
  stripe,
  createClothingCheckoutSession,
  createFoodCheckoutSession,
  getCheckoutSession,
  handleStripeWebhook,
  refundPayment,
};
