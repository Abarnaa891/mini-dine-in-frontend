import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { reservationsApi } from '../api/reservation.api';
import { useToast } from '../components/Toast';
import Layout from '../components/Layout';
import '../styles/reservation.css';

const statusClass = (s) =>
  s === 'CONFIRMED' ? 'res-confirmed' : s === 'CANCELLED' ? 'res-cancelled' : 'res-pending';

export default function ReservationsPage() {
  const qc            = useQueryClient();
  const { showToast } = useToast();

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ date: '', time: '19:00', partySize: 2, note: '' });

  const { data: reservations = [], isLoading } = useQuery({
    queryKey: ['my-reservations'],
    queryFn:  () => reservationsApi.getMy().then((r) => r.data),
  });

  const createMut = useMutation({
    mutationFn: (data) => reservationsApi.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['my-reservations'] });
      showToast('Reservation requested!', 'success');
      setShowForm(false);
      setForm({ date: '', time: '19:00', partySize: 2, note: '' });
    },
    onError: (err) => showToast(err?.response?.data?.message || 'Failed to book.', 'error'),
  });

  const cancelMut = useMutation({
    mutationFn: (id) => reservationsApi.cancel(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['my-reservations'] });
      showToast('Reservation cancelled.', 'info');
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.date) { showToast('Please select a date', 'error'); return; }
    const isoDate = new Date(`${form.date}T${form.time}:00`).toISOString();
    createMut.mutate({ date: isoDate, partySize: form.partySize, note: form.note || undefined });
  };

  return (
    <Layout>
      <div className="res-page">
        <div className="res-head">
          <h1>Reservations</h1>
          <button className="res-new-btn" onClick={() => setShowForm((p) => !p)}>
            {showForm ? 'Cancel' : '+ New Reservation'}
          </button>
        </div>

        {showForm && (
          <form className="res-form" onSubmit={handleSubmit}>
            <h2>Book a table</h2>
            <div className="res-form-row">
              <div className="res-field">
                <label>Date</label>
                <input type="date" value={form.date}
                  min={new Date().toISOString().split('T')[0]}
                  onChange={(e) => setForm((p) => ({ ...p, date: e.target.value }))} />
              </div>
              <div className="res-field">
                <label>Time</label>
                <input type="time" value={form.time}
                  onChange={(e) => setForm((p) => ({ ...p, time: e.target.value }))} />
              </div>
              <div className="res-field">
                <label>Party size</label>
                <input type="number" min={1} max={20} value={form.partySize}
                  onChange={(e) => setForm((p) => ({ ...p, partySize: +e.target.value }))} />
              </div>
            </div>
            <div className="res-field">
              <label>Note <span>(optional)</span></label>
              <textarea placeholder="Window seat, anniversary, etc." value={form.note}
                onChange={(e) => setForm((p) => ({ ...p, note: e.target.value }))} rows={2} />
            </div>
            <button type="submit" className="res-submit-btn" disabled={createMut.isPending}>
              {createMut.isPending ? 'Booking...' : 'Book table'}
            </button>
          </form>
        )}

        {isLoading ? (
          <p className="res-loading">Loading...</p>
        ) : reservations.length === 0 ? (
          <div className="res-empty"><span>📅</span><p>No reservations yet.</p></div>
        ) : (
          <div className="res-list">
            {reservations.map((r) => (
              <div key={r.id} className="res-card">
                <div className="res-card-head">
                  <div>
                    <span className="res-date">
                      {new Date(r.date).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}
                    </span>
                    <span className="res-time">
                      {new Date(r.date).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <span className={`res-status ${statusClass(r.status)}`}>{r.status}</span>
                </div>
                <div className="res-card-body">
                  <span>👥 {r.partySize} guests</span>
                  {r.tableNumber && <span>🪑 Table {r.tableNumber}</span>}
                  {r.note && <span>📝 {r.note}</span>}
                </div>
                {r.status === 'PENDING' && (
                  <button className="res-cancel-btn"
                    onClick={() => cancelMut.mutate(r.id)}
                    disabled={cancelMut.isPending}>
                    Cancel
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}