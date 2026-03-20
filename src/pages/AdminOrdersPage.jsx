import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ordersApi } from '../api/orders.api';
import { useToast } from '../components/Toast';
import Layout from '../components/Layout';
import '../styles/admin.css';
import '../styles/orders.css';

const STATUSES = ['PLACED','PREPARING','READY','OUT_FOR_DELIVERY','DELIVERED','CANCELLED'];
const NEXT = { PLACED: 'PREPARING', PREPARING: 'READY', READY: 'OUT_FOR_DELIVERY', OUT_FOR_DELIVERY: 'DELIVERED' };
const STATUS_CLASS = {
  PLACED: 'status--placed', PREPARING: 'status--preparing', READY: 'status--ready',
  OUT_FOR_DELIVERY: 'status--otd', DELIVERED: 'status--delivered', CANCELLED: 'status--cancelled',
};

export default function AdminOrdersPage() {
  const qc            = useQueryClient();
  const { showToast } = useToast();
  const [filter, setFilter] = useState('');

  const { data: orders = [], isLoading } = useQuery({
    queryKey: ['admin-orders', filter],
    queryFn:  () => ordersApi.getAll(filter ? { status: filter } : undefined).then((r) => r.data),
    refetchInterval: 15000,
  });

  const statusMut = useMutation({
    mutationFn: ({ id, status }) => ordersApi.updateStatus(id, status),
    onSuccess:  () => { qc.invalidateQueries({ queryKey: ['admin-orders'] }); showToast('Status updated', 'success'); },
    onError:    () => showToast('Failed to update status', 'error'),
  });

  return (
    <Layout>
      <div className="admin-page">
        <h1>Orders Management</h1>

        <div className="order-filters">
          <button className={`filter-pill${filter === '' ? ' active' : ''}`} onClick={() => setFilter('')}>All</button>
          {STATUSES.map((s) => (
            <button key={s} className={`filter-pill${filter === s ? ' active' : ''}`}
              onClick={() => setFilter(s)}>{s.replace('_', ' ')}</button>
          ))}
        </div>

        {isLoading ? <p className="admin-loading">Loading...</p> :
          orders.length === 0 ? <div className="orders-empty"><span>📋</span><p>No orders found.</p></div> : (
            <div className="orders-list">
              {orders.map((order) => (
                <div key={order.id} className="order-card">
                  <div className="order-card-head">
                    <div>
                      <span className="order-id">Order #{order.id}</span>
                      <span className="order-customer">👤 {order.user.name}</span>
                      <span className="order-date">
                        {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <span className={`order-status ${STATUS_CLASS[order.status]}`}>
                      {order.status.replace('_', ' ')}
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
                    <span className="order-total">₹{parseFloat(order.totalAmount).toFixed(2)}</span>
                    {NEXT[order.status] && (
                      <button className="order-advance-btn" disabled={statusMut.isPending}
                        onClick={() => statusMut.mutate({ id: order.id, status: NEXT[order.status] })}>
                        → {NEXT[order.status].replace('_', ' ')}
                      </button>
                    )}
                    {order.status === 'PLACED' && (
                      <button className="btn-danger"
                        onClick={() => statusMut.mutate({ id: order.id, status: 'CANCELLED' })}>
                        Cancel
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
      </div>
    </Layout>
  );
}