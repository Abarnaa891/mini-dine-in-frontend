import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useDispatch } from 'react-redux';
import { menuApi } from '../api/menu.api';
import { addItem } from '../store/cartSlice';
import { useToast } from '../components/Toast';
import Layout from '../components/Layout';
import '../styles/menu.css';

export default function MenuPage() {
  const dispatch        = useDispatch();
  const { showToast }   = useToast();
  const [activeCat, setActiveCat] = useState(null);
  const [search, setSearch]       = useState('');

  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: () => menuApi.getCategories().then((r) => r.data),
  });

  const { data: items = [], isLoading } = useQuery({
    queryKey: ['menu', activeCat, search],
    queryFn: () =>
      menuApi.getItems({
        categoryId:  activeCat ?? undefined,
        search:      search || undefined,
        isAvailable: true,
      }).then((r) => r.data),
  });

  const handleAdd = (item) => {
    dispatch(addItem({ menuItemId: item.id, name: item.name, price: parseFloat(item.price), image: item.image }));
    showToast(`${item.name} added to cart`, 'success');
  };

  return (
    <Layout>
      <div className="menu-page">
        <div className="menu-header">
          <h1>Our Menu</h1>
          <input className="menu-search" placeholder="Search dishes..."
            value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>

        <div className="menu-cats">
          <button className={`cat-pill${activeCat === null ? ' active' : ''}`}
            onClick={() => setActiveCat(null)}>All</button>
          {categories.map((c) => (
            <button key={c.id} className={`cat-pill${activeCat === c.id ? ' active' : ''}`}
              onClick={() => setActiveCat(c.id)}>{c.name}</button>
          ))}
        </div>

        {isLoading ? (
          <div className="menu-loading">Loading menu...</div>
        ) : items.length === 0 ? (
          <div className="menu-empty">No items found.</div>
        ) : (
          <div className="menu-grid">
            {items.map((item) => (
              <div key={item.id} className="menu-card">
                <div className="menu-card-img">
                  {item.image
                    ? <img src={item.image} alt={item.name} />
                    : <div className="menu-card-placeholder">🍽️</div>}
                </div>
                <div className="menu-card-body">
                  <span className="menu-card-cat">{item.category.name}</span>
                  <h3 className="menu-card-name">{item.name}</h3>
                  {item.description && <p className="menu-card-desc">{item.description}</p>}
                  <div className="menu-card-footer">
                    <span className="menu-card-price">₹{parseFloat(item.price).toFixed(2)}</span>
                    <button className="menu-card-btn" onClick={() => handleAdd(item)}>Add to cart</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}