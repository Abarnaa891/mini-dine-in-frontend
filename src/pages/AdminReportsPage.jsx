import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { reportsApi } from '../api/reports.api';
import Layout from '../components/Layout';
import '../styles/admin.css';
import '../styles/reports.css';

const STATUS_COLORS = {
  PLACED:           '#3498db',
  PREPARING:        '#f39c12',
  READY:            '#27ae60',
  OUT_FOR_DELIVERY: '#e67e22',
  DELIVERED:        '#2ecc71',
  CANCELLED:        '#e74c3c',
};

const CAT_COLORS = ['#c8732a','#8b4513','#5c3317','#e8935a','#b85c38','#2c1a0e'];

export default function AdminReportsPage() {
  const [from, setFrom] = useState('');
  const [to,   setTo]   = useState('');

  const params = {
    ...(from && { from }),
    ...(to   && { to   }),
  };

  const { data: summary }         = useQuery({ queryKey: ['rpt-summary',   params], queryFn: () => reportsApi.getSummary(params).then((r) => r.data) });
  const { data: daily = [] }      = useQuery({ queryKey: ['rpt-daily',     params], queryFn: () => reportsApi.getDaily(params).then((r) => r.data) });
  const { data: topItems = [] }   = useQuery({ queryKey: ['rpt-top',       params], queryFn: () => reportsApi.getTopItems({ ...params, limit: 8 }).then((r) => r.data) });
  const { data: breakdown = [] }  = useQuery({ queryKey: ['rpt-breakdown', params], queryFn: () => reportsApi.getStatusBreakdown(params).then((r) => r.data) });
  const { data: drivers = [] }    = useQuery({ queryKey: ['rpt-drivers',   params], queryFn: () => reportsApi.getDriverStats(params).then((r) => r.data) });
  const { data: categories = [] } = useQuery({ queryKey: ['rpt-cats',      params], queryFn: () => reportsApi.getCategoryRevenue(params).then((r) => r.data) });

  const maxRevenue  = Math.max(...daily.map((d) => d.revenue), 1);
  const totalOrders = breakdown.reduce((s, b) => s + b.count, 0);
  const maxItemQty  = Math.max(...topItems.map((i) => i.totalQuantitySold), 1);
  const maxCatRev   = Math.max(...categories.map((c) => c.revenue), 1);

  return (
    <Layout>
      <div className="admin-page">
        <div className="rpt-head">
          <h1>Reports &amp; Analytics</h1>
          <div className="rpt-date-filter">
            <label>From</label>
            <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
            <label>To</label>
            <input type="date" value={to}   onChange={(e) => setTo(e.target.value)} />
            {(from || to) && (
              <button className="rpt-clear-btn" onClick={() => { setFrom(''); setTo(''); }}>
                Clear
              </button>
            )}
          </div>
        </div>

        {/* ── KPI Cards ── */}
        <div className="kpi-grid">
          <div className="kpi-card">
            <span className="kpi-icon">💰</span>
            <div>
              <p className="kpi-label">Total Revenue</p>
              <h2 className="kpi-value">₹{Number(summary?.totalRevenue ?? 0).toFixed(2)}</h2>
            </div>
          </div>
          <div className="kpi-card">
            <span className="kpi-icon">📦</span>
            <div>
              <p className="kpi-label">Orders Delivered</p>
              <h2 className="kpi-value">{summary?.totalOrders ?? 0}</h2>
            </div>
          </div>
          <div className="kpi-card">
            <span className="kpi-icon">🧾</span>
            <div>
              <p className="kpi-label">Avg Order Value</p>
              <h2 className="kpi-value">₹{Number(summary?.averageOrderValue ?? 0).toFixed(2)}</h2>
            </div>
          </div>
          <div className="kpi-card">
            <span className="kpi-icon">🛵</span>
            <div>
              <p className="kpi-label">Total Drivers</p>
              <h2 className="kpi-value">{drivers.length}</h2>
            </div>
          </div>
        </div>

        {/* ── Row 1: Bar chart (full width) ── */}
        <div className="report-widget report-widget--wide rpt-mb">
          <h2>Daily revenue</h2>
          {daily.length === 0 ? (
            <p className="widget-empty">No revenue data yet. Complete some orders first.</p>
          ) : (
            <div className="bar-chart">
              {daily.slice(-14).map((d) => (
                <div key={d.date} className="bar-col">
                  <div
                    className="bar-fill"
                    style={{ height: `${Math.max((d.revenue / maxRevenue) * 100, 3)}%` }}
                  >
                    <div className="bar-tooltip">
                      <strong>₹{d.revenue.toFixed(0)}</strong>
                      <span>{d.orders} order{d.orders !== 1 ? 's' : ''}</span>
                    </div>
                  </div>
                  <span className="bar-label">{d.date.slice(5)}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── Row 2: Top items + Status breakdown ── */}
        <div className="reports-grid rpt-mb">

          {/* Top items — horizontal bar */}
          <div className="report-widget">
            <h2>Top selling items</h2>
            {topItems.length === 0 ? (
              <p className="widget-empty">No sales data yet.</p>
            ) : (
              <div className="hbar-list">
                {topItems.map((item, idx) => (
                  <div key={item.menuItemId} className="hbar-row">
                    <div className="hbar-meta">
                      <span className="hbar-rank">#{idx + 1}</span>
                      <span className="hbar-name">{item.name}</span>
                      <span className="hbar-qty">{item.totalQuantitySold} sold</span>
                    </div>
                    <div className="hbar-track">
                      <div
                        className="hbar-fill"
                        style={{ width: `${(item.totalQuantitySold / maxItemQty) * 100}%` }}
                      />
                    </div>
                    <span className="hbar-revenue">₹{item.totalRevenue.toFixed(2)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Order status breakdown — progress bars */}
          <div className="report-widget">
            <h2>Order status breakdown</h2>
            {breakdown.length === 0 ? (
              <p className="widget-empty">No orders yet.</p>
            ) : (
              <div className="status-breakdown">
                {breakdown.map((b) => {
                  const pct = totalOrders > 0 ? ((b.count / totalOrders) * 100).toFixed(1) : 0;
                  return (
                    <div key={b.status} className="status-row">
                      <div className="status-row-head">
                        <span className="status-dot" style={{ background: STATUS_COLORS[b.status] || '#888' }} />
                        <span className="status-name">{b.status.replace(/_/g, ' ')}</span>
                        <span className="status-count">{b.count}</span>
                        <span className="status-pct">{pct}%</span>
                      </div>
                      <div className="status-track">
                        <div
                          className="status-fill"
                          style={{
                            width: `${pct}%`,
                            background: STATUS_COLORS[b.status] || '#888',
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* ── Row 3: Category revenue + Drivers ── */}
        <div className="reports-grid rpt-mb">

          {/* Category revenue */}
          <div className="report-widget">
            <h2>Revenue by category</h2>
            {categories.length === 0 ? (
              <p className="widget-empty">No category data yet.</p>
            ) : (
              <div className="cat-rev-list">
                {categories.map((c, idx) => (
                  <div key={c.categoryId} className="cat-rev-row">
                    <div className="cat-rev-label">
                      <span className="cat-dot" style={{ background: CAT_COLORS[idx % CAT_COLORS.length] }} />
                      <span className="cat-name">{c.name}</span>
                      <span className="cat-items">{c.items} items</span>
                    </div>
                    <div className="hbar-track">
                      <div
                        className="hbar-fill"
                        style={{
                          width: `${(c.revenue / maxCatRev) * 100}%`,
                          background: CAT_COLORS[idx % CAT_COLORS.length],
                        }}
                      />
                    </div>
                    <span className="hbar-revenue">₹{c.revenue.toFixed(2)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Driver leaderboard */}
          <div className="report-widget">
            <h2>Driver leaderboard</h2>
            {drivers.length === 0 ? (
              <p className="widget-empty">No delivery data yet.</p>
            ) : (
              <div className="driver-list">
                {drivers.map((d, idx) => (
                  <div key={d.driverId} className="driver-row">
                    <span className={`driver-rank driver-rank--${idx === 0 ? 'gold' : idx === 1 ? 'silver' : idx === 2 ? 'bronze' : 'normal'}`}>
                      {idx + 1}
                    </span>
                    <div className="driver-info">
                      <span className="driver-name">{d.driverName}</span>
                      <span className="driver-meta">{d.deliveriesCompleted} deliveries</span>
                    </div>
                    <span className="driver-revenue">₹{d.totalRevenue.toFixed(2)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}