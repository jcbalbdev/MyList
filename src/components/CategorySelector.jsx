import React, { useState } from 'react';
import { CATEGORIES } from '../config/constants.js';

export default function CategorySelector({ onAddTitle }) {
  const [selectedCat, setSelectedCat] = useState(null);
  const [titleName, setTitleName] = useState('');

  const handleAdd = (e) => {
    e.preventDefault();
    if (!titleName.trim() || !selectedCat) return;
    onAddTitle({ title: titleName.trim(), category: selectedCat });
    setTitleName('');
    setSelectedCat(null);
  };

  return (
    <div style={{ marginBottom: '2rem' }}>
      <h2 style={{ marginBottom: '1rem', fontWeight: 600 }}>¿Qué agregamos hoy?</h2>
      {!selectedCat ? (
        <div className="category-grid">
          {Object.values(CATEGORIES).map((cat) => (
            <button
              key={cat.id}
              className="category-btn"
              onClick={() => setSelectedCat(cat.id)}
              style={{
                background: cat.color,
                boxShadow: `0 6px 24px ${cat.color}55`
              }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = `0 10px 30px ${cat.color}88`; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = `0 6px 24px ${cat.color}55`; }}
            >
              {cat.label}
            </button>
          ))}
        </div>
      ) : (
        <form onSubmit={handleAdd} className="glass-panel" style={{ padding: '1.5rem', display: 'flex', gap: '1rem', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ color: CATEGORIES[Object.keys(CATEGORIES).find(k => CATEGORIES[k].id === selectedCat)].color, fontWeight: 'bold' }}>
              {CATEGORIES[Object.keys(CATEGORIES).find(k => CATEGORIES[k].id === selectedCat)].label}
            </span>
            <button type="button" onClick={() => setSelectedCat(null)} style={{ background: 'transparent', color: 'var(--text-muted)' }}>Cancelar</button>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <input
              type="text"
              value={titleName}
              onChange={(e) => setTitleName(e.target.value)}
              placeholder="Escribe el título aquí..."
              autoFocus
              style={{
                flex: 1, padding: '0.8rem 1rem', borderRadius: '8px',
                border: '1px solid var(--glass-border)', background: 'var(--bg-color)', color: 'var(--text-main)', outline: 'none'
              }}
            />
            <button type="submit" style={{ padding: '0 1.5rem', borderRadius: '8px', background: 'var(--text-main)', color: 'var(--bg-color)', fontWeight: 'bold' }}>
              Agregar
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
