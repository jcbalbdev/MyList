import React, { useEffect, useState } from 'react';
import CategorySelector from './CategorySelector.jsx';
import ListManager from './ListManager.jsx';
import ErrorBanner from './ErrorBanner.jsx';
import { USERS, CATEGORIES, SENTIMENTS, STORAGE_KEYS } from '../config/constants.js';
import { fetchItems, addItem, updateSentiment, deleteItem } from '../services/api.js';

// ── Helpers de caché ──────────────────────────────────────────────────────────
function loadCache() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.ITEMS_CACHE);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function saveCache(items) {
  try {
    localStorage.setItem(STORAGE_KEYS.ITEMS_CACHE, JSON.stringify(items));
  } catch {}
}
// ─────────────────────────────────────────────────────────────────────────────

export default function DashboardApp() {
  const [user, setUser]               = useState(null);
  const [items, setItems]             = useState(() => loadCache() || []);
  const [listLoading, setListLoading] = useState(!loadCache());
  const [error, setError]             = useState(null);

  // ── Búsqueda y filtros ────────────────────────────────────────────────────
  const [search, setSearch]                   = useState('');
  const [filterCategory, setFilterCategory]   = useState('');
  const [filterSentiment, setFilterSentiment] = useState('');

  // ── Identificar usuario ───────────────────────────────────────────────────
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
    if (!stored) {
      window.location.href = '/';
    } else {
      setUser(stored);
    }
  }, []);

  // ── Stale-While-Revalidate ────────────────────────────────────────────────
  useEffect(() => {
    if (!user) return;
    fetchItems()
      .then(fresh => { setItems(fresh); saveCache(fresh); setError(null); })
      .catch(() => { if (!loadCache()) setError('Sin conexión. Intenta recargar.'); })
      .finally(() => setListLoading(false));
  }, [user]);

  // ── Mutaciones (optimistic + sync) ───────────────────────────────────────
  const handleAddTitle = async ({ title, category }) => {
    const newItem = {
      id: Date.now().toString(),
      title,
      category,
      createdBy: user,
      sentiments: { [USERS.USER_A]: 'PENDING', [USERS.USER_B]: 'PENDING' }
    };
    const updated = [newItem, ...items];
    setItems(updated);
    saveCache(updated);
    try {
      await addItem(newItem);
    } catch {
      const reverted = items.filter(i => i.id !== newItem.id);
      setItems(reverted);
      saveCache(reverted);
      setError('Error al guardar. Intenta de nuevo.');
    }
  };

  const handleChangeSentiment = async (id, newSentiment) => {
    const updated = items.map(item =>
      item.id === id
        ? { ...item, sentiments: { ...item.sentiments, [user]: newSentiment } }
        : item
    );
    setItems(updated);
    saveCache(updated);
    try {
      await updateSentiment(id, user, newSentiment);
    } catch {
      setError('Error al actualizar. Intenta de nuevo.');
    }
  };

  const handleDeleteItem = async (id) => {
    const updated = items.filter(item => item.id !== id);
    setItems(updated);
    saveCache(updated);
    try {
      await deleteItem(id);
    } catch {
      setError('Error al eliminar. Recarga la página.');
    }
  };

  if (!user) return null;

  const userColor = user === USERS.USER_A ? 'var(--color-pelis)' : 'var(--color-anime)';
  const hasActiveFilters = search || filterCategory || filterSentiment;

  return (
    <div className="app-container">
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1>Hola, <span style={{ color: userColor }}>{user}</span></h1>
        <button
          onClick={() => {
            localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
            window.location.href = '/';
          }}
          style={{ background: 'transparent', color: 'var(--text-muted)', textDecoration: 'underline' }}
        >
          Cambiar perfil
        </button>
      </header>

      <ErrorBanner message={error} onClose={() => setError(null)} />

      {/* Selector de categoría para agregar títulos */}
      <CategorySelector onAddTitle={handleAddTitle} />

      {/* ── Barra de búsqueda y filtros (fuera del panel) ──────────────── */}
      <div className="search-filter-bar">
        {/* Buscador */}
        <div className="search-input-wrap">
          <svg className="search-icon" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input
            id="search-input"
            type="text"
            placeholder="Buscar título..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="search-input"
          />
          {search && (
            <button className="search-clear" onClick={() => setSearch('')} title="Limpiar búsqueda">×</button>
          )}
        </div>

        {/* Filtro por categoría */}
        <select
          id="filter-category"
          value={filterCategory}
          onChange={e => setFilterCategory(e.target.value)}
          className="filter-select"
        >
          <option value="">Todas las categorías</option>
          {Object.values(CATEGORIES).map(cat => (
            <option key={cat.id} value={cat.id}>{cat.label}</option>
          ))}
        </select>

        {/* Filtro por sentimiento */}
        <select
          id="filter-sentiment"
          value={filterSentiment}
          onChange={e => setFilterSentiment(e.target.value)}
          className="filter-select"
        >
          <option value="">Cualquier estado</option>
          {Object.entries(SENTIMENTS).map(([key, s]) => (
            <option key={key} value={key}>{s.label}</option>
          ))}
        </select>

        {/* Botón limpiar — solo visible cuando hay algo activo */}
        {hasActiveFilters && (
          <button
            className="filter-clear-btn"
            onClick={() => { setSearch(''); setFilterCategory(''); setFilterSentiment(''); }}
          >
            Limpiar
          </button>
        )}
      </div>

      {listLoading ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)', fontSize: '0.95rem' }}>
          Cargando tus títulos...
        </div>
      ) : (
        <ListManager
          user={user}
          items={items}
          onChangeSentiment={handleChangeSentiment}
          onDeleteItem={handleDeleteItem}
          search={search}
          filterCategory={filterCategory}
          filterSentiment={filterSentiment}
        />
      )}
    </div>
  );
}
