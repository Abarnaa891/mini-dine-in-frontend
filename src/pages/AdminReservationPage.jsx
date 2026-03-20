import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { reservationsApi } from '../api/reservation.api';
import { useToast } from '../components/Toast';
import Layout from '../components/Layout';
import '../styles/admin.css';
import '../styles/reservation.css';

const statusClass = (s) =>
  s === 'CONFIRMED' ? 'res-confirmed' : s === 'CANCELLED' ? 'res-cancelled' : 'res-pending';

export default function AdminReservationsPage() {
  const qc            = useQueryClient();
  const { showToast } = useToast();
  const [tableInputs, setTableInputs] = useState({});

  const { data: reservations = [], isLoading } = useQuery({
    queryKey: ['admin-reservations'],
    queryFn:  () => reservationsApi.getAll().then((r) => r.data),
  });

  const updateMut = useMutation({
    mutationFn: ({ id, data }) => reservationsApi.update(id, data),
    onSuccess:  () => { qc.invalidateQueries({ queryKey: ['admin-reservations'] }); showToast('Updated', 'success'); },
    onError:    () => showToast('Failed to update', 'error'),
  });

  const pending   = reservations.filter((r) => r.status === 'PENDING');
  const confirmed = reservations.filter((r) => r.status === 'CONFIRMED');
  const cancelled = reservations.filter((r) => r.status === 'CANCELLED');

  const ResCard = ({ r }) => (
    <div className="res-card">
      <div className="res-card-head">
        <div>
          <strong>{r.user.name}</strong>
          <span className="res-date">
            {new Date(r.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
            {' '}{new Date(r.date).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
        <span className={`res-status ${statusClass(r.status)}`}>{r.status}</span>
      </div>
      <div className="res-card-body">
        <span>👥 {r.partySize}</span>
        {r.tableNumber && <span>🪑 Table {r.tableNumber}</span>}
        {r.note && <span>📝 {r.note}</span>}
      </div>
      {r.status === 'PENDING' && (
        <div className="res-admin-actions">
          <input type="number" min={1} placeholder="Table #"
            style={{ width: 80, padding: '4px 8px', borderRadius: 6, border: '1.5px solid #dfd0bc' }}
            value={tableInputs[r.id] || ''}
            onChange={(e) => setTableInputs((p) => ({ ...p, [r.id]: e.target.value }))} />
          <button className="admin-btn-primary"
            onClick={() => updateMut.mutate({ id: r.id, data: { tableNumber: +tableInputs[r.id], status: 'CONFIRMED' } })}>
            Confirm
          </button>
          <button className="btn-danger"
            onClick={() => updateMut.mutate({ id: r.id, data: { status: 'CANCELLED' } })}>
            Cancel
          </button>
        </div>
      )}
    </div>
  );

  if (isLoading) return <Layout><div className="admin-page"><p className="admin-loading">Loading...</p></div></Layout>;

  return (
    <Layout>
      <div className="admin-page">
        <h1>Reservations</h1>
        <div className="admin-two-col">
          <div>
            <h2 className="section-title">Pending ({pending.length})</h2>
            {pending.length === 0 ? <p className="widget-empty">None pending.</p>
              : pending.map((r) => <ResCard key={r.id} r={r} />)}
          </div>
          <div>
            <h2 className="section-title">Confirmed ({confirmed.length})</h2>
            {confirmed.length === 0 ? <p className="widget-empty">None confirmed.</p>
              : confirmed.map((r) => <ResCard key={r.id} r={r} />)}
          </div>
        </div>
        {cancelled.length > 0 && (
          <div>
            <h2 className="section-title">Cancelled</h2>
            <div className="res-list">{cancelled.map((r) => <ResCard key={r.id} r={r} />)}</div>
          </div>
        )}
      </div>
    </Layout>
  );
}