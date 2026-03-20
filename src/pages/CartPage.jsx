import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { removeItem, updateQuantity, clearCart } from '../store/cartSlice';
import { ordersApi } from '../api/orders.api';
import { useToast } from '../components/Toast';
import Layout from '../components/Layout';
import '../styles/cart.css';

export default function CartPage() {
  const dispatch      = useDispatch();
  const navigate      = useNavigate();
  const { showToast } = useToast();
  const items         = useSelector((s) => s.cart.items);

  const [address, setAddress] = useState('');
  const [note, setNote]       = useState('');
  const [loading, setLoading] = useState(false);

  const total = items.reduce((sum, i) => sum + i.price * i.quantity, 0);

  const handlePlaceOrder = async () => {
    if (!address.trim()) { showToast('Please enter a delivery address', 'error'); return; }
    setLoading(true);
    try {
      await ordersApi.create({
        items:   items.map((i) => ({ menuItemId: i.menuItemId, quantity: i.quantity })),
        address: address.trim(),
        note:    note.trim() || undefined,
      });
      dispatch(clearCart());
      showToast('Order placed successfully!', 'success');
      navigate('/orders');
    } catch {
      showToast('Failed to place order. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <Layout>
        <div className="cart-empty">
          <span>🛒</span>
          <h2>Your cart is empty</h2>
          <button onClick={() => navigate('/menu')}>Browse menu</button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="cart-page">
        <h1>Your Cart</h1>
        <div className="cart-layout">
          <div className="cart-items">
            {items.map((item) => (
              <div key={item.menuItemId} className="cart-item">
                <div className="cart-item-img">
                  {item.image ? <img src={item.image} alt={item.name} /> : <span>🍽️</span>}
                </div>
                <div className="cart-item-info">
                  <h3>{item.name}</h3>
                  <p>₹{item.price.toFixed(2)} each</p>
                </div>
                <div className="cart-item-qty">
                  <button onClick={() => dispatch(updateQuantity({ menuItemId: item.menuItemId, quantity: item.quantity - 1 }))}>−</button>
                  <span>{item.quantity}</span>
                  <button onClick={() => dispatch(updateQuantity({ menuItemId: item.menuItemId, quantity: item.quantity + 1 }))}>+</button>
                </div>
                <span className="cart-item-sub">₹{(item.price * item.quantity).toFixed(2)}</span>
                <button className="cart-item-remove" onClick={() => dispatch(removeItem(item.menuItemId))}>×</button>
              </div>
            ))}
          </div>

          <div className="cart-summary">
            <h2>Order Summary</h2>
            <div className="cart-total">
              <span>Total</span>
              <strong>₹{total.toFixed(2)}</strong>
            </div>
            <div className="cart-field">
              <label>Delivery address *</label>
              <textarea placeholder="Enter full address..." value={address}
                onChange={(e) => setAddress(e.target.value)} rows={3} />
            </div>
            <div className="cart-field">
              <label>Note <span>(optional)</span></label>
              <textarea placeholder="Special instructions..." value={note}
                onChange={(e) => setNote(e.target.value)} rows={2} />
            </div>
            <button className="cart-place-btn" onClick={handlePlaceOrder} disabled={loading}>
              {loading ? 'Placing order...' : 'Place order'}
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
}