import { useQuery } from '@tanstack/react-query';
import { reportsApi } from '../api/reports.api';
import Layout from '../components/Layout';
import '../styles/admin.css';
import '../styles/reports.css';

export default function AdminReportsPage() {
  const { data: summary }         = useQuery({ queryKey: ['rpt-summary'],   queryFn: () => reportsApi.getSummary().then((r) => r.data) });
  const { data: daily = [] }      = useQuery({ queryKey: ['rpt-daily'],     queryFn: () => reportsApi.getDaily().then((r) => r.data) });
  const { data: topItems = [] }   = useQuery({ queryKey: ['rpt-top'],       queryFn: () => reportsApi.getTopItems({ limit: 10 }).then((r) => r.data) });
  const { data: breakdown = [] }  = useQuery({ queryKey: ['rpt-breakdown'], queryFn: () => reportsApi.getStatusBreakdown().then((r) => r.data) });
  const { data: drivers = [] }    = useQuery({ queryKey: ['rpt-drivers'],   queryFn: () => reportsApi.getDriverStats().then((r) => r.data) });
  const { data: categories = [] } = useQuery({ queryKey: ['rpt-cats'],      queryFn: () => reportsApi.getCategoryRevenue().then((r) => r.data) });

  const maxRevenue = Math.max(...daily.map((d) => d.revenue), 1);

  return (
    <Layout>
      <div className="admin-page">
        <h1>Reports & Analytics</h1>

        <div className="kpi-grid">
          <div className="kpi-card">
            <span className="kpi-icon">💰</span>
            <div><p className="kpi-label">Total Revenue</p><h2 className="kpi-value">₹{Number(summary?.totalRevenue ?? 0).toFixed(2)}</h2></div>
          </div>
          <div className="kpi-card">
            <span className="kpi-icon">📦</span>
            <div><p className="kpi-label">Total Orders</p><h2 className="kpi-value">{summary?.totalOrders ?? 0}</h2></div>
          </div>
          <div className="kpi-card">
            <span className="kpi-icon">🧾</span>
            <div><p className="kpi-label">Avg Order Value</p><h2 className="kpi-value">₹{Number(summary?.averageOrderValue ?? 0).toFixed(2)}</h2></div>
          </div>
        </div>

        <div className="reports-grid">
          <div className="report-widget report-widget--wide">
            <h2>Daily revenue (last 14 days)</h2>
            {daily.length === 0 ? <p className="widget-empty">No data yet.</p> : (
              <div className="bar-chart">
                {daily.slice(-14).map((d) => (
                  <div key={d.date} className="bar-col">
                    <div className="bar-fill" style={{ height: `${(d.revenue / maxRevenue) * 100}%` }}>
                      <span className="bar-tooltip">₹{d.revenue.toFixed(0)}<br />{d.orders} orders</span>
                    </div>
                    <span className="bar-label">{d.date.slice(5)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="report-widget">
            <h2>Top selling items</h2>
            <table className="admin-table">
              <thead><tr><th>Item</th><th>Qty</th><th>Revenue</th></tr></thead>
              <tbody>
                {topItems.map((i) => (
                  <tr key={i.menuItemId}><td>{i.name}</td><td>{i.totalQuantitySold}</td><td>₹{i.totalRevenue.toFixed(2)}</td></tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="report-widget">
            <h2>Order status breakdown</h2>
            <div className="breakdown-list">
              {breakdown.map((b) => (
                <div key={b.status} className="breakdown-row">
                  <span>{b.status.replace('_', ' ')}</span>
                  <strong>{b.count}</strong>
                </div>
              ))}
            </div>
          </div>

          <div className="report-widget">
            <h2>Revenue by category</h2>
            <table className="admin-table">
              <thead><tr><th>Category</th><th>Items</th><th>Revenue</th></tr></thead>
              <tbody>
                {categories.map((c) => (
                  <tr key={c.categoryId}><td>{c.name}</td><td>{c.items}</td><td>₹{c.revenue.toFixed(2)}</td></tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="report-widget">
            <h2>Driver performance</h2>
            {drivers.length === 0 ? <p className="widget-empty">No deliveries yet.</p> : (
              <table className="admin-table">
                <thead><tr><th>Driver</th><th>Deliveries</th><th>Revenue</th></tr></thead>
                <tbody>
                  {drivers.map((d) => (
                    <tr key={d.driverId}><td>{d.driverName}</td><td>{d.deliveriesCompleted}</td><td>₹{d.totalRevenue.toFixed(2)}</td></tr>
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