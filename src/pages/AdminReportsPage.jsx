import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { reportsApi } from '../../api/reports.api';
import Layout from '../../components/Layout';
import '../../styles/admin.css';
import '../../styles/reports.css';

export default function AdminReportsPage() {
  const [from, setFrom] = useState('');
  const [to,   setTo]   = useState('');

  const params = {
    ...(from && { from }),
    ...(to   && { to   }),
  };

  const hasFilter = from || to;

  const clearFilter = () => { setFrom(''); setTo(''); };

  const { data: summary }         = useQuery({ queryKey: ['rpt-summary',   params], queryFn: () => reportsApi.getSummary(params).then((r) => r.data) });
  const { data: daily = [] }      = useQuery({ queryKey: ['rpt-daily',     params], queryFn: () => reportsApi.getDaily(params).then((r) => r.data) });
  const { data: topItems = [] }   = useQuery({ queryKey: ['rpt-top',       params], queryFn: () => reportsApi.getTopItems({ ...params, limit: 10 }).then((r) => r.data) });
  const { data: breakdown = [] }  = useQuery({ queryKey: ['rpt-breakdown', params], queryFn: () => reportsApi.getStatusBreakdown(params).then((r) => r.data) });
  const { data: drivers = [] }    = useQuery({ queryKey: ['rpt-drivers',   params], queryFn: () => reportsApi.getDriverStats(params).then((r) => r.data) });
  const { data: categories = [] } = useQuery({ queryKey: ['rpt-cats',      params], queryFn: () => reportsApi.getCategoryRevenue(params).then((r) => r.data) });

  const maxRevenue = Math.max(...daily.map((d) => d.revenue), 1);

  return (
    <Layout>
      <div className="admin-page">

        {/* ── Header + Date Filter ── */}
        <div className="rpt-head">
          <h1>Reports &amp; Analytics</h1>

          <div className="rpt-date-filter">
            <div className="rpt-filter-group">
              <label htmlFor="rpt-from">From</label>
              <input
                id="rpt-from"
                type="date"
                value={from}
                max={to || undefined}
                onChange={(e) => setFrom(e.target.value)}
              />
            </div>
            <div className="rpt-filter-group">
              <label htmlFor="rpt-to">To</label>
              <input
                id="rpt-to"
                type="date"
                value={to}
                min={from || undefined}
                onChange={(e) => setTo(e.target.value)}
              />
            </div>
            {hasFilter && (
              <button className="rpt-clear-btn" onClick={clearFilter}>
                ✕ Clear
              </button>
            )}
            {hasFilter && (
              <span className="rpt-filter-badge">
                Filtered: {from || '…'} → {to || '…'}
              </span>
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
              <p className="kpi-label">Total Orders</p>
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
        </div>

        {/* ── Daily Revenue Bar Chart ── */}
        <div className="reports-grid">
          <div className="report-widget report-widget--wide">
            <h2>Daily revenue {hasFilter ? `(${from || '…'} → ${to || '…'})` : '(last 14 days)'}</h2>
            {daily.length === 0 ? (
              <p className="widget-empty">No data for selected period.</p>
            ) : (
              <div className="bar-chart">
                {daily.slice(-14).map((d) => (
                  <div key={d.date} className="bar-col">
                    <div
                      className="bar-fill"
                      style={{ height: `${Math.max((d.revenue / maxRevenue) * 100, 3)}%` }}
                    >
                      <span className="bar-tooltip">
                        ₹{d.revenue.toFixed(0)}<br />{d.orders} orders
                      </span>
                    </div>
                    <span className="bar-label">{d.date.slice(5)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ── Top Items ── */}
          <div className="report-widget">
            <h2>Top selling items</h2>
            {topItems.length === 0 ? (
              <p className="widget-empty">No data for selected period.</p>
            ) : (
              <table className="admin-table">
                <thead>
                  <tr><th>Item</th><th>Qty</th><th>Revenue</th></tr>
                </thead>
                <tbody>
                  {topItems.map((i) => (
                    <tr key={i.menuItemId}>
                      <td>{i.name}</td>
                      <td>{i.totalQuantitySold}</td>
                      <td>₹{i.totalRevenue.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* ── Status Breakdown ── */}
          <div className="report-widget">
            <h2>Order status breakdown</h2>
            {breakdown.length === 0 ? (
              <p className="widget-empty">No data for selected period.</p>
            ) : (
              <div className="breakdown-list">
                {breakdown.map((b) => (
                  <div key={b.status} className="breakdown-row">
                    <span>{b.status.replace(/_/g, ' ')}</span>
                    <strong>{b.count}</strong>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ── Category Revenue ── */}
          <div className="report-widget">
            <h2>Revenue by category</h2>
            {categories.length === 0 ? (
              <p className="widget-empty">No data for selected period.</p>
            ) : (
              <table className="admin-table">
                <thead>
                  <tr><th>Category</th><th>Items</th><th>Revenue</th></tr>
                </thead>
                <tbody>
                  {categories.map((c) => (
                    <tr key={c.categoryId}>
                      <td>{c.name}</td>
                      <td>{c.items}</td>
                      <td>₹{c.revenue.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* ── Driver Performance ── */}
          <div className="report-widget">
            <h2>Driver performance</h2>
            {drivers.length === 0 ? (
              <p className="widget-empty">No deliveries for selected period.</p>
            ) : (
              <table className="admin-table">
                <thead>
                  <tr><th>Driver</th><th>Deliveries</th><th>Revenue</th></tr>
                </thead>
                <tbody>
                  {drivers.map((d) => (
                    <tr key={d.driverId}>
                      <td>{d.driverName}</td>
                      <td>{d.deliveriesCompleted}</td>
                      <td>₹{d.totalRevenue.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}