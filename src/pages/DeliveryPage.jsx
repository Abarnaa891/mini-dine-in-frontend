import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { deliveryApi } from '../api/delivery.api';
import { useToast } from '../components/Toast';
import Layout from '../components/Layout';
import '../styles/delivery.css';

export default function DeliveryPage() {
  const qc            = useQueryClient();
  const { showToast } = useToast();

  const { data: runs = [], isLoading } = useQuery({
    queryKey: ['my-runs'],
    queryFn:  () => deliveryApi.getMyRuns().then((r) => r.data),
    refetchInterval: 10000,
  });

  const { data: history = [] } = useQuery({
    queryKey: ['my-history'],
    queryFn:  () => deliveryApi.getMyHistory().then((r) => r.data),
  });

  const deliverMut = useMutation({
    mutationFn: (orderId) => deliveryApi.markDelivered(orderId),
    onSuccess:  () => {
      qc.invalidateQueries({ queryKey: ['my-runs'] });
      qc.invalidateQueries({ queryKey: ['my-history'] });
      showToast('Marked as delivered!', 'success');
    },
    onError: () => showToast('Failed to update', 'error'),
  });

  return (
    <Layout>
      <div className="delivery-page">
        <h1>My Delivery Runs</h1>

        <section className="delivery-section">
          <h2>Active runs <span className="delivery-count">{runs.length}</span></h2>
          {isLoading ? <p className="delivery-loading">Loading...</p> :
            runs.length === 0 ? (
              <div className="delivery-empty"><span>🛵</span><p>No active runs assigned.</p></div>
            ) : (
              <div className="delivery-list">
                {runs.map((order) => (
                  <div key={order.id} className="delivery-card">
                    <div className="delivery-card-head">
                      <span className="delivery-order-id">Order #{order.id}</span>
                      <span className="delivery-status">Out for delivery</span>
                    </div>
                    <div className="delivery-customer">
                      <strong>{order.user.name}</strong>
                      {order.user.phone && <span>📞 {order.user.phone}</span>}
                    </div>
                    {order.address && <p className="delivery-addr">📍 {order.address}</p>}
                    <ul className="delivery-items">
                      {order.items.map((item) => (
                        <li key={item.id}>
                          <span>×{item.quantity}</span>
                          <span>{item.menuItem.name}</span>
                        </li>
                      ))}
                    </ul>
                    <div className="delivery-card-foot">
                      <span className="delivery-total">₹{parseFloat(order.totalAmount).toFixed(2)}</span>
                      <button className="delivery-done-btn"
                        onClick={() => deliverMut.mutate(order.id)}
                        disabled={deliverMut.isPending}>
                        Mark delivered
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
        </section>

        <section className="delivery-section">
          <h2>Completed today <span className="delivery-count">{history.length}</span></h2>
          {history.length === 0 ? (
            <p className="delivery-empty-sm">No completed deliveries yet.</p>
          ) : (
            <div className="delivery-list">
              {history.map((order) => (
                <div key={order.id} className="delivery-card delivery-card--done">
                  <div className="delivery-card-head">
                    <span className="delivery-order-id">Order #{order.id}</span>
                    <span className="delivery-status delivery-status--done">Delivered</span>
                  </div>
                  <div className="delivery-customer">
                    <strong>{order.user.name}</strong>
                  </div>
                  {order.address && <p className="delivery-addr">📍 {order.address}</p>}
                  <div className="delivery-card-foot">
                    <span className="delivery-total">₹{parseFloat(order.totalAmount).toFixed(2)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </Layout>
  );
}