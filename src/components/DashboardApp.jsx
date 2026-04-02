import React, { useEffect, useState } from 'react';
import CategorySelector from './CategorySelector.jsx';
import ListManager from './ListManager.jsx';
import ErrorBanner from './ErrorBanner.jsx';
import { USERS, STORAGE_KEYS } from '../config/constants.js';
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
  const [user, setUser]           = useState(null);
  const [items, setItems]         = useState(() => loadCache() || []);
  const [listLoading, setListLoading] = useState(!loadCache());
  const [error, setError]         = useState(null);

  // ── Identificar usuario ───────────────────────────────────────────────────
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
    if (!stored) {
      window.location.href = '/';
    } else {
      setUser(stored);
    }
  }, []);

  // ── Stale-While-Revalidate: refresca en background ────────────────────────
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

      {/* Selector siempre disponible, sin bloqueo por carga */}
      <CategorySelector onAddTitle={handleAddTitle} />

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
        />
      )}
    </div>
  );
}
