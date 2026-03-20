import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { menuApi } from '../api/menu.api';
import { useToast } from '../components/Toast';
import Layout from '../components/Layout';
import '../styles/admin.css';

const emptyForm = { name: '', description: '', price: '', categoryId: '', image: '', isAvailable: true };

export default function AdminMenuPage() {
  const qc            = useQueryClient();
  const { showToast } = useToast();

  const [activeCat, setActiveCat]   = useState(null);
  const [showForm, setShowForm]     = useState(false);
  const [editItem, setEditItem]     = useState(null);
  const [form, setForm]             = useState(emptyForm);

  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn:  () => menuApi.getCategories().then((r) => r.data),
  });

  const { data: items = [], isLoading } = useQuery({
    queryKey: ['admin-menu', activeCat],
    queryFn:  () => menuApi.getItems({ categoryId: activeCat ?? undefined }).then((r) => r.data),
  });

  const resetForm = () => { setForm(emptyForm); setEditItem(null); setShowForm(false); };

  const createMut = useMutation({
    mutationFn: (data) => menuApi.createItem(data),
    onSuccess:  () => { qc.invalidateQueries({ queryKey: ['admin-menu'] }); showToast('Item created', 'success'); resetForm(); },
    onError:    () => showToast('Failed to create item', 'error'),
  });

  const updateMut = useMutation({
    mutationFn: ({ id, data }) => menuApi.updateItem(id, data),
    onSuccess:  () => { qc.invalidateQueries({ queryKey: ['admin-menu'] }); showToast('Item updated', 'success'); resetForm(); },
    onError:    () => showToast('Failed to update item', 'error'),
  });

  const toggleMut = useMutation({
    mutationFn: (id) => menuApi.toggleAvailability(id),
    onSuccess:  () => qc.invalidateQueries({ queryKey: ['admin-menu'] }),
  });

  const deleteMut = useMutation({
    mutationFn: (id) => menuApi.deleteItem(id),
    onSuccess:  () => { qc.invalidateQueries({ queryKey: ['admin-menu'] }); showToast('Item removed', 'info'); },
  });

  const openEdit = (item) => {
    setEditItem(item);
    setForm({ name: item.name, description: item.description || '', price: item.price,
      categoryId: String(item.categoryId), image: item.image || '', isAvailable: item.isAvailable });
    setShowForm(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = {
      name: form.name, description: form.description || undefined,
      price: parseFloat(form.price), categoryId: parseInt(form.categoryId),
      image: form.image || undefined, isAvailable: form.isAvailable,
    };
    editItem ? updateMut.mutate({ id: editItem.id, data: payload }) : createMut.mutate(payload);
  };

  return (
    <Layout>
      <div className="admin-page">
        <div className="admin-page-head">
          <h1>Menu Management</h1>
          <button className="admin-btn-primary" onClick={() => { resetForm(); setShowForm((p) => !p); }}>
            {showForm ? 'Cancel' : '+ Add Item'}
          </button>
        </div>

        {showForm && (
          <form className="admin-form" onSubmit={handleSubmit}>
            <h2>{editItem ? 'Edit item' : 'New menu item'}</h2>
            <div className="admin-form-grid">
              <div className="admin-field">
                <label>Name *</label>
                <input required value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} />
              </div>
              <div className="admin-field">
                <label>Category *</label>
                <select required value={form.categoryId} onChange={(e) => setForm((p) => ({ ...p, categoryId: e.target.value }))}>
                  <option value="">Select category</option>
                  {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div className="admin-field">
                <label>Price (₹) *</label>
                <input type="number" step="0.01" required value={form.price}
                  onChange={(e) => setForm((p) => ({ ...p, price: e.target.value }))} />
              </div>
              <div className="admin-field">
                <label>Image URL</label>
                <input value={form.image} onChange={(e) => setForm((p) => ({ ...p, image: e.target.value }))} />
              </div>
              <div className="admin-field admin-field--full">
                <label>Description</label>
                <textarea rows={2} value={form.description}
                  onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} />
              </div>
              <div className="admin-field admin-field--check">
                <label>
                  <input type="checkbox" checked={form.isAvailable}
                    onChange={(e) => setForm((p) => ({ ...p, isAvailable: e.target.checked }))} />
                  Available
                </label>
              </div>
            </div>
            <div className="admin-form-actions">
              <button type="button" onClick={resetForm}>Cancel</button>
              <button type="submit" className="admin-btn-primary"
                disabled={createMut.isPending || updateMut.isPending}>
                {editItem ? 'Save changes' : 'Create item'}
              </button>
            </div>
          </form>
        )}

        <div className="menu-cats">
          <button className={`cat-pill${activeCat === null ? ' active' : ''}`} onClick={() => setActiveCat(null)}>All</button>
          {categories.map((c) => (
            <button key={c.id} className={`cat-pill${activeCat === c.id ? ' active' : ''}`}
              onClick={() => setActiveCat(c.id)}>{c.name}</button>
          ))}
        </div>

        {isLoading ? <p className="admin-loading">Loading...</p> : (
          <table className="admin-table admin-table--full">
            <thead><tr><th>Name</th><th>Category</th><th>Price</th><th>Available</th><th>Actions</th></tr></thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id}>
                  <td><strong>{item.name}</strong><br /><small>{item.description}</small></td>
                  <td>{item.category.name}</td>
                  <td>₹{parseFloat(item.price).toFixed(2)}</td>
                  <td>
                    <button className={`toggle-btn ${item.isAvailable ? 'toggle-on' : 'toggle-off'}`}
                      onClick={() => toggleMut.mutate(item.id)}>
                      {item.isAvailable ? 'Yes' : 'No'}
                    </button>
                  </td>
                  <td className="admin-actions">
                    <button onClick={() => openEdit(item)}>Edit</button>
                    <button className="btn-danger" onClick={() => deleteMut.mutate(item.id)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </Layout>
  );
}