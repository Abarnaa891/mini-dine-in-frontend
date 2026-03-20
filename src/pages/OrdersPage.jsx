import { useQuery } from '@tanstack/react-query';
import { ordersApi } from '../api/orders.api';
import Layout from '../components/Layout';
import '../styles/orders.css';

const STATUS_LABEL = {
  PLACED: 'Order Placed', PREPARING: 'Preparing', READY: 'Ready',
  OUT_FOR_DELIVERY: 'Out for Delivery', DELIVERED: 'Delivered', CANCELLED: 'Cancelled',
};
const STATUS_CLASS = {
  PLACED: 'status--placed', PREPARING: 'status--preparing', READY: 'status--ready',
  OUT_FOR_DELIVERY: 'status--otd', DELIVERED: 'status--delivered', CANCELLED: 'status--cancelled',
};

export default function OrdersPage() {
  const { data: orders = [], isLoading } = useQuery({
    queryKey: ['my-orders'],
    queryFn: () => ordersApi.getMy().then((r) => r.data),
    refetchInterval: 10000,
  });

  return (
    <Layout>
      <div className="orders-page">
        <h1>My Orders</h1>
        {isLoading ? (
          <div className="orders-loading">Loading orders...</div>
        ) : orders.length === 0 ? (
          <div className="orders-empty"><span>📋</span><p>No orders yet.</p></div>
        ) : (
          <div className="orders-list">
            {orders.map((order) => (
              <div key={order.id} className="order-card">
                <div className="order-card-head">
                  <div>
                    <span className="order-id">Order #{order.id}</span>
                    <span className="order-date">
                      {new Date(order.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric', month: 'short', year: 'numeric',
                        hour: '2-digit', minute: '2-digit',
                      })}
                    </span>
                  </div>
                  <span className={`order-status ${STATUS_CLASS[order.status]}`}>
                    {STATUS_LABEL[order.status]}
                  </span>
                </div>
                <div className="order-items-list">
                  {order.items.map((item) => (
                    <div key={item.id} className="order-line">
                      <span>{item.menuItem.name}</span>
                      <span>× {item.quantity}</span>
                      <span>₹{(parseFloat(item.unitPrice) * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
                <div className="order-card-foot">
                  {order.address && <span className="order-addr">📍 {order.address}</span>}
                  <span className="order-total">Total: <strong>₹{parseFloat(order.totalAmount).toFixed(2)}</strong></span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}