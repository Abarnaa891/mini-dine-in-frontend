import { useQuery } from '@tanstack/react-query';
import { reportsApi } from '../api/reports.api';
import { reservationsApi } from '../api/reservation.api';
import { ordersApi } from '../api/orders.api';
import Layout from '../components/Layout';
import '../styles/admin.css';

export default function DashboardPage() {
  const { data: summary } = useQuery({
    queryKey: ['summary'],
    queryFn:  () => reportsApi.getSummary().then((r) => r.data),
  });
  const { data: topItems = [] } = useQuery({
    queryKey: ['top-items'],
    queryFn:  () => reportsApi.getTopItems({ limit: 5 }).then((r) => r.data),
  });
  const { data: upcoming = [] } = useQuery({
    queryKey: ['upcoming'],
    queryFn:  () => reservationsApi.getUpcoming().then((r) => r.data),
  });
  const { data: pending = [] } = useQuery({
    queryKey: ['pending-orders'],
    queryFn:  () => ordersApi.getAll({ status: 'PLACED' }).then((r) => r.data),
  });

  return (
    <Layout>
      <div className="admin-page">
        <h1>Dashboard</h1>

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
          <div className="kpi-card">
            <span className="kpi-icon">🔴</span>
            <div>
              <p className="kpi-label">Pending Orders</p>
              <h2 className="kpi-value">{pending.length}</h2>
            </div>
          </div>
        </div>

        <div className="admin-two-col">
          <div className="admin-widget">
            <h2>Top selling items</h2>
            {topItems.length === 0 ? <p className="widget-empty">No data yet.</p> : (
              <table className="admin-table">
                <thead><tr><th>Item</th><th>Category</th><th>Qty</th><th>Revenue</th></tr></thead>
                <tbody>
                  {topItems.map((item) => (
                    <tr key={item.menuItemId}>
                      <td>{item.name}</td>
                      <td>{item.category}</td>
                      <td>{item.totalQuantitySold}</td>
                      <td>₹{item.totalRevenue.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          <div className="admin-widget">
            <h2>Upcoming reservations (24h)</h2>
            {upcoming.length === 0 ? <p className="widget-empty">None upcoming.</p> : (
              <div className="res-mini-list">
                {upcoming.map((r) => (
                  <div key={r.id} className="res-mini">
                    <div>
                      <strong>{r.user.name}</strong>
                      <span>{new Date(r.date).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <div>
                      <span>👥 {r.partySize}</span>
                      {r.tableNumber && <span>🪑 Table {r.tableNumber}</span>}
                    </div>
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