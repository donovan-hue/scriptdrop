import React, { useState, useEffect, useCallback } from 'react';
import api from '../services/api';

const REASON_LABELS = {
  item_not_received: 'Item not received',
  item_damaged: 'Item damaged',
  not_as_described: 'Not as described',
  changed_mind: 'Changed my mind',
  other: 'Other',
};

const REFUND_STATUS_STYLES = {
  requested: { label: 'Pending review', bg: 'bg-yellow-100', text: 'text-yellow-800', border: 'border-yellow-300' },
  approved: { label: 'Approved', bg: 'bg-green-100', text: 'text-green-800', border: 'border-green-300' },
  rejected: { label: 'Rejected', bg: 'bg-red-100', text: 'text-red-800', border: 'border-red-300' },
  processed: { label: 'Processed', bg: 'bg-blue-100', text: 'text-blue-800', border: 'border-blue-300' },
  completed: { label: 'Completed', bg: 'bg-purple-100', text: 'text-purple-800', border: 'border-purple-300' },
};

/* ─── Modal de solicitud de reembolso ─────────────────────────────── */
function RefundModal({ order, onClose, onSuccess }) {
  const [reason, setReason] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!reason) {
      setError('Please select a reason');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await api.post('/refunds/request', {
        orderId: order._id,
        reason,
        description,
      });
      onSuccess();
    } catch (err) {
      setError(err?.error || err?.message || 'Failed to submit refund request');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-bold text-gray-900">Request Refund</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
            aria-label="Close"
          >
            &times;
          </button>
        </div>

        {/* Order summary */}
        <div className="px-6 pt-4 pb-2">
          <div className="bg-gray-50 rounded-lg p-3 mb-4">
            <p className="text-sm text-gray-500">Order</p>
            <p className="font-mono text-sm text-gray-700 truncate">{order._id}</p>
            <p className="font-semibold text-gray-900 mt-1">
              Amount: <span className="text-blue-700">${(order.totalAmount || 0).toFixed(2)}</span>
            </p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-6 pb-6 space-y-4">
          {/* Reason */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Reason <span className="text-red-500">*</span>
            </label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Select a reason...</option>
              {Object.entries(REASON_LABELS).map(([val, label]) => (
                <option key={val} value={val}>{label}</option>
              ))}
            </select>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Additional details (optional)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="Describe the issue in more detail..."
              className="w-full border border-gray-300 rounded-lg px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">
              {error}
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 border border-gray-300 text-gray-700 py-2 rounded-lg font-medium hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-medium transition disabled:opacity-50"
            >
              {loading ? 'Submitting...' : 'Submit Request'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ─── Badge de estado de refund ────────────────────────────────────── */
function RefundBadge({ refund }) {
  const style = REFUND_STATUS_STYLES[refund.status] || REFUND_STATUS_STYLES.requested;
  return (
    <div className={`inline-flex items-center gap-1.5 border ${style.border} ${style.bg} ${style.text} text-xs font-semibold px-3 py-1 rounded-full`}>
      <span>{style.label}</span>
      {refund.status === 'rejected' && refund.reviewNotes && (
        <span className="font-normal opacity-80">— {refund.reviewNotes}</span>
      )}
    </div>
  );
}

/* ─── Tarjeta de orden ──────────────────────────────────────────────── */
function OrderCard({ order, refund, onRequestRefund }) {
  const isCompleted = order.paymentStatus === 'completed';
  const hasRefund = !!refund;

  const statusColors = {
    pending: 'bg-yellow-100 text-yellow-800',
    confirmed: 'bg-blue-100 text-blue-800',
    preparing: 'bg-orange-100 text-orange-800',
    on_the_way: 'bg-indigo-100 text-indigo-800',
    delivered: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      {/* Order Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b bg-gray-50">
        <div>
          <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Order ID</p>
          <p className="font-mono text-sm text-gray-700">{order._id}</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-gray-500 mb-1">{new Date(order.createdAt).toLocaleDateString()}</p>
          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${statusColors[order.status] || 'bg-gray-100 text-gray-700'}`}>
            {order.status}
          </span>
        </div>
      </div>

      {/* Items */}
      <div className="px-5 py-3">
        {Array.isArray(order.items) && order.items.length > 0 ? (
          <ul className="space-y-1">
            {order.items.map((item, i) => (
              <li key={i} className="flex justify-between text-sm text-gray-700">
                <span>{item.quantity}x {item.name}</span>
                <span>${(item.price * item.quantity).toFixed(2)}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-gray-500 italic">No item details available</p>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between px-5 py-4 border-t">
        <div>
          <p className="text-xs text-gray-500">Total paid</p>
          <p className="text-lg font-bold text-gray-900">${(order.totalAmount || 0).toFixed(2)}</p>
        </div>

        <div className="flex flex-col items-end gap-2">
          {/* Refund status badge */}
          {hasRefund && <RefundBadge refund={refund} />}

          {/* Botón de solicitud solo si la orden esta completada y no tiene refund */}
          {isCompleted && !hasRefund && (
            <button
              onClick={() => onRequestRefund(order)}
              className="bg-orange-500 hover:bg-orange-600 text-white text-sm px-4 py-1.5 rounded-lg font-medium transition"
            >
              Request Refund
            </button>
          )}

          {/* Mensaje de pago pendiente */}
          {!isCompleted && (
            <span className="text-xs text-gray-400 italic">
              Refund available after payment is confirmed
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─── Pagina principal: Mis Ordenes ────────────────────────────────── */
function MyOrders() {
  const [orders, setOrders] = useState([]);
  const [refundsMap, setRefundsMap] = useState({}); // { orderId: refund }
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [successMsg, setSuccessMsg] = useState('');

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [ordersRes, refundsRes] = await Promise.all([
        api.get('/orders/my-orders'),
        api.get('/refunds/my'),
      ]);

      const ordersData = ordersRes.data?.orders || ordersRes.data?.data || [];
      const refundsData = refundsRes.data?.data || [];

      setOrders(ordersData);

      // Construir mapa orderId → refund
      const map = {};
      refundsData.forEach((r) => {
        const oid = r.orderId?._id || r.orderId;
        if (oid) map[oid.toString()] = r;
      });
      setRefundsMap(map);
    } catch (err) {
      setError('Failed to load orders. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleRefundSuccess = () => {
    setSelectedOrder(null);
    setSuccessMsg('Refund request submitted successfully! We will review it shortly.');
    fetchData();
    setTimeout(() => setSuccessMsg(''), 6000);
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <div className="inline-block w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-gray-500">Loading your orders...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <h1 className="text-3xl font-bold mb-6 text-gray-900">My Orders</h1>

      {successMsg && (
        <div className="mb-6 bg-green-50 border border-green-300 text-green-800 rounded-xl px-5 py-4 text-sm font-medium">
          {successMsg}
        </div>
      )}

      {error && (
        <div className="mb-6 bg-red-50 border border-red-300 text-red-700 rounded-xl px-5 py-4 text-sm">
          {error}
          <button onClick={fetchData} className="ml-3 underline font-medium">Retry</button>
        </div>
      )}

      {!loading && orders.length === 0 && !error && (
        <div className="text-center py-16 text-gray-500">
          <p className="text-5xl mb-4">📦</p>
          <p className="text-xl font-semibold mb-2">No orders yet</p>
          <p className="text-sm">Your order history will appear here once you make a purchase.</p>
        </div>
      )}

      <div className="space-y-4">
        {orders.map((order) => (
          <OrderCard
            key={order._id}
            order={order}
            refund={refundsMap[order._id?.toString()]}
            onRequestRefund={setSelectedOrder}
          />
        ))}
      </div>

      {/* Modal */}
      {selectedOrder && (
        <RefundModal
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
          onSuccess={handleRefundSuccess}
        />
      )}
    </div>
  );
}

export default MyOrders;
