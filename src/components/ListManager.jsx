import React, { useState } from 'react';
import { CATEGORIES, SENTIMENTS, USERS } from '../config/constants.js';
import SentimentSelect from './SentimentSelect.jsx';

export default function ListManager({ user, items, onChangeSentiment, onDeleteItem, search = '', filterCategory = '', filterSentiment = '' }) {
  const [activeTab, setActiveTab] = useState('mine');
  const partnerName = user === USERS.USER_A ? USERS.USER_B : USERS.USER_A;

  const filteredItems = items.filter(item => {
    // Filtro por pestaña
    if (activeTab === 'mine'  && item.createdBy !== user)        return false;
    if (activeTab === 'other' && item.createdBy !== partnerName) return false;
    // Filtro por búsqueda de texto
    if (search && !item.title.toLowerCase().includes(search.toLowerCase())) return false;
    // Filtro por categoría
    if (filterCategory && item.category !== filterCategory) return false;
    // Filtro por sentimiento (del usuario activo)
    if (filterSentiment && (item.sentiments[user] || 'PENDING') !== filterSentiment) return false;
    return true;
  });


  // Estilos dinámicos de los tabs (solo los valores que cambian con activeTab)
  const getTabStyle = (tab) => ({
    background: 'transparent',
    color: activeTab === tab ? 'var(--text-main)' : 'var(--text-muted)',
    borderBottom: activeTab === tab ? '2px solid var(--text-main)' : '2px solid transparent',
    fontWeight: activeTab === tab ? 600 : 400,
  });

  // Base visual compartida entre chip (solo lectura) y select (editable)
  const sentimentBase = {
    padding: '5px 10px',
    borderRadius: '6px',
    fontSize: '0.85rem',
    whiteSpace: 'nowrap',
    lineHeight: '1.5',
    height: '30px',
    width: '160px',
    boxSizing: 'border-box',
    background: 'rgba(255,255,255,0.85)',
    color: '#37352f',
    border: 'none',
  };

  const chipStyle  = { ...sentimentBase, display: 'inline-flex', alignItems: 'center', cursor: 'default' };
  const selectStyle = {
    ...sentimentBase,
    display: 'inline-block',
    cursor: 'pointer',
    appearance: 'none',
    WebkitAppearance: 'none',
    MozAppearance: 'none',
    outline: 'none',
  };

  // ── Renderiza la sección de sentimientos según la pestaña activa ──────────
  const renderSentimentSection = (item) => {
    const mySentimentKey      = item.sentiments[user]        || 'PENDING';
    const partnerSentimentKey = item.sentiments[partnerName] || 'PENDING';

    if (activeTab === 'mine') {
      return (
        <>
          <SentimentSelect
            value={mySentimentKey}
            onChange={(val) => onChangeSentiment(item.id, val)}
            style={selectStyle}
          />
          <button
            onClick={() => onDeleteItem(item.id)}
            title="Eliminar título"
            style={{ background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: '6px', padding: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'background 0.15s ease' }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.4)'}
            onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.2)'}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </>
      );
    }

    if (activeTab === 'other') {
      return <div style={chipStyle}>{SENTIMENTS[partnerSentimentKey]?.label}</div>;
    }

    // Compartida: el propio sentimiento es editable, el de la pareja es solo lectura
    return (
      <div className="sentiment-wrap-shared">
        <div className="sentiment-row">
          <span style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.85)', fontWeight: 500 }}>{user}:</span>
          <SentimentSelect
            value={mySentimentKey}
            onChange={(val) => onChangeSentiment(item.id, val)}
            style={selectStyle}
          />
        </div>
        <div className="sentiment-row">
          <span style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.85)', fontWeight: 500 }}>{partnerName}:</span>
          <div style={chipStyle}>{SENTIMENTS[partnerSentimentKey]?.label}</div>
        </div>
      </div>
    );
  };

  return (
    <div className="glass-panel" style={{ padding: '1rem', minHeight: '40vh' }}>
      {/* Tabs */}
      <div className="tab-bar">
        <button className="tab-btn" onClick={() => setActiveTab('mine')}   style={getTabStyle('mine')}>Mi Lista</button>
        <button className="tab-btn" onClick={() => setActiveTab('other')}  style={getTabStyle('other')}>Lista de {partnerName}</button>
        <button className="tab-btn" onClick={() => setActiveTab('shared')} style={getTabStyle('shared')}>Compartida</button>
      </div>

      {/* Lista de ítems */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {filteredItems.length === 0 && (
          <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>
            No hay títulos aquí aún.
          </p>
        )}

        {filteredItems.map(item => {
          const catObj = Object.values(CATEGORIES).find(c => c.id === item.category);
          return (
            <div
              key={item.id}
              className="list-card"
              style={{ background: catObj?.color || 'var(--bg-surface)' }}
            >
              <div className="list-card-info">
                <h4>{item.title}</h4>
                <span>{catObj?.label} · Subido por {item.createdBy}</span>
              </div>
              <div className="sentiment-wrap">
                {renderSentimentSection(item)}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
