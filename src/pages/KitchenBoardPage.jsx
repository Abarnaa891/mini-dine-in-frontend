import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ordersApi } from '../api/orders.api';
import { useToast } from '../components/Toast';
import Layout from '../components/Layout';
import '../styles/kitchen.css';

function OrderCard({ order, col, onAction, disabled }) {
  const elapsed = Math.floor((Date.now() - new Date(order.createdAt).getTime()) / 60000);
  return (
    <div className={`kitchen-card${elapsed > 15 ? ' kitchen-card--urgent' : ''}`}>
      <div className="kitchen-card-head">
        <span className="kitchen-order-id">#{order.id}</span>
        <span className="kitchen-elapsed">{elapsed}m ago</span>
      </div>
      {order.note && <p className="kitchen-note">📝 {order.note}</p>}
      <ul className="kitchen-items">
        {order.items.map((item) => (
          <li key={item.id}>
            <span className="kitchen-qty">×{item.quantity}</span>
            <span>{item.menuItem.name}</span>
          </li>
        ))}
      </ul>
      <div className="kitchen-card-foot">
        {col === 'placed' ? (
          <button className="kitchen-btn kitchen-btn--accept" onClick={onAction} disabled={disabled}>
            Accept order
          </button>
        ) : (
          <button className="kitchen-btn kitchen-btn--done" onClick={onAction} disabled={disabled}>
            Mark ready
          </button>
        )}
      </div>
    </div>
  );
}

export default function KitchenBoardPage() {
  const qc            = useQueryClient();
  const { showToast } = useToast();

  const { data: orders = [], isLoading } = useQuery({
    queryKey: ['kitchen-queue'],
    queryFn:  () => ordersApi.getKitchenQueue().then((r) => r.data),
    refetchInterval: 8000,
  });

  const statusMut = useMutation({
    mutationFn: ({ id, status }) => ordersApi.updateStatus(id, status),
    onSuccess:  () => { qc.invalidateQueries({ queryKey: ['kitchen-queue'] }); showToast('Order updated', 'success'); },
    onError:    () => showToast('Failed to update', 'error'),
  });

  const placed    = orders.filter((o) => o.status === 'PLACED');
  const preparing = orders.filter((o) => o.status === 'PREPARING');

  return (
    <Layout>
      <div className="kitchen-page">
        <div className="kitchen-header">
          <h1>Kitchen Board</h1>
          <span className="kitchen-live">● Live</span>
        </div>

        {isLoading ? <p className="kitchen-loading">Loading queue...</p> : (
          <div className="kitchen-columns">
            <div className="kitchen-col">
              <div className="kitchen-col-head kitchen-col-head--new">
                Incoming <span className="kitchen-count">{placed.length}</span>
              </div>
              {placed.length === 0
                ? <div className="kitchen-empty">No new orders</div>
                : placed.map((o) => (
                    <OrderCard key={o.id} order={o} col="placed"
                      onAction={() => statusMut.mutate({ id: o.id, status: 'PREPARING' })}
                      disabled={statusMut.isPending} />
                  ))}
            </div>

            <div className="kitchen-col">
              <div className="kitchen-col-head kitchen-col-head--prep">
                Preparing <span className="kitchen-count">{preparing.length}</span>
              </div>
              {preparing.length === 0
                ? <div className="kitchen-empty">Nothing in progress</div>
                : preparing.map((o) => (
                    <OrderCard key={o.id} order={o} col="preparing"
                      onAction={() => statusMut.mutate({ id: o.id, status: 'READY' })}
                      disabled={statusMut.isPending} />
                  ))}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}