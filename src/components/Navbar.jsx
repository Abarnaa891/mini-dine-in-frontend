import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { clearAuth } from '../store/authSlice';
import '../styles/navbar.css';

export default function Navbar() {
  const dispatch  = useDispatch();
  const navigate  = useNavigate();
  const location  = useLocation();
  const user      = useSelector((s) => s.auth.user);
  const cartCount = useSelector((s) =>
    s.cart.items.reduce((sum, i) => sum + i.quantity, 0)
  );

  const active = (path) => location.pathname.startsWith(path) ? 'active' : '';

  const logout = () => {
    dispatch(clearAuth());
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <Link to="/" className="navbar-brand">
        <span>☕</span> Mini-Dine
      </Link>

      <div className="navbar-links">
        {user?.role === 'CUSTOMER' && (
          <>
            <Link to="/menu"         className={active('/menu')}>Menu</Link>
            <Link to="/cart"         className={active('/cart')}>
              Cart {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
            </Link>
            <Link to="/orders"       className={active('/orders')}>Orders</Link>
            <Link to="/reservations" className={active('/reservations')}>Reservations</Link>
          </>
        )}
        {user?.role === 'ADMIN' && (
          <>
            <Link to="/admin/dashboard"    className={active('/admin/dashboard')}>Dashboard</Link>
            <Link to="/admin/menu"         className={active('/admin/menu')}>Menu</Link>
            <Link to="/admin/orders"       className={active('/admin/orders')}>Orders</Link>
            <Link to="/admin/reservations" className={active('/admin/reservations')}>Reservations</Link>
            <Link to="/admin/reports"      className={active('/admin/reports')}>Reports</Link>
          </>
        )}
        {user?.role === 'KITCHEN'  && <Link to="/kitchen"  className={active('/kitchen')}>Kitchen Board</Link>}
        {user?.role === 'DELIVERY' && <Link to="/delivery" className={active('/delivery')}>My Runs</Link>}
      </div>

      <div className="navbar-user">
        {user && (
          <>
            <span className="navbar-name">{user.name}</span>
            <span className={`navbar-role role-${user.role.toLowerCase()}`}>{user.role}</span>
            <button onClick={logout} className="navbar-logout">Logout</button>
          </>
        )}
      </div>
    </nav>
  );
}